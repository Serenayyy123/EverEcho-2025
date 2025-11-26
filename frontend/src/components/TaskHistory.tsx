import { Task, TaskStatus, TaskStatusLabels } from '../types/task';
import { formatAddress, formatTimestamp } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

/**
 * 任务历史组件
 * 冻结点 1.3-13：状态枚举与展示一致
 */

interface TaskHistoryProps {
  tasks: Task[];
  role: 'creator' | 'helper';
  loading: boolean;
  error: string | null;
}

export function TaskHistory({ tasks, role, loading, error }: TaskHistoryProps) {
  const navigate = useNavigate();

  if (loading) {
    return <div style={styles.message}>Loading task history...</div>;
  }

  if (error) {
    return <div style={styles.errorMessage}>Error: {error}</div>;
  }

  if (tasks.length === 0) {
    return (
      <div style={styles.message}>
        {role === 'creator' ? 'No tasks created yet' : 'No tasks accepted yet'}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {tasks.map((task) => (
        <div
          key={task.taskId}
          style={styles.taskItem}
          onClick={() => navigate(`/tasks/${task.taskId}`)}
        >
          {/* 标题 */}
          <div style={styles.taskHeader}>
            <h3 style={styles.taskTitle}>
              {task.metadata?.title || `Task #${task.taskId}`}
            </h3>
            <span
              style={{
                ...styles.statusBadge,
                ...getStatusStyle(task.status),
              }}
            >
              {TaskStatusLabels[task.status]}
            </span>
          </div>

          {/* 信息行 */}
          <div style={styles.taskInfo}>
            <div style={styles.infoRow}>
              <span style={styles.label}>Task ID:</span>
              <span style={styles.value}>#{task.taskId}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>
                {role === 'creator' ? 'Helper:' : 'Creator:'}
              </span>
              <span style={styles.value}>
                {role === 'creator'
                  ? task.helper !== '0x0000000000000000000000000000000000000000'
                    ? formatAddress(task.helper)
                    : 'Not assigned'
                  : formatAddress(task.creator)}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Reward:</span>
              <span style={styles.value}>{task.reward} ECHO</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Created:</span>
              <span style={styles.value}>{formatTimestamp(task.createdAt)}</span>
            </div>

            {/* 金额变动语义 */}
            <div style={styles.infoRow}>
              <span style={styles.label}>Amount Change:</span>
              <span style={{...styles.value, ...getAmountChangeStyle(task, role)}}>
                {getAmountChangeText(task, role)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 获取金额变动文本
 * 冻结点 1.3-14/15：双向抵押语义
 */
function getAmountChangeText(task: Task, role: 'creator' | 'helper'): string {
  // task.reward 已经是格式化后的字符串（来自 useTaskHistory）
  const reward = task.reward;

  if (role === 'creator') {
    switch (task.status) {
      case TaskStatus.Open:
        return `Deposited ${reward} ECHO`;
      case TaskStatus.InProgress:
        return `Deposited ${reward} ECHO (locked)`;
      case TaskStatus.Submitted:
        return `Deposited ${reward} ECHO (under review)`;
      case TaskStatus.Completed:
        const r = parseFloat(reward);
        const helperPaid = (r * 0.98).toFixed(4);
        const feeBurned = (r * 0.02).toFixed(4);
        return `Paid ${helperPaid} ECHO to Helper (Fee ${feeBurned} burned)`;
      case TaskStatus.Cancelled:
        return `Refunded ${reward} ECHO`;
      default:
        return '-';
    }
  } else {
    // Helper
    switch (task.status) {
      case TaskStatus.Open:
        return '-';
      case TaskStatus.InProgress:
        return `Deposited ${reward} ECHO (locked)`;
      case TaskStatus.Submitted:
        return `Deposited ${reward} ECHO (under review)`;
      case TaskStatus.Completed:
        const r = parseFloat(reward);
        const helperReward = (r * 0.98).toFixed(4);
        const feeBurned = (r * 0.02).toFixed(4);
        return `Received ${helperReward} ECHO + Deposit ${reward} refunded (Fee ${feeBurned} burned)`;
      case TaskStatus.Cancelled:
        return `Refunded ${reward} ECHO`;
      default:
        return '-';
    }
  }
}

/**
 * 获取金额变动样式
 */
function getAmountChangeStyle(task: Task, role: 'creator' | 'helper'): React.CSSProperties {
  if (task.status === TaskStatus.Completed) {
    return role === 'creator'
      ? { color: '#d32f2f' } // 红色（支出）
      : { color: '#388e3c' }; // 绿色（收入）
  }
  if (task.status === TaskStatus.Cancelled) {
    return { color: '#388e3c' }; // 绿色（退款）
  }
  return { color: '#666' }; // 灰色（锁定/待定）
}

/**
 * 获取状态样式
 */
function getStatusStyle(status: TaskStatus): React.CSSProperties {
  const colors: Record<TaskStatus, { bg: string; color: string }> = {
    [TaskStatus.Open]: { bg: '#e3f2fd', color: '#1976d2' },
    [TaskStatus.InProgress]: { bg: '#fff3e0', color: '#f57c00' },
    [TaskStatus.Submitted]: { bg: '#f3e5f5', color: '#7b1fa2' },
    [TaskStatus.Completed]: { bg: '#e8f5e9', color: '#388e3c' },
    [TaskStatus.Cancelled]: { bg: '#ffebee', color: '#d32f2f' },
  };

  return colors[status];
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  message: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
    fontSize: '16px',
  },
  errorMessage: {
    textAlign: 'center',
    color: '#d32f2f',
    padding: '40px',
    fontSize: '16px',
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  taskTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    color: '#333',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
  },
  taskInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  label: {
    color: '#999',
  },
  value: {
    color: '#333',
    fontWeight: '500',
  },
};
