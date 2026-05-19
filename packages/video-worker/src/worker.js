const { Worker } = require('bullmq');
const Redis = require('ioredis');
const Minio = require('minio');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const os = require('os');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'adegatv',
  secretKey: process.env.MINIO_SECRET_KEY || 'adegatv123',
});

const BUCKET = process.env.MINIO_BUCKET || 'adegatv-media';
const tmpDir = path.join(os.tmpdir(), 'adegatv-video-worker');

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) await minioClient.makeBucket(BUCKET);
}

const worker = new Worker(
  'video-processing',
  async (job) => {
    const { mediaId, inputPath, formats, options } = job.data;
    console.log(`Processing video ${mediaId}...`);

    const outputDir = path.join(tmpDir, mediaId);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputs = [];

    for (const format of formats || ['mp4']) {
      const outputFile = path.join(outputDir, `${mediaId}_${format}.${format}`);
      
      await new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
          .output(outputFile)
          .on('end', resolve)
          .on('error', reject);

        if (options?.width && options?.height) {
          command = command.size(`${options.width}x${options.height}`);
        }

        if (format === 'webm') {
          command = command.videoCodec('libvpx').audioCodec('libvorbis');
        } else {
          command = command.videoCodec('libx264').audioCodec('aac');
        }

        command.run();
      });

      // Upload to MinIO
      const objectName = `processed/${mediaId}/${format}/${path.basename(outputFile)}`;
      await minioClient.fPutObject(BUCKET, objectName, outputFile);
      outputs.push({ format, url: `/storage/${BUCKET}/${objectName}` });

      fs.unlinkSync(outputFile);
    }

    // Cleanup
    fs.rmSync(outputDir, { recursive: true, force: true });

    console.log(`Video ${mediaId} processed successfully`);
    return { mediaId, outputs };
  },
  { connection, concurrency: 2 },
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

ensureBucket().then(() => {
  console.log('Video Worker started and ready to process jobs');
  console.log(`Redis: ${REDIS_URL}`);
  console.log(`MinIO bucket: ${BUCKET}`);
});

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
