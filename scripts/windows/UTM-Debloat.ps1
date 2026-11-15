# UTM Windows 11 ARM - Minimal Debloat
# Conserva: Windows Update, Store, Defender, red, audio, drivers y componentes del sistema.
# Ejecutar desde PowerShell elevado. Compatible con Windows PowerShell 5.1.
# No reduce automaticamente el archivo QCOW2.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Continue'
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error 'Abre PowerShell como Administrador y vuelve a ejecutarlo.'
    exit 1
}

$logDir = Join-Path $env:ProgramData 'UTM-Minimal'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$log = Join-Path $logDir ('debloat-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
Start-Transcript -Path $log -Force | Out-Null
Write-Host 'UTM Windows 11 ARM: Debloat seguro' -ForegroundColor Cyan
Write-Host 'No se borraran archivos personales ni drivers.'

# No eliminar paquetes de sistema, Windows Store, WebView2, Windows Security o Windows Update.
$packages = @(
  'Microsoft.BingNews', 'Microsoft.BingWeather', 'Microsoft.GetHelp',
  'Microsoft.Getstarted', 'Microsoft.MicrosoftSolitaireCollection',
  'Microsoft.People', 'Microsoft.WindowsFeedbackHub',
  'Microsoft.YourPhone', 'Microsoft.ZuneMusic', 'Microsoft.ZuneVideo',
  'Microsoft.WindowsMaps', 'Microsoft.MicrosoftOfficeHub',
  'Microsoft.Todos', 'Microsoft.PowerAutomateDesktop',
  'Microsoft.Clipchamp', 'Clipchamp.Clipchamp',
  'Microsoft.Copilot', 'Microsoft.549981C3F5F10',
  'MicrosoftCorporationII.MicrosoftFamily',
  'MicrosoftCorporationII.QuickAssist',
  'Microsoft.Windows.DevHome', 'Microsoft.OutlookForWindows',
  'MSTeams', 'MicrosoftTeams', 'Microsoft.GamingApp',
  'Microsoft.Xbox.TCUI', 'Microsoft.XboxApp',
  'Microsoft.XboxGamingOverlay', 'Microsoft.XboxGameOverlay',
  'Microsoft.XboxIdentityProvider', 'Microsoft.XboxSpeechToTextOverlay'
)
Write-Host '[1/4] Desinstalando apps opcionales...' -ForegroundColor Cyan
$provisioned = @(Get-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue)
foreach ($name in $packages) {
    $installed = @(Get-AppxPackage -Name $name -ErrorAction SilentlyContinue)
    foreach ($app in $installed) {
        try {
            Write-Host ('  Quitando: ' + $app.Name)
            Remove-AppxPackage -Package $app.PackageFullName -ErrorAction Stop
        } catch { Write-Warning ('  No se pudo quitar ' + $app.Name + ': ' + $_.Exception.Message) }
    }
    foreach ($app in @($provisioned | Where-Object { $_.DisplayName -eq $name })) {
        try {
            Remove-AppxProvisionedPackage -Online -PackageName $app.PackageName -ErrorAction Stop | Out-Null
        } catch { Write-Warning ('  No se pudo desprovisionar ' + $name + ': ' + $_.Exception.Message) }
    }
}

function Set-Dword([string]$Path,[string]$Name,[int]$Value) {
    try {
        New-Item -Path $Path -Force -ErrorAction Stop | Out-Null
        New-ItemProperty -Path $Path -Name $Name -PropertyType DWord -Value $Value -Force -ErrorAction Stop | Out-Null
    } catch { Write-Warning ('  Preferencia omitida: ' + $Name) }
}
Write-Host '[2/4] Desactivando widgets, anuncios y sugerencias...' -ForegroundColor Cyan
$adv = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced'
Set-Dword $adv 'TaskbarDa' 0
Set-Dword $adv 'ShowTaskViewButton' 0
$cdm = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager'
@('ContentDeliveryAllowed','OemPreInstalledAppsEnabled','PreInstalledAppsEnabled',
  'SilentInstalledAppsEnabled','SoftLandingEnabled','SystemPaneSuggestionsEnabled',
  'SubscribedContent-338388Enabled','SubscribedContent-338389Enabled',
  'SubscribedContent-353694Enabled','SubscribedContent-353696Enabled') |
  ForEach-Object { Set-Dword $cdm $_ 0 }

Write-Host '[3/4] Reduciendo efectos visuales y grabacion de juegos...' -ForegroundColor Cyan
Set-Dword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' 'VisualFXSetting' 2
Set-Dword 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize' 'EnableTransparency' 0
Set-Dword 'HKCU:\System\GameConfigStore' 'GameDVR_Enabled' 0

Write-Host '[4/4] Desactivando solo servicios secundarios...' -ForegroundColor Cyan
# No tocar SysMain, Windows Search, Defender, Update, red ni servicios VirtIO.
foreach ($svcName in @('MapsBroker','Fax','RetailDemo','XblAuthManager','XblGameSave','XboxNetApiSvc','XboxGipSvc')) {
    $svc = Get-Service -Name $svcName -ErrorAction SilentlyContinue
    if ($null -ne $svc) {
        try {
            Stop-Service -Name $svcName -ErrorAction SilentlyContinue
            Set-Service -Name $svcName -StartupType Disabled -ErrorAction Stop
            Write-Host ('  Desactivado: ' + $svcName)
        } catch { Write-Warning ('  No se pudo desactivar: ' + $svcName) }
    }
}
Write-Host ('Listo. Registro: ' + $log) -ForegroundColor Green
Write-Host 'Reinicia Windows cuando finalice. Windows Update, Store, Defender y drivers intactos.'
Stop-Transcript | Out-Null
