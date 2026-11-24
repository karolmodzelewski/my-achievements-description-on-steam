# Run by the backend through PowerShell, the path comes from the environment to avoid quoting it
$ErrorActionPreference = 'Stop'

$SPI_SETDESKWALLPAPER = 20
$SPIF_UPDATEINIFILE = 1
$SPIF_SENDWININICHANGE = 2

Add-Type -TypeDefinition @'
using System.Runtime.InteropServices;

public static class MadosDesktop {
    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern bool SystemParametersInfo(int action, int parameter, string value, int flags);
}
'@

if (-not [MadosDesktop]::SystemParametersInfo($SPI_SETDESKWALLPAPER, 0, $env:MADOS_WALLPAPER_PATH, $SPIF_UPDATEINIFILE -bor $SPIF_SENDWININICHANGE)) {
    throw 'SystemParametersInfo failed'
}
