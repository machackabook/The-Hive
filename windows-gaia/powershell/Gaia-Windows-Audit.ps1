[CmdletBinding()]
param(
    [ValidateSet('inventory','repository-audit','network-audit','sentinel-status','telemetry-status','sync-status')]
    [string]$Command = 'inventory'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$OutDir = Join-Path $Root 'reports'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Write-Result($Name, $Data) {
    $Path = Join-Path $OutDir "$Name-$Stamp.json"
    $Data | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 $Path
    Write-Output $Path
}

switch ($Command) {
    'inventory' {
        $data = [ordered]@{
            timestamp = (Get-Date).ToUniversalTime().ToString('o')
            computer = $env:COMPUTERNAME
            os = Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,LastBootUpTime
            cpu = Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors
            memory = Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
            disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID,FileSystem,Size,FreeSpace
            adapters = Get-NetAdapter | Select-Object Name,Status,LinkSpeed,MacAddress
            git = if (Get-Command git -ErrorAction SilentlyContinue) { git --version } else { 'not-installed' }
            gh = if (Get-Command gh -ErrorAction SilentlyContinue) { gh --version | Select-Object -First 1 } else { 'not-installed' }
        }
        Write-Result 'inventory' $data
    }
    'repository-audit' {
        $hits = @()
        Get-ChildItem -Force -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\' } |
            ForEach-Object {
                if ($_.Name -match '^\.' -or $_.Extension -match '^\.(exe|dll|bin|iso|img|sys|msi|pdb)$') {
                    $hits += [pscustomobject]@{ Path=$_.FullName; Length=$_.Length; Type=$_.Extension }
                }
            }
        Write-Result 'repository-audit' ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o'); findings=$hits})
    }
    'network-audit' {
        $data = [ordered]@{
            timestamp=(Get-Date).ToUniversalTime().ToString('o')
            adapters=Get-NetAdapter | Select-Object Name,Status,LinkSpeed
            ip=Get-NetIPConfiguration | Select-Object InterfaceAlias,IPv4Address,IPv6Address,DNSServer,IPv4DefaultGateway
            routes=Get-NetRoute -AddressFamily IPv4 | Select-Object DestinationPrefix,NextHop,RouteMetric,InterfaceAlias
            proxy=(netsh winhttp show proxy | Out-String).Trim()
        }
        Write-Result 'network-audit' $data
    }
    'sentinel-status' {
        $services = Get-Service | Where-Object { $_.Name -match 'Gaia|Sentinel' } | Select-Object Name,Status,StartType
        Write-Result 'sentinel-status' ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o'); services=$services})
    }
    'telemetry-status' {
        $queue = Join-Path $Root 'telemetry/queue'
        $items = if (Test-Path $queue) { Get-ChildItem $queue -File } else { @() }
        Write-Result 'telemetry-status' ([ordered]@{timestamp=(Get-Date).ToUniversalTime().ToString('o'); count=$items.Count; oldest=($items | Sort-Object LastWriteTime | Select-Object -First 1).Name})
    }
    'sync-status' {
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'git is required' }
        $data = [ordered]@{ branch=(git branch --show-current); commit=(git rev-parse HEAD); status=(git status --short); remote=(git remote -v) }
        Write-Result 'sync-status' $data
    }
}
