param(
    [string]$BaseUrl = "http://localhost:5000"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting API tests for $BaseUrl"
Write-Host "--------------------------------------"

function Test-Endpoint {
    param(
        [Parameter(Mandatory = $true)][string]$Method,
        [Parameter(Mandatory = $true)][string]$Url,
        [string]$Data
    )

    Write-Host ""
    Write-Host "➡️  Testing $Method $Url"

    $status = 0
    $body   = ""

    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri ($BaseUrl + $Url) -Method Get -UseBasicParsing
        }
        else {
            $response = Invoke-WebRequest -Uri ($BaseUrl + $Url) `
                                          -Method $Method `
                                          -Body $Data `
                                          -ContentType "application/json" `
                                          -UseBasicParsing
        }

        $status = [int]$response.StatusCode
        $body   = $response.Content
    }
    catch {
        # Try to extract status and body if the server actually responded
        if ($_.Exception.Response -ne $null) {
            try { $status = [int]$_.Exception.Response.StatusCode } catch {}
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $body   = $reader.ReadToEnd()
                $reader.Dispose()
            } catch {}
        }
        else {
            $status = 0
            $body   = ""
        }
    }

    if ($status -ge 200 -and $status -lt 300) {
        Write-Host ("✅ Success ({0})" -f $status) -ForegroundColor Green
    }
    else {
        Write-Host ("❌ Failed ({0})" -f $status) -ForegroundColor Red
    }

    if ($body -and $body.Trim().Length -gt 0) {
        # Try jq for pretty-print; fall back to raw on error / missing jq
        try {
            $body | & jq .
        }
        catch {
            Write-Host $body
        }
    }
}

# 1. Root route
Test-Endpoint -Method "GET"  -Url "/"

# 2. Get all channels
Test-Endpoint -Method "GET"  -Url "/api/channels"

# 3. Get single channel (1)
Test-Endpoint -Method "GET"  -Url "/api/channels/1"

# 4. Create new channel
Test-Endpoint -Method "POST" -Url "/api/channels" -Data '{"name":"test","description":"testing channel"}'

# 5. Get messages for channel 1
Test-Endpoint -Method "GET"  -Url "/api/messages/1"

# 6. Send new message
Test-Endpoint -Method "POST" -Url "/api/messages" -Data '{"channelId":1,"author":"Tester","content":"Hello via curl"}'

Write-Host ""
Write-Host "--------------------------------------"
Write-Host "All tests executed." -ForegroundColor Green
