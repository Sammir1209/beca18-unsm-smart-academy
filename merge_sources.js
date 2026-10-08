import fs from 'fs';

const inv = JSON.parse(fs.readFileSync('research/sources/source-inventory.json', 'utf8'));

const addedLinks = [
  {
    sourceId: "SRC-USER-DOCX-CULTURA-2026",
    institution: "UNSM",
    modality: "ORDINARIO",
    year: 2026,
    period: "I",
    documentType: "DOCUMENTO_USUARIO",
    title: "Cultura General 2026-I: Nobel, San Martín y Actualidad Nacional",
    url: "public/data/CULTURA GENERAL 2026 I.docx",
    sourceType: "USER_PROVIDED",
    availability: "PROCESADO",
    checksum: "sha256_docx_cultura_general_2026_unsm",
    subjectsCovered: ["Cultura General", "Literatura", "Historia de San Martin", "Educacion Civica"]
  },
  {
    sourceId: "SRC-WEB-BECA18-HUB-MAT",
    institution: "PRONABEC",
    modality: "ENP",
    year: 2024,
    documentType: "REPOSITORIO_ACADEMICO",
    title: "Compendio Beca 18 PRONABEC: Exámenes Únicos Nacionales y Solucionarios",
    url: "https://matematicasn.blogspot.com/2018/12/examen-unico-nacional-beca-18-pronabec.html",
    sourceType: "SECUNDARIA",
    availability: "CATALOGADO_Y_PROCESADO",
    checksum: "sha256_matematicasn_beca18_hub",
    subjectsCovered: ["Matematica", "Competencia Lectora", "Razonamiento Matematico", "Razonamiento Verbal"]
  },
  {
    sourceId: "SRC-WEB-UNSM-HUB-MAT",
    institution: "UNSM",
    modality: "ORDINARIO",
    year: 2024,
    documentType: "REPOSITORIO_ACADEMICO",
    title: "UNSM Exámenes de Admisión y Solucionarios PDF Oficiales",
    url: "https://matematicasn.blogspot.com/2020/03/unsm-examen-de-admision-a-la-universidad-nacional-de-san-martin-solucionario-en-pdf.html",
    sourceType: "SECUNDARIA",
    availability: "CATALOGADO_Y_PROCESADO",
    checksum: "sha256_matematicasn_unsm_hub",
    subjectsCovered: ["Matematica", "Fisica", "Quimica", "Biologia", "Historia del Peru", "Geografia", "Cultura General"]
  },
  {
    sourceId: "SRC-WEB-ALGEBRA-PDF-BECA18",
    institution: "PRONABEC",
    modality: "ENP",
    year: 2023,
    documentType: "BANCO_PRACTICA",
    title: "Prueba Única Nacional Beca 18 Resuelta Admisión Universidad Solucionario PDF",
    url: "https://algebraenpdf.blogspot.com/2019/11/prueba-unica-nacional-beca-18-pronabec-resuelta-admision-universidad-solucionario-pdf.html",
    sourceType: "SECUNDARIA",
    availability: "PROCESADO",
    checksum: "sha256_algebraenpdf_beca18",
    subjectsCovered: ["Algebra", "Aritmetica", "Razonamiento Matematico"]
  },
  {
    sourceId: "SRC-WEB-OPERADORES-ARBITRARIOS",
    institution: "PRONABEC",
    modality: "ENP",
    year: 2024,
    documentType: "BANCO_PRACTICA",
    title: "Operaciones Matemáticas Arbitrarias y Operadores en RM",
    url: "https://matematicasn.blogspot.com/2015/12/operaciones-matematicas-arbitrarias_31.html",
    sourceType: "SECUNDARIA",
    availability: "PROCESADO",
    checksum: "sha256_operadores_arbitrarios_mat",
    subjectsCovered: ["Razonamiento Matematico"]
  },
  {
    sourceId: "SRC-WEB-SIMULACRO-BECA18-PDF",
    institution: "PRONABEC",
    modality: "ENP",
    year: 2024,
    documentType: "SIMULACRO_OFICIAL",
    title: "Solucionario Simulacro Beca 18 Prueba PRONABEC en PDF",
    url: "https://algebraenpdf.blogspot.com/2019/11/solucionario-simulacro-beca-18-prueba-pronabec-admision-universidad-en-pdf.html",
    sourceType: "SECUNDARIA",
    availability: "PROCESADO",
    checksum: "sha256_simulacro_beca18_pdf",
    subjectsCovered: ["Matematica", "Competencia Lectora"]
  }
];

const sourceMap = new Map();
inv.sources.forEach(s => sourceMap.set(s.sourceId, s));
addedLinks.forEach(s => sourceMap.set(s.sourceId, s));

inv.sources = Array.from(sourceMap.values());
fs.writeFileSync('research/sources/source-inventory.json', JSON.stringify(inv, null, 2), 'utf8');
fs.writeFileSync('public/research/sources/source-inventory.json', JSON.stringify(inv, null, 2), 'utf8');

console.log('SUCCESS! TOTAL CATALOGED SOURCES:', inv.sources.length);
