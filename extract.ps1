Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('public/data/CULTURA GENERAL 2026 I.docx')
$e = $z.GetEntry('word/document.xml')
$s = $e.Open()
$r = New-Object System.IO.StreamReader($s)
$x = $r.ReadToEnd()
$r.Close()
$s.Close()
$z.Dispose()
$c = [System.Text.RegularExpressions.Regex]::Replace($x, '<[^>]+>', ' ')
$c = [System.Text.RegularExpressions.Regex]::Replace($c, '\s+', ' ')
[System.IO.File]::WriteAllText('public/data/cultura_extracted.txt', $c, [System.Text.Encoding]::UTF8)
Write-Output "EXTRACTED: $($c.Length) characters"
Write-Output $c.Substring(0, 1500)
