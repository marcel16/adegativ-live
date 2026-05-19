' Pairing screen component
sub ShowPairingScreen()
    port = CreateObject("roMessagePort")

    canvas = CreateObject("roImageCanvas")
    canvas.SetMessagePort(port)
    canvas.SetLayer(0, {
        Color: "#0f172a",
        CompositionMode: "Source"
    })

    ' Initial display
    canvas.Show()
    canvas.AllowUpdates(false)

    ' Create API client
    api = InitApiClient("http://YOUR_SERVER_IP:8080")

    ' Generate pairing code
    result = api.generateCode()
    if result = invalid then
        ' Show error, retry after delay
        return
    end if

    deviceToken = result.deviceToken
    pairingCode = result.code
    tvDeviceId = result.tvDeviceId

    ' Store for later use
    m.global = GetGlobalAA()
    m.global.deviceToken = deviceToken
    m.global.tvDeviceId = tvDeviceId
    m.global.pairingCode = pairingCode

    ' Display code on canvas
    UpdatePairingDisplay(canvas, pairingCode)

    ' Poll for pairing
    timer = CreateObject("roTimer")
    timer.SetPort(port)
    timer.SetElapsed(0, 5000) ' every 5 seconds

    pollCount = 0
    while pollCount < 120 ' 10 minutes timeout
        msg = wait(5000, port)
        if type(msg) = "roTimerEvent" then
            pollCount = pollCount + 1
            status = api.checkPairing(deviceToken)
            if status <> invalid and status.code <> 404 then
                ' Paired successfully!
                canvas.Close()
                ShowPlayerScreen()
                return
            end if
            timer.SetElapsed(0, 5000)
        end if
    end while

    ' Code expired
    canvas.Close()
end sub

sub UpdatePairingDisplay(canvas as object, code as string)
    canvas.SetLayer(1, {
        Text: "AdegaTV Live",
        TextAttrs: {
            Color: "#22c55e",
            Font: "large",
            HAlign: "HCenter",
            VAlign: "Center"
        },
        TargetRect: { x: 0, y: 100, w: 1280, h: 80 }
    })
    canvas.SetLayer(2, {
        Text: "Codigo de Pareamento: " + code,
        TextAttrs: {
            Color: "#ffffff",
            Font: "xlarge",
            HAlign: "HCenter",
            VAlign: "Center"
        },
        TargetRect: { x: 0, y: 300, w: 1280, h: 120 }
    })
    canvas.SetLayer(3, {
        Text: "Acesse o painel e insira este codigo",
        TextAttrs: {
            Color: "#94a3b8",
            Font: "medium",
            HAlign: "HCenter",
            VAlign: "Center"
        },
        TargetRect: { x: 0, y: 440, w: 1280, h: 60 }
    })
    canvas.AllowUpdates(true)
end sub
