const MATH_OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
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
  // Load KaTeX only on views that actually contain math notation.
  const textContent = root.textContent || '';
  const hasMath = textContent.includes('$')
    || textContent.includes('\\[')
    || textContent.includes('\\(')
    || textContent.includes('
    const renderMathInElement = await getMathRenderer();
    if (root.isConnected) renderMathInElement(root, MATH_OPTIONS);
  } catch (error) {
    console.warn('Math renderer skipped invalid content:', error);
  }
}
);
  if (!hasMath) return;
  try {
    const renderMathInElement = await getMathRenderer();
    if (root.isConnected) renderMathInElement(root, MATH_OPTIONS);
  } catch (error) {
    console.warn('Math renderer skipped invalid content:', error);
  }
}
