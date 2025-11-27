import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { HomeParticles } from '../components/home/HomeParticles';

/**
 * 首页 - 钱包连接
 * 冻结点 2.2-P0-F1：连接钱包 → 检查 isRegistered
 * 冻结点 1.1-4：注册状态来源唯一 - 只使用 useWallet 提供的 isRegistered
 */

// 粒子动画开关
const enableParticles = import.meta.env.VITE_ENABLE_HOME_PARTICLES !== 'false';

export function Home() {
  const navigate = useNavigate();
  const { address, isRegistered, isCheckingRegistration, isConnecting, error, connect } = useWallet();

  // 连接后检查注册状态（使用 useWallet 的 isRegistered，唯一数据源）
  useEffect(() => {
    console.log('[Home] useEffect - address:', address, 'isRegistered:', isRegistered, 'isChecking:', isCheckingRegistration);
    
    if (!address) {
      console.log('[Home] No address, staying on home page');
      return;
    }
    
    // 等待注册状态检查完成
    if (isCheckingRegistration) {
      console.log('[Home] Still checking registration, waiting...');
      return;
    }
    
    // 使用 useWallet 提供的 isRegistered 状态（冻结点 1.1-4）
    if (isRegistered) {
      console.log('[Home] ✅ User registered, redirecting to tasks...');
      navigate('/tasks');
    } else {
      console.log('[Home] ❌ User not registered, redirecting to register...');
      navigate('/register');
    }
  }, [address, isRegistered, isCheckingRegistration, navigate]);

  // Debug log
  console.log('[Home] enableParticles:', enableParticles, 'env:', import.meta.env.VITE_ENABLE_HOME_PARTICLES);

  return (
    <div style={styles.container}>
      {enableParticles && <HomeParticles />}
      {enableParticles && <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 9999, background: 'red', color: 'white', padding: '5px' }}>粒子已启用</div>}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Card padding="lg">
        <div style={styles.content}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🔊</span>
            <h1 style={styles.title}>EverEcho</h1>
          </div>
          <p style={styles.subtitle}>Decentralized Task Marketplace</p>

          {!address ? (
            <>
              <p style={styles.description}>
                Connect your wallet to get started with EverEcho.
                Earn ECHO tokens by completing tasks or find helpers for your projects.
              </p>
              
              <Button
                onClick={() => connect(true)}
                loading={isConnecting}
                fullWidth
                size="lg"
              >
                Connect Wallet
              </Button>

              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <p style={styles.hint}>
                💡 Make sure you have MetaMask installed and connected to Sepolia Testnet
              </p>
            </>
          ) : (
            <>
              <Alert variant="info">
                Connected: {address.slice(0, 10)}...{address.slice(-8)}
              </Alert>
              <p style={styles.hint}>
                🔄 Checking registration status...
              </p>
            </>
          )}
        </div>
      </Card>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: enableParticles 
      ? 'radial-gradient(ellipse at 50% 30%, rgba(10, 15, 35, 0.95) 0%, transparent 70%), linear-gradient(180deg, #050810 0%, #0A0C15 100%)'
      : '#f9fafb',
    padding: '20px',
    position: 'relative',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  logoIcon: {
    fontSize: '48px',
  },
  title: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#2563eb',
    margin: 0,
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '32px',
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4b5563',
    marginBottom: '32px',
  },
  hint: {
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '16px',
  },
};
