import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';

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

export function renderMath(root) {
  if (!root) return;
  try {
    renderMathInElement(root, MATH_OPTIONS);
  } catch (error) {
    console.warn('Math renderer skipped invalid content:', error);
  }
}
