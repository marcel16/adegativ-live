' API client for AdegaTV backend
function InitApiClient(serverUrl as string) as object
    this = {}
    this.serverUrl = serverUrl

    this.generateCode = function() as object
        url = CreateObject("roUrlTransfer")
        url.SetCertificatesFile("common:/certs/ca-certificates.crt")
        url.InitClientCertificates()
        url.SetUrl(m.serverUrl + "/api/tv/pairing/generate")
        url.SetRequest("POST")
        url.AddHeader("Content-Type", "application/json")
        body = { platform: "ROKU", model: "Roku Device" }
        response = url.PostFromString(formatJson(body))
        if response <> invalid then
            return ParseJson(response)
        end if
        return invalid
    end function

    this.checkPairing = function(deviceToken as string) as object
        url = CreateObject("roUrlTransfer")
        url.SetCertificatesFile("common:/certs/ca-certificates.crt")
        url.InitClientCertificates()
        url.SetUrl(m.serverUrl + "/api/tv/playlist/" + deviceToken)
        response = url.GetToString()
        if response <> invalid then
            return ParseJson(response)
        end if
        return invalid
    end function

    this.ping = function(tvId as string) as boolean
        url = CreateObject("roUrlTransfer")
        url.SetCertificatesFile("common:/certs/ca-certificates.crt")
        url.InitClientCertificates()
        url.SetUrl(m.serverUrl + "/api/tv/" + tvId + "/ping")
        url.SetRequest("POST")
        response = url.PostFromString("")
        return response <> invalid
    end function

    return this
end function
