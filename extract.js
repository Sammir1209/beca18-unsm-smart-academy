const fs = require('fs');
const zlib = require('zlib');

// Open docx as zip and extract word/document.xml
const AdmZip = (function() {
  try {
    return require('adm-zip');
  } catch(e) {
    return null;
  }
})();

async function extractDocx() {
  const { execSync } = require('child_process');
  const psScript = `
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
    $c = [System.Text.RegularExpressions.Regex]::Replace($c, '\\s+', ' ')
    [System.IO.File]::WriteAllText('public/data/cultura_extracted.txt', $c, [System.Text.Encoding]::UTF8)
  `;
  fs.writeFileSync('extract.ps1', psScript);
  execSync('powershell -ExecutionPolicy Bypass -File extract.ps1');
  const txt = fs.readFileSync('public/data/cultura_extracted.txt', 'utf8');
  console.log('EXTRACTED LENGTH:', txt.length);
  console.log('SAMPLE:', txt.substring(0, 1500));
}

extractDocx();
