import React from 'react';
import { CATEGORY_OPTIONS } from '../../types/category';
import { getCategoryTheme } from '../../utils/categoryTheme';

interface TaskFiltersBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showOngoing: boolean;
  onShowOngoingChange: (show: boolean) => void;
  sortBy: 'newest' | 'reward' | 'oldest';
  onSortChange: (sort: 'newest' | 'reward' | 'oldest') => void;
}

export function TaskFiltersBar({
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  showOngoing,
  onShowOngoingChange,
  sortBy,
  onSortChange,
}: TaskFiltersBarProps) {
  return (
    <div style={styles.container}>
      {/* Category Chips */}
      <div style={styles.section}>
        <label style={styles.label}>CATEGORY</label>
        <div style={styles.chipsRow}>
          <button
            style={{
              ...styles.chip,
              ...(selectedCategory === 'all' ? styles.chipActive : {}),
            }}
            onClick={() => onCategoryChange('all')}
          >
            ALL
          </button>
          {CATEGORY_OPTIONS.map((opt) => {
            const theme = getCategoryTheme(opt.key);
            const isSelected = selectedCategory === opt.key;
            
            return (
              <button
                key={opt.key}
                style={{
                  ...styles.chip,
                  ...(isSelected
                    ? {
                        backgroundColor: theme.accent,
                        borderColor: theme.accent,
                        color: '#fff',
                      }
                    : {}),
                }}
                onClick={() => onCategoryChange(opt.key)}
              >
                {opt.label.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Sort Row */}
      <div style={styles.row}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.sortWrapper}>
          <label style={styles.label}>SORT</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            style={styles.select}
          >
            <option value="newest">NEWEST</option>
            <option value="reward">HIGHEST REWARD</option>
            <option value="oldest">OLDEST</option>
          </select>
        </div>

        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showOngoing}
            onChange={(e) => onShowOngoingChange(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.toggleText}>SHOW ONGOING</span>
        </label>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '24px',
    background: 'rgba(14, 18, 26, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  chip: {
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.7)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#fff',
  },
  row: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
  },
  searchWrapper: {
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  sortWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '180px',
  },
  select: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    cursor: 'pointer',
    outline: 'none',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
  },
  checkbox: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  },
  toggleText: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.7)',
    whiteSpace: 'nowrap',
  },
};
