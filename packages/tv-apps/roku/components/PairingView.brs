' PairingView BrightScript
sub init()
    m.codeLabel = m.top.findNode("codeLabel")
    m.statusLabel = m.top.findNode("statusLabel")
    m.top.observeField("code", "onCodeChanged")
    m.top.observeField("status", "onStatusChanged")
end sub

sub onCodeChanged()
    m.codeLabel.text = m.top.code
end sub

sub onStatusChanged()
    m.statusLabel.text = m.top.status
end sub
