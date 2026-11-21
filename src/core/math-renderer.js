const MATH_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
    { left: '$', right: '$', display: false },
  ],
  macros: {
    '\\RR': '\\mathbb{R}',
    '\\NN': '\\mathbb{N}',
    '\\ZZ': '\\mathbb{Z}',
    '\\QQ': '\\mathbb{Q}',
    '\\sen': '\\operatorname{sen}',
    '\\tg': '\\operatorname{tg}',
    '\\cotg': '\\operatorname{cotg}',
  },
  throwOnError: false,
  strict: 'ignore',
  trust: false,
  output: 'htmlAndMathml',
  ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
};

let rendererPromise;

function prepareLegacyMath(root) {
  const candidates = root.querySelectorAll('.math-rich-text');
  candidates.forEach((element) => {
    if (element.dataset.mathPrepared === 'true') return;
    const original = element.textContent || '';
    if (!/[=Δ√²³|]|=>/.test(original)) return;
    const match = original.match(/(?:\s*:\s*)(?=[|Δ√]|[a-zA-Z]\s*\(|[a-zA-Z]\s*=)(.*)$/)
      || original.match(/([|Δ√]|[a-zA-Z]\s*\([^)]*\)\s*=.*)$/);
    if (!match) return;
    const formula = match[1] || match[0];
    const prefix = original.slice(0, original.length - formula.length);
    const latex = formula
      .replace(/=>/g, '\\Rightarrow ')
      .replace(/√\s*Δ/g, '\\sqrt{\\Delta}')
      .replace(/Δ/g, '\\Delta')
      .replace(/²/g, '^{2}')
      .replace(/³/g, '^{3}')
      .replace(/r1/g, 'r_1')
      .replace(/r2/g, 'r_2');
    element.textContent = prefix;
    const formulaNode = document.createElement('span');
    formulaNode.className = 'math-rich-expression';
    formulaNode.textContent = '\\( ' + latex + ' \\)';
    element.appendChild(formulaNode);
    element.dataset.mathPrepared = 'true';
  });
}

async function getMathRenderer() {
  if (!rendererPromise) {
    rendererPromise = Promise.all([
      import('katex/contrib/auto-render'),
      import('katex/dist/katex.min.css'),
    ]).then(([module]) => module.default);
  }
  return rendererPromise;
}

export async function renderMath(root) {
  if (!root || !root.isConnected) return;
  prepareLegacyMath(root);
  const textContent = root.textContent || '';
  const hasMath = textContent.includes('$$')
    || textContent.includes('\\[')
    || textContent.includes('\\(')
    || /(^|[^$])\$[^$\n]+\$/.test(textContent);
  if (!hasMath) return;
  try {
    const renderMathInElement = await getMathRenderer();
    if (root.isConnected) renderMathInElement(root, MATH_OPTIONS);
  } catch (error) {
    console.warn('Math renderer skipped invalid content:', error);
  }
}
