import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../hooks/useTasks';
import { getCategoryTheme } from '../../utils/categoryTheme';

interface TaskCard3DProps {
  task: Task;
  index: number;
  activeIndex: number;
  totalCards: number;
}

export function TaskCard3D({ task, index, activeIndex, totalCards }: TaskCard3DProps) {
  const navigate = useNavigate();
  const theme = getCategoryTheme(task.metadata?.category);
  
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  
  // 2D 横向滑动 - 中心最大最亮，两侧缩小变暗
  const isActive = offset === 0;
  const scale = isActive ? 1 : 0.85;
  const opacity = isActive ? 1 : 0.5;
  const translateX = offset * 400;
  
  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      0: 'OPEN',
      1: 'IN PROGRESS',
      2: 'SUBMITTED',
      3: 'COMPLETED',
      4: 'CANCELLED',
    };
    return labels[status] || 'UNKNOWN';
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return 'JUST NOW';
    if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
    return `${Math.floor(diff / 86400)}D AGO`;
  };

  return (
    <div
      style={{
        ...styles.cardWrapper,
        transform: `translateX(${translateX}px) scale(${scale})`,
        opacity,
        zIndex: totalCards - absOffset,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      onClick={() => isActive && navigate(`/tasks/${task.taskId}`)}
    >
      <div
        style={{
          ...styles.card,
          boxShadow: isActive
            ? `0 0 60px ${theme.glow}, 0 20px 60px rgba(0,0,0,0.8)`
            : '0 10px 40px rgba(0,0,0,0.6)',
          filter: isActive ? 'brightness(1.1)' : 'brightness(0.6)',
        }}
      >
        {/* Category Tag */}
        <div
          style={{
            ...styles.categoryTag,
            backgroundColor: theme.accent,
          }}
        >
          {theme.label.toUpperCase()}
        </div>

        {/* Status Badge */}
        <div style={styles.statusBadge}>
          {getStatusLabel(task.status)}
        </div>

        {/* Title */}
        <h3 style={styles.title}>
          {task.metadata?.title || `TASK #${task.taskId}`}
        </h3>

        {/* Description */}
        {task.metadata?.description && (
          <p style={styles.description}>
            {task.metadata.description.length > 100
              ? `${task.metadata.description.slice(0, 100)}...`
              : task.metadata.description}
          </p>
        )}

        {/* Reward */}
        <div style={styles.rewardSection}>
          <div style={styles.rewardAmount}>{task.reward}</div>
          <div style={styles.rewardLabel}>ECHO</div>
        </div>

        {/* Meta Info */}
        <div style={styles.metaSection}>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>CREATOR</span>
            <span style={styles.metaValue}>
              {task.metadata?.creatorNickname || formatAddress(task.creator)}
            </span>
          </div>
          {task.helper !== '0x0000000000000000000000000000000000000000' && (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>HELPER</span>
              <span style={styles.metaValue}>
                {task.metadata?.helperNickname || formatAddress(task.helper)}
              </span>
            </div>
          )}
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>CREATED</span>
            <span style={styles.metaValue}>{formatTimeAgo(task.createdAt)}</span>
          </div>
        </div>

        {/* Hover Glow Border */}
        {isActive && (
          <div
            style={{
              ...styles.glowBorder,
              boxShadow: `inset 0 0 20px ${theme.glow}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cardWrapper: {
    position: 'absolute',
    width: '360px',
    height: '480px',
    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    cursor: 'pointer',
  },
  card: {
    width: '100%',
    height: '100%',
    background: 'rgba(14, 18, 26, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.4s ease',
  },
  categoryTag: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#fff',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.12em',
    color: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1.3,
    minHeight: '60px',
  },
  description: {
    fontSize: '13px',
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    flex: 1,
  },
  rewardSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  rewardAmount: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  rewardLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.08em',
  },
  metaSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  metaValue: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'monospace',
  },
  glowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    pointerEvents: 'none',
  },
};
