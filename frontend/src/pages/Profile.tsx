import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useProfile } from '../hooks/useProfile';
import { useTaskHistory } from '../hooks/useTaskHistory';
import { useTaskStats } from '../hooks/useTaskStats';
import { TaskHistory } from '../components/TaskHistory';
import { formatECHO } from '../utils/formatters';
import { printDemoSeed } from '../utils/demoSeed';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { NetworkGuard } from '../components/ui/NetworkGuard';
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { generateEncryptionKeyPair, saveEncryptionPrivateKey } from '../utils/encryption';

/**
 * Profile 页面（P0-F3）
 * 冻结点 2.3-P0-F3：Profile 数据来源
 * - nickname/city/skills 来自 Backend API
 * - ECHO 余额来自链上 Token 合约
 * - 任务历史来自链上 TaskEscrow
 */

type TabType = 'creator' | 'helper';

// V2 实验功能：Profile 编辑
const ENABLE_PROFILE_EDIT = import.meta.env.VITE_ENABLE_PROFILE_EDIT === 'true';

export function Profile() {
  const navigate = useNavigate();
  const { address, chainId, provider } = useWallet();
  const { profile, balance, loading: profileLoading, error: profileError } = useProfile(address, provider);
  
  const [activeTab, setActiveTab] = useState<TabType>('creator');
  const [seedLoading, setSeedLoading] = useState(false);
  
  // 链下恢复状态
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  
  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [editContacts, setEditContacts] = useState('');
  const [contactsType, setContactsType] = useState<'telegram' | 'email' | 'other'>('telegram');
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 统计数据（独立加载，不依赖 activeTab）
  const { stats, loading: statsLoading } = useTaskStats(provider, address);

  // 加载任务历史（用于任务列表，保持不变）
  const {
    tasks,
    loading: historyLoading,
    error: historyError,
  } = useTaskHistory(
    provider,
    address ? { role: activeTab, address } : null
  );

  // 链下恢复 Profile（历史用户专用）
  const handleRestoreOffchain = async () => {
    if (!address || !profile) return;
    
    setRestoreLoading(true);
    setRestoreError(null);
    
    try {
      // 1. 生成新的加密密钥对（不触发链上交易）
      const { publicKey, privateKey } = generateEncryptionKeyPair();
      
      // 2. 保存私钥到 localStorage
      saveEncryptionPrivateKey(address, privateKey);
      
      // 3. 准备 profile 数据（清理占位符）
      const nickname = profile.nickname.includes('(synced from chain)') 
        ? 'User' 
        : profile.nickname;
      
      // 4. 只调用 backend API，不触发链上交易
      await apiClient.createProfile({
        address,
        nickname,
        city: profile.city || '',
        skills: profile.skills || [],
        contacts: profile.contacts || undefined,
        encryptionPubKey: publicKey,
      });
      
      alert('Profile restored off-chain successfully! No tokens minted. Your encryption key has been saved locally.');
      
      // 5. 刷新页面以显示更新后的 profile
      window.location.reload();
    } catch (e) {
      console.error('Restore failed:', e);
      setRestoreError(e instanceof Error ? e.message : 'Failed to restore profile');
    } finally {
      setRestoreLoading(false);
    }
  };

  // Demo Seed 工具（仅开发环境）
  const handleDemoSeed = async () => {
    if (!provider || !chainId || !address) {
      console.error('Wallet not connected');
      return;
    }
    
    setSeedLoading(true);
    try {
      await printDemoSeed(provider, chainId, address, 10);
      alert('Demo seed printed to console! Check browser console for details.');
    } catch (err) {
      console.error('Demo seed failed:', err);
      alert('Demo seed failed. Check console for details.');
    } finally {
      setSeedLoading(false);
    }
  };

  // 进入编辑模式
  const handleEdit = () => {
    if (!profile) return;
    setEditNickname(profile.nickname);
    setEditCity(profile.city);
    setEditSkills([...profile.skills]);
    setEditContacts(profile.contacts || '');
    // 自动检测联系方式类型
    if (profile.contacts) {
      if (profile.contacts.startsWith('@')) {
        setContactsType('telegram');
      } else if (profile.contacts.includes('@') && profile.contacts.includes('.')) {
        setContactsType('email');
      } else {
        setContactsType('other');
      }
    }
    setNewSkill('');
    setEditError(null);
    setIsEditing(true);
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    setEditError(null);
  };

  // 添加 skill
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setNewSkill('');
    }
  };

  // 删除 skill
  const handleRemoveSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };

  // 处理联系方式输入（自动格式化）
  const handleContactsChange = (value: string) => {
    let formatted = value;
    
    // Telegram 自动添加 @
    if (contactsType === 'telegram' && value && !value.startsWith('@')) {
      formatted = '@' + value.replace(/^@+/, ''); // 移除多余的 @
    }
    
    setEditContacts(formatted);
  };

  // 保存编辑
  const handleSave = async () => {
    if (!address || !profile) return;

    // 验证
    if (!editNickname.trim()) {
      setEditError('Nickname is required');
      return;
    }
    if (!editCity.trim()) {
      setEditError('City is required');
      return;
    }
    if (editSkills.length === 0) {
      setEditError('At least one skill is required');
      return;
    }
    
    // 验证联系方式格式
    if (editContacts.trim()) {
      if (contactsType === 'telegram' && !editContacts.startsWith('@')) {
        setEditError('Telegram username must start with @');
        return;
      }
      if (contactsType === 'email' && !editContacts.includes('@')) {
        setEditError('Invalid email format');
        return;
      }
    }

    setIsSaving(true);
    setEditError(null);

    try {
      // 调用 API 更新 profile（仅后端，不上链）
      await apiClient.createProfile({
        address,
        nickname: editNickname.trim(),
        city: editCity.trim(),
        skills: editSkills,
        contacts: editContacts.trim() || undefined,
        encryptionPubKey: profile.encryptionPubKey,
      });

      // 成功后退出编辑模式并刷新页面
      setIsEditing(false);
      alert('Profile updated off-chain successfully! Re-register to update on-chain.');
      window.location.reload();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setEditError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!address) {
    return (
      <PageLayout title="Profile">
        <Card>
          <Alert variant="warning">
            Please connect your wallet to view your profile.
          </Alert>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="My Profile">
      <NetworkGuard chainId={chainId}>
        <div style={styles.container}>
          {/* Demo Seed Button (Dev only) */}
          {import.meta.env.DEV && (
            <div style={styles.demoSeedSection}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDemoSeed}
                loading={seedLoading}
              >
                🎯 Demo Seed
              </Button>
              <span style={styles.demoHint}>
                Print demo seed to console (Dev only)
              </span>
            </div>
          )}

          {/* Profile Card */}
          <Card>
            {profileLoading && (
              <div style={styles.centerText}>
                <p style={styles.loadingText}>Loading profile...</p>
              </div>
            )}
            
            {profileError && (
              <div>
                <Alert variant="error" title="Failed to load profile">
                  {profileError}
                </Alert>
                <div style={styles.centerActions}>
                  <p style={styles.hint}>
                    Make sure you have registered.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/register')}
                  >
                    Go to Register
                  </Button>
                </div>
              </div>
            )}

            {!profileLoading && !profileError && profile && (
              <>
                {/* Historical User Warning */}
                {(() => {
                  const needsRestore =
                    profile &&
                    (
                      !profile.encryptionPubKey ||
                      profile.encryptionPubKey.trim() === '' ||
                      profile.nickname.includes('(synced from chain)')
                    );
                  
                  return needsRestore && (
                    <div style={{ marginBottom: '24px' }}>
                      <Alert variant="warning" title="Profile incomplete (historical user)">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p style={{ margin: 0 }}>
                            This is a historical on-chain account. The old profileURI is unreachable, 
                            so your encryption key and off-chain profile were not recovered.
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Impact:</strong> Tasks from this address cannot create ContactKey, and Helpers won't see your contacts.
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Fix:</strong> Restore your profile off-chain to regenerate your encryption key. This will NOT mint tokens or trigger any on-chain transactions.
                          </p>
                          
                          {restoreError && (
                            <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>
                              Error: {restoreError}
                            </p>
                          )}
                          
                          <div style={{ marginTop: 8 }}>
                            <Button
                              variant="primary"
                              onClick={handleRestoreOffchain}
                              loading={restoreLoading}
                              disabled={restoreLoading}
                            >
                              Restore profile (off-chain)
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    </div>
                  );
                })()}

                {/* Profile Header */}
                <div style={styles.profileHeader}>
                  <div style={styles.avatarSection}>
                    <div style={styles.avatar}>
                      {(isEditing ? editNickname : profile.nickname).charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.profileInfo}>
                      <h2 style={styles.nickname}>
                        {isEditing ? editNickname || 'Nickname' : profile.nickname}
                      </h2>
                      <p style={styles.address}>
                        {address.slice(0, 10)}...{address.slice(-8)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Balance Badge */}
                  <div style={styles.balanceSection}>
                    <div style={styles.balanceAmount}>{formatECHO(balance)}</div>
                    <div style={styles.balanceLabel}>ECHO</div>
                  </div>
                </div>

                {/* Edit/Save/Cancel Buttons */}
                {ENABLE_PROFILE_EDIT && (
                  <div style={styles.editActions}>
                    {!isEditing ? (
                      <Button variant="secondary" size="sm" onClick={handleEdit}>
                        ✏️ Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSave}
                          loading={isSaving}
                          disabled={isSaving}
                        >
                          💾 Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          ✖️ Cancel
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Edit Error */}
                {editError && (
                  <Alert variant="error">{editError}</Alert>
                )}

                {/* Stats Grid / Edit Form */}
                {!isEditing ? (
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📍</div>
                      <div style={styles.statContent}>
                        <div style={styles.statLabel}>City</div>
                        <div style={styles.statValue}>{profile.city}</div>
                      </div>
                    </div>

                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>💼</div>
                      <div style={styles.statContent}>
                        <div style={styles.statLabel}>Tags</div>
                        <div style={styles.skillsContainer}>
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="open">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📱</div>
                      <div style={styles.statContent}>
                        <div style={styles.statLabel}>Contact</div>
                        <div style={styles.statValue}>
                          {profile.contacts || 'Not set'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.editForm}>
                    <Input
                      label="Nickname *"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="Enter your nickname"
                    />
                    <Input
                      label="City *"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="Enter your city"
                    />
                    
                    <div style={styles.skillsEditSection}>
                      <label style={styles.label}>Tags *</label>
                      <div style={styles.skillsInputRow}>
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleAddSkill}
                          disabled={!newSkill.trim()}
                        >
                          ➕ Add
                        </Button>
                      </div>
                      <div style={styles.skillsContainer}>
                        {editSkills.map((skill, index) => (
                          <div key={index} style={styles.skillTag}>
                            <span>{skill}</span>
                            <button
                              style={styles.skillRemove}
                              onClick={() => handleRemoveSkill(skill)}
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                      {editSkills.length === 0 && (
                        <p style={styles.hint}>No tags added yet</p>
                      )}
                    </div>

                    {/* 联系方式编辑 */}
                    <div style={styles.contactsEditSection}>
                      <label style={styles.label}>Contact Information</label>
                      <div style={styles.contactTypeSelector}>
                        <select
                          value={contactsType}
                          onChange={(e) => setContactsType(e.target.value as 'telegram' | 'email' | 'other')}
                          style={styles.select}
                        >
                          <option value="telegram">📱 Telegram</option>
                          <option value="email">📧 Email</option>
                          <option value="other">🔗 Other</option>
                        </select>
                      </div>
                      <Input
                        value={editContacts}
                        onChange={(e) => handleContactsChange(e.target.value)}
                        placeholder={
                          contactsType === 'telegram' ? '@username' :
                          contactsType === 'email' ? 'your@email.com' :
                          'Your contact info'
                        }
                      />
                      {editContacts && (
                        <div style={styles.contactsPreview}>
                          <small style={styles.previewLabel}>Preview:</small>
                          <span style={styles.previewValue}>{editContacts}</span>
                        </div>
                      )}
                      <p style={styles.hint}>
                        This will be shared with Helpers when they accept your tasks
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>

          {/* Task Statistics */}
          {!profileLoading && !profileError && profile && (
            <div style={styles.statsCardsContainer}>
              <div style={styles.statsCard}>
                <div style={styles.statsNumber}>
                  {statsLoading ? '...' : stats.createdCount}
                </div>
                <div style={styles.statsLabel}>Tasks I Created</div>
              </div>
              <div style={styles.statsCard}>
                <div style={styles.statsNumber}>
                  {statsLoading ? '...' : stats.helpedCount}
                </div>
                <div style={styles.statsLabel}>Tasks I Helped</div>
              </div>
            </div>
          )}

          {/* Task History */}
          {!profileLoading && !profileError && profile && (
            <Card>
              <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>Task History</h3>
                
                {/* Tabs */}
                <div style={styles.tabs}>
                  <Button
                    variant={activeTab === 'creator' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('creator')}
                  >
                    Tasks I Created ({stats.createdCount})
                  </Button>
                  <Button
                    variant={activeTab === 'helper' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('helper')}
                  >
                    Tasks I Helped ({stats.helpedCount})
                  </Button>
                </div>

                {/* History Content */}
                <div style={styles.historyContent}>
                  <TaskHistory
                    tasks={tasks}
                    role={activeTab}
                    loading={historyLoading}
                    error={historyError}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </NetworkGuard>
    </PageLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  demoSeedSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
  },
  demoHint: {
    fontSize: '14px',
    color: '#92400e',
  },
  centerText: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  centerActions: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  hint: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: 1,
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 700,
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)',
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 8px 0',
  },
  address: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontFamily: 'monospace',
  },
  balanceSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  balanceAmount: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#2563eb',
  },
  balanceLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  statCard: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  statIcon: {
    fontSize: '32px',
  },
  statContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 500,
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  historySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  historyTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
  },
  historyContent: {
    minHeight: '200px',
  },
  statsCardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  statsCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statsNumber: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#2563eb',
    marginBottom: '8px',
  },
  statsLabel: {
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: 500,
  },
  editActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  skillsEditSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  skillsInputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
  },
  skillTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
  },
  skillRemove: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0 4px',
    opacity: 0.8,
  },
  contactsEditSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  contactTypeSelector: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  contactsPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
  },
  previewLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
  previewValue: {
    fontSize: '14px',
    color: '#1e40af',
    fontWeight: 600,
  },
};
