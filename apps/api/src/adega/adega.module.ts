import { Module } from '@nestjs/common';
import { AdegaService } from './adega.service';
import { AdegaController } from './adega.controller';

@Module({
  controllers: [AdegaController],
  providers: [AdegaService],
  exports: [AdegaService],
})
export class AdegaModule {}
