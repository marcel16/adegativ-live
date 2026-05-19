' Media player screen
sub ShowPlayerScreen()
    port = CreateObject("roMessagePort")
    m.global = GetGlobalAA()
    deviceToken = m.global.deviceToken
    tvDeviceId = m.global.tvDeviceId

    api = InitApiClient("http://YOUR_SERVER_IP:8080")

    videoPlayer = CreateObject("roVideoPlayer")
    videoPlayer.SetMessagePort(port)
    videoPlayer.SetLoop(true)
    videoPlayer.SetPositionNotificationPeriod(1)

    ' Main loop
    mediaIndex = 0
    mediaItems = []
    isBlocked = false

    while true
        ' Fetch playlist
        playlist = api.checkPairing(deviceToken)
        if playlist <> invalid then
            if playlist.blocked = true then
                if isBlocked = false then
                    isBlocked = true
                    videoPlayer.Stop()
                    ShowBlockedScreen()
                end if
            else
                isBlocked = false
                newItems = []
                if playlist.schedule <> invalid and playlist.schedule.Count() > 0 then
                    for each item in playlist.schedule
                        if item.mediaFile <> invalid then
                            newItems.Push({
                                url: item.mediaFile.url,
                                mtype: item.mediaFile.type,
                                duration: item.duration
                            })
                        end if
                    end for
                end if
                if newItems.Count() = 0 and playlist.fallback <> invalid then
                    for each item in playlist.fallback
                        newItems.Push({
                            url: item.url,
                            mtype: item.type,
                            duration: item.duration
                        })
                    end for
                end if

                if newItems.Count() > 0 then
                    mediaItems = newItems
                    if mediaIndex >= mediaItems.Count() then
                        mediaIndex = 0
                    end if
                    PlayMediaAtIndex(videoPlayer, mediaItems, mediaIndex)
                end if
            end if
        end if

        ' Wait for either timer (refresh) or video end
        msg = wait(60000, port)

        if type(msg) = "roVideoPlayerEvent" then
            if msg.isFullResult() or msg.isRequestFailed() then
                mediaIndex = mediaIndex + 1
                if mediaIndex >= mediaItems.Count() then
                    mediaIndex = 0
                end if
                PlayMediaAtIndex(videoPlayer, mediaItems, mediaIndex)
            end if
        end if

        ' Ping every 30s
        api.ping(tvDeviceId)
    end while
end sub

sub PlayMediaAtIndex(player as object, items as object, index as integer)
    if index >= items.Count() then return
    item = items[index]
    if item.mtype = "VIDEO" or item.url.Instr(".mp4") > 0 then
        content = CreateObject("roVideoContent")
        content.SetUrl("http://YOUR_SERVER_IP:8080" + item.url)
        content.StreamFormat = "mp4"
        player.SetContentList([content])
        player.Play()
    end if
end sub

sub ShowBlockedScreen()
    canvas = CreateObject("roImageCanvas")
    port = CreateObject("roMessagePort")
    canvas.SetMessagePort(port)
    canvas.SetLayer(0, {
        Color: "#1a1a1a",
        CompositionMode: "Source"
    })
    canvas.SetLayer(1, {
        Text: "Assinatura Vencida",
        TextAttrs: {
            Color: "#ef4444",
            Font: "xlarge",
            HAlign: "HCenter",
            VAlign: "Center"
        },
        TargetRect: { x: 0, y: 300, w: 1280, h: 80 }
    })
    canvas.SetLayer(2, {
        Text: "Renove seu plano para continuar exibindo",
        TextAttrs: {
            Color: "#94a3b8",
            Font: "medium",
            HAlign: "HCenter",
            VAlign: "Center"
        },
        TargetRect: { x: 0, y: 400, w: 1280, h: 60 }
    })
    canvas.Show()
    m.global.blockedCanvas = canvas
end sub
