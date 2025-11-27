import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTasks, TaskStatus } from '../hooks/useTasks';
import { PageLayout } from '../components/layout/PageLayout';
import { TaskCarousel3D } from '../components/tasksquare/TaskCarousel3D';
import { TaskFiltersBar } from '../components/tasksquare/TaskFiltersBar';
import { getCategoryLabel } from '../types/category';

/**
 * TaskSquare V2 - 3D 卡片展厅风格
 * 纯 UI 升级，不改任何业务逻辑
 */

export function TaskSquareV2() {
  const navigate = useNavigate();
  const { address, chainId, provider } = useWallet();
  const { tasks, loading, error, refresh } = useTasks(provider, chainId);

  const [showOngoing, setShowOngoing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'reward' | 'oldest'>('newest');

  // 从 sessionStorage 读取偏好（按链隔离）
  useEffect(() => {
    const cid = chainId?.toString() || 'unknown';
    const key = `taskSquare_showOngoing_${cid}`;
    const saved = sessionStorage.getItem(key);
    setShowOngoing(saved === 'true');
  }, [chainId]);

  // 保存 toggle 状态
  const handleToggleOngoing = (checked: boolean) => {
    setShowOngoing(checked);
    const cid = chainId?.toString() || 'unknown';
    const key = `taskSquare_showOngoing_${cid}`;
    sessionStorage.setItem(key, String(checked));
  };

  // 过滤任务
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(task => task.metadata?.category === selectedCategory);
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task => {
        const title = task.metadata?.title?.toLowerCase() || '';
        const description = task.metadata?.description?.toLowerCase() || '';
        const categoryLabel = getCategoryLabel(task.metadata?.category).toLowerCase();
        return title.includes(term) || description.includes(term) || categoryLabel.includes(term);
      });
    }
    
    return result;
  }, [tasks, selectedCategory, searchTerm]);

  // 显示任务（根据 showOngoing）
  const displayTasks = useMemo(() => {
    if (showOngoing) {
      return filteredTasks;
    } else {
      return filteredTasks.filter(task => task.status === TaskStatus.Open);
    }
  }, [filteredTasks, showOngoing]);

  // 排序任务
  const sortedTasks = useMemo(() => {
    const sorted = [...displayTasks];
    
    if (sortBy === 'newest') {
      sorted.sort((a, b) => {
        const ta = a.createdAt ?? Number(a.taskId);
        const tb = b.createdAt ?? Number(b.taskId);
        return tb - ta;
      });
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => {
        const ta = a.createdAt ?? Number(a.taskId);
        const tb = b.createdAt ?? Number(b.taskId);
        return ta - tb;
      });
    } else if (sortBy === 'reward') {
      sorted.sort((a, b) => parseFloat(b.reward) - parseFloat(a.reward));
    }
    
    return sorted;
  }, [displayTasks, sortBy]);

  if (!address) {
    return (
      <PageLayout title="Task Square">
        <div style={styles.centerMessage}>
          <h2 style={styles.messageTitle}>CONNECT WALLET</h2>
          <p style={styles.messageText}>
            Please connect your wallet to view tasks
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="" showNav={true}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>TASK SQUARE</h1>
            <p style={styles.subtitle}>EXPLORE DECENTRALIZED OPPORTUNITIES</p>
          </div>
          <div style={styles.actions}>
            <button
              style={styles.actionButton}
              onClick={refresh}
              disabled={loading}
            >
              🔄 REFRESH
            </button>
            <button
              style={{ ...styles.actionButton, ...styles.primaryButton }}
              onClick={() => navigate('/publish')}
            >
              ➕ PUBLISH TASK
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFiltersBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showOngoing={showOngoing}
          onShowOngoingChange={handleToggleOngoing}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Loading State */}
        {loading && (
          <div style={styles.centerMessage}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p style={styles.messageText}>LOADING TASKS...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={styles.centerMessage}>
            <h2 style={styles.messageTitle}>ERROR</h2>
            <p style={styles.messageText}>{error}</p>
            <button style={styles.actionButton} onClick={refresh}>
              RETRY
            </button>
          </div>
        )}

        {/* 3D Carousel */}
        {!loading && !error && (
          <TaskCarousel3D tasks={sortedTasks} />
        )}
      </div>
    </PageLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: 'calc(100vh - 200px)',
    background: `
      radial-gradient(ellipse at 50% 20%, rgba(122, 162, 255, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(89, 240, 213, 0.06) 0%, transparent 50%),
      linear-gradient(180deg, #050507 0%, #0b0e14 100%)
    `,
    padding: '40px 20px',
    position: 'relative',
    borderRadius: '16px',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#ffffff',
    margin: '0 0 8px 0',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  subtitle: {
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  actionButton: {
    padding: '12px 24px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
  },
  primaryButton: {
    background: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerMessage: {
    textAlign: 'center',
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  messageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  },
  messageText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
  },
  loadingSpinner: {
    fontSize: '48px',
    animation: 'pulse 2s ease-in-out infinite',
  },
};
