/**
 * Category Theme Colors - 高级黑宇宙风格
 * 每个 category 对应一组主题色（用于卡片和标签，不影响按钮）
 */

export interface CategoryTheme {
  accent: string;
  glow: string;
  label: string;
}

export interface CategoryFullTheme extends CategoryTheme {
  bg: string;
  border: string;
  text: string;
  tag: string;
  cta: string;
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

// 完整主题色（卡片材质）
export const CATEGORY_FULL_THEME: Record<string, CategoryFullTheme> = {
  design: {
    ...categoryThemes.design,
    bg: '#2A0F3F',
    border: '#7C3AED',
    text: '#F5F3FF',
    tag: '#3B1760',
    cta: '#8B5CF6',
  },
  development: {
    ...categoryThemes.development,
    bg: '#0B1B3C',
    border: '#2563EB',
    text: '#EFF6FF',
    tag: '#0F2A5A',
    cta: '#3B82F6',
  },
  marketing: {
    ...categoryThemes.marketing,
    bg: '#2A0F3F',
    border: '#C48BFF',
    text: '#FAF5FF',
    tag: '#3B1760',
    cta: '#C48BFF',
  },
  writing: {
    ...categoryThemes.writing,
    bg: '#2A1609',
    border: '#F59E0B',
    text: '#FFFBEB',
    tag: '#3A220F',
    cta: '#FBBF24',
  },
  other: {
    ...categoryThemes.other,
    bg: '#111827',
    border: '#6B7280',
    text: '#F9FAFB',
    tag: '#1F2937',
    cta: '#9CA3AF',
  },
};

export const getCategoryFullTheme = (category?: string): CategoryFullTheme => {
  if (!category) return CATEGORY_FULL_THEME.other;
  return CATEGORY_FULL_THEME[category.toLowerCase()] || CATEGORY_FULL_THEME.other;
};

export const getCategoryTheme = (category?: string): CategoryTheme => {
  if (!category) return categoryThemes.other;
  return categoryThemes[category.toLowerCase()] || categoryThemes.other;
};
