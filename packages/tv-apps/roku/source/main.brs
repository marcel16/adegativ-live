' AdegaTV Live - Roku Channel
' Entry point

sub Main()
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    scene = screen.CreateScene("MainScene")
    screen.show()

    ' Start the pairing flow
    m.global = screen.getGlobalNode()
    m.global.id = "MainScene"
    m.global.addFields({serverUrl: "http://YOUR_SERVER_IP:8080"})

    while(true)
        msg = wait(0, m.port)
        if msg <> invalid then
            if type(msg) = "roSGScreenEvent" then
                if msg.isScreenClosed() then
                    exit while
                end if
            end if
        end if
    end while
end sub
