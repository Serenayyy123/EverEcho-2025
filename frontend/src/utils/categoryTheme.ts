/**
 * Category Theme Colors - 高级黑宇宙风格
 * 每个 category 对应一组主题色（用于卡片和标签，不影响按钮）
 */

export interface CategoryTheme {
  accent: string;
  glow: string;
  label: string;
}

export const categoryThemes: Record<string, CategoryTheme> = {
  design: {
    accent: '#7aa2ff',
    glow: 'rgba(122, 162, 255, 0.4)',
    label: 'Design',
  },
  development: {
    accent: '#59f0d5',
    glow: 'rgba(89, 240, 213, 0.4)',
    label: 'Development',
  },
  marketing: {
    accent: '#c48bff',
    glow: 'rgba(196, 139, 255, 0.4)',
    label: 'Marketing',
  },
  writing: {
    accent: '#f5d58a',
    glow: 'rgba(245, 213, 138, 0.4)',
    label: 'Writing',
  },
  other: {
    accent: '#a7b0bf',
    glow: 'rgba(167, 176, 191, 0.4)',
    label: 'Other',
  },
};

export const getCategoryTheme = (category?: string): CategoryTheme => {
  if (!category) return categoryThemes.other;
  return categoryThemes[category.toLowerCase()] || categoryThemes.other;
};
