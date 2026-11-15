# Windows 11 ARM - UTM Lite Lite (Phase 2)
# PowerShell 5.1, elevated. Does not touch Defender, Store, Windows Update, drivers or pagefile.
# WARNING: run only after Rclone synchronizes and macOS has ample free space.
$ErrorActionPreference = 'Continue'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$p = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error 'Se requiere PowerShell como administrador.'
    exit 1
}
$root = Join-Path $env:ProgramData 'UTM-Minimal'
New-Item -Path $root -ItemType Directory -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
Start-Transcript -Path (Join-Path $root "lite-lite-$stamp.log") -Force | Out-Null
Write-Host 'WINDOWS ARM UTM - LITE LITE / FASE 2' -ForegroundColor Cyan
Write-Host 'Se conservaran seguridad, actualizaciones, Microsoft Store, red, VirtIO y SPICE.'
Write-Host 'Copia de claves del registro para reversion:'
$keys = @(
 'HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced',
 'HKCU\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager',
 'HKCU\Software\Microsoft\Windows\CurrentVersion\Search',
 'HKCU\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications',
 'HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize',
 'HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search',
 'HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection',
 'HKLM\SOFTWARE\Policies\Microsoft\Windows\CloudContent'
)
$i = 0
foreach ($key in $keys) {
 $i++
 try { & reg.exe export $key (Join-Path $root "backup-$stamp-$i.reg") /y 2>$null | Out-Null } catch {}
}
function PutDword([string]$path,[string]$name,[int]$value) {
 try {
    New-Item -Path $path -Force -ErrorAction Stop | Out-Null
    New-ItemProperty -Path $path -Name $name -Value $value -PropertyType DWord -Force -ErrorAction Stop | Out-Null
 } catch { Write-Warning "No se pudo configurar $name : $($_.Exception.Message)" }
}
Write-Host '[1/5] Privacidad, sugerencias, widgets y busqueda web...'
$searchPolicy = 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search'
PutDword $searchPolicy 'EnableDynamicContentInWSB' 0
PutDword $searchPolicy 'AllowSearchToUseLocation' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Search' 'BingSearchEnabled' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Search' 'SearchboxTaskbarMode' 0
PutDword 'HKCU:\Software\Policies\Microsoft\Windows\Explorer' 'DisableSearchBoxSuggestions' 1
PutDword 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\CloudContent' 'DisableWindowsConsumerFeatures' 1
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'Start_TrackProgs' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'Start_IrisRecommendations' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'TaskbarDa' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager' 'RotatingLockScreenEnabled' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager' 'RotatingLockScreenOverlayEnabled' 0

Write-Host '[2/5] Aplicaciones en segundo plano, Game DVR y animaciones...'
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications' 'GlobalUserDisabled' 1
PutDword 'HKCU:\Software\Microsoft\GameBar' 'ShowStartupPanel' 0
PutDword 'HKCU:\Software\Microsoft\GameBar' 'AutoGameModeEnabled' 0
PutDword 'HKCU:\System\GameConfigStore' 'GameDVR_Enabled' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' 'EnableTransparency' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' 'VisualFXSetting' 2
PutDword 'HKCU:\Control Panel\Desktop\WindowMetrics' 'MinAnimate' 0
PutDword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'TaskbarAnimations' 0

Write-Host '[3/5] Diagnosticos opcionales y tareas programadas...'
PutDword 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection' 'AllowTelemetry' 1
$tasks = @(
 '\Microsoft\Windows\Application Experience\Microsoft Compatibility Appraiser',
 '\Microsoft\Windows\Application Experience\ProgramDataUpdater',
 '\Microsoft\Windows\Customer Experience Improvement Program\Consolidator',
 '\Microsoft\Windows\Customer Experience Improvement Program\UsbCeip',
 '\Microsoft\Windows\Maps\MapsUpdateTask'
)
$disabled = @()
foreach ($full in $tasks) {
 try {
    $idx = $full.LastIndexOf('\')
    $path = $full.Substring(0,$idx+1)
    $name = $full.Substring($idx+1)
    $task = Get-ScheduledTask -TaskPath $path -TaskName $name -ErrorAction SilentlyContinue
    if ($task -and $task.State -ne 'Disabled') {
       Disable-ScheduledTask -TaskPath $path -TaskName $name -ErrorAction Stop | Out-Null
       $disabled += $full
       Write-Host "  Desactivada: $full"
    }
 } catch { Write-Warning "Tarea omitida: $full" }
}
$disabled | Set-Content -Path (Join-Path $root "disabled-tasks-$stamp.txt")
foreach ($service in @('DiagTrack','dmwappushservice','MapsBroker','RemoteRegistry','RetailDemo','Fax','WMPNetworkSvc')) {
 try {
    $svc = Get-Service -Name $service -ErrorAction SilentlyContinue
    if ($svc) {
        Stop-Service -Name $service -ErrorAction SilentlyContinue
        Set-Service -Name $service -StartupType Disabled -ErrorAction Stop
        Write-Host "  Servicio desactivado: $service"
    }
 } catch { Write-Warning "Servicio omitido: $service" }
}

Write-Host '[4/5] Limpieza de apps opcionales restantes...'
$names = @(
 'Microsoft.WindowsAlarms', 'Microsoft.WindowsSoundRecorder',
 'Microsoft.MicrosoftStickyNotes', 'Microsoft.ScreenSketch',
 'Microsoft.Paint', 'Microsoft.3DBuilder',
 'Microsoft.MixedReality.Portal', 'Microsoft.WindowsCamera',
 'Microsoft.Windows.Photos', 'Microsoft.HEIFImageExtension',
 'Microsoft.WebMediaExtensions', 'Microsoft.WebpImageExtension',
 'Microsoft.VP9VideoExtensions', 'Microsoft.AV1VideoExtension',
 'MicrosoftCorporationII.MicrosoftFamily', 'MicrosoftTeams',
 'MSTeams', 'Microsoft.OutlookForWindows'
)
# Conservar Photos, Paint, recortes, codecs y herramientas de compatibilidad.
$names = $names | Where-Object { $_ -notin @(
 'Microsoft.ScreenSketch','Microsoft.Paint','Microsoft.Windows.Photos',
 'Microsoft.HEIFImageExtension','Microsoft.WebMediaExtensions',
 'Microsoft.WebpImageExtension','Microsoft.VP9VideoExtensions','Microsoft.AV1VideoExtension') }
$provisioned = @(Get-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue)
foreach ($name in $names) {
 foreach ($pkg in @(Get-AppxPackage -Name $name -ErrorAction SilentlyContinue)) {
   try {
     Remove-AppxPackage -Package $pkg.PackageFullName -ErrorAction Stop
     Write-Host "  Eliminada: $($pkg.Name)"
   } catch { Write-Warning "App protegida u omitida: $name" }
 }
 foreach ($pkg in @($provisioned | Where-Object { $_.DisplayName -eq $name })) {
   try { Remove-AppxProvisionedPackage -Online -PackageName $pkg.PackageName -ErrorAction Stop | Out-Null }
   catch { Write-Warning "No se pudo desprovisionar: $name" }
 }
}

Write-Host '[5/5] Terminado.' -ForegroundColor Green
Write-Host "Logs y respaldo del registro: $root"
Write-Host 'No se elimino OneDrive automaticamente para proteger carpetas sincronizadas.'
Write-Host 'No se tocaron Windows Update, Defender, Microsoft Store, WebView2, red, drivers ni pagefile.'
Write-Host 'Reinicia Windows cuando el disco y Rclone esten estables.'
Stop-Transcript | Out-Null
