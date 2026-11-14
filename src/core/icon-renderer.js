import { createIcons, Brain, Mic, Send, Square, Volume2, Sparkles } from 'lucide';

const ICONS = { Brain, Mic, Send, Square, Volume2, Sparkles };

export function renderIcons() {
  createIcons({ icons: ICONS });
}
