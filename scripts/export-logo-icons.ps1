# Renders crisp Planora logo PNGs (matches public/logo.svg design)
Add-Type -AssemblyName System.Drawing

function Get-RoundedRectPath {
  param([int]$X, [int]$Y, [int]$W, [int]$H, [int]$R)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Export-PlanoraIcon {
  param([int]$Size, [string]$Path)

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  $s = $Size / 32.0
  $indigo = [System.Drawing.Color]::FromArgb(255, 99, 102, 241)
  $white = [System.Drawing.Color]::White
  $teal = [System.Drawing.Color]::FromArgb(255, 20, 184, 166)

  $radius = [Math]::Max(2, [int](8 * $s))
  $brush = New-Object System.Drawing.SolidBrush $indigo
  $rectPath = Get-RoundedRectPath -X 0 -Y 0 -W ($Size - 1) -H ($Size - 1) -R $radius
  $g.FillPath($brush, $rectPath)
  $brush.Dispose()
  $rectPath.Dispose()

  $strokeWhite = [float][Math]::Max(1.5, 2 * $s)
  $strokeTeal = [float][Math]::Max(2, 2.5 * $s)
  $penWhite = New-Object System.Drawing.Pen($white, $strokeWhite)
  $penWhite.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penWhite.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penWhite.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $penTeal = New-Object System.Drawing.Pen($teal, $strokeTeal)
  $penTeal.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penTeal.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penTeal.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  $g.DrawLine($penWhite, 10 * $s, 13 * $s, 22 * $s, 13 * $s)
  $g.DrawLine($penWhite, 10 * $s, 13 * $s, 10 * $s, 24 * $s)
  $g.DrawLine($penWhite, 22 * $s, 13 * $s, 22 * $s, 24 * $s)
  $g.DrawLine($penWhite, 10 * $s, 24 * $s, 22 * $s, 24 * $s)
  $g.DrawLine($penWhite, 13 * $s, 10 * $s, 13 * $s, 13 * $s)
  $g.DrawLine($penWhite, 19 * $s, 10 * $s, 19 * $s, 13 * $s)
  $g.DrawLine($penTeal, 12 * $s, 20 * $s, 15 * $s, 23 * $s)
  $g.DrawLine($penTeal, 15 * $s, 23 * $s, 21 * $s, 13 * $s)

  $penWhite.Dispose()
  $penTeal.Dispose()
  $g.Dispose()

  $dir = Split-Path $Path -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$pub = Join-Path $PSScriptRoot '..\public'
Export-PlanoraIcon -Size 32 -Path (Join-Path $pub 'favicon-32.png')
Export-PlanoraIcon -Size 64 -Path (Join-Path $pub 'logo-64.png')
Export-PlanoraIcon -Size 128 -Path (Join-Path $pub 'logo.png')
Export-PlanoraIcon -Size 72 -Path (Join-Path $pub 'icons\icon-72.png')
Export-PlanoraIcon -Size 192 -Path (Join-Path $pub 'icons\icon-192.png')
Export-PlanoraIcon -Size 512 -Path (Join-Path $pub 'icons\icon-512.png')
Copy-Item (Join-Path $pub 'icons\icon-192.png') (Join-Path $pub 'favicon.ico') -Force
Write-Host 'Logo icons exported.'
