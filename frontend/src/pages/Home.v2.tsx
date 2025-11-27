import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { CardV2 } from '../components/ui/Card.v2';
import { ButtonV2 } from '../components/ui/Button.v2';
import { Alert } from '../components/ui/Alert';
import { themeV2 } from '../styles/theme-v2';

/**
 * 首页 V2 - 高级科技感设计
 * 保持所有原有逻辑不变，只升级视觉
 */

export function HomeV2() {
  const navigate = useNavigate();
  const { address, isRegistered, isCheckingRegistration, isConnecting, error, connect } = useWallet();

  // 连接后检查注册状态（逻辑完全不变）
  useEffect(() => {
    console.log('[Home] useEffect - address:', address, 'isRegistered:', isRegistered, 'isChecking:', isCheckingRegistration);
    
    if (!address) {
      console.log('[Home] No address, staying on home page');
      return;
    }
    
    if (isCheckingRegistration) {
      console.log('[Home] Still checking registration, waiting...');
      return;
    }
    
    if (isRegistered) {
      console.log('[Home] ✅ User registered, redirecting to tasks...');
      navigate('/tasks');
    } else {
      console.log('[Home] ❌ User not registered, redirecting to register...');
      navigate('/register');
    }
  }, [address, isRegistered, isCheckingRegistration, navigate]);

  return (
    <div style={styles.container}>
      {/* 背景装饰 */}
      <div style={styles.bgDecoration} />
      
      <CardV2 padding="lg" glass="strong" glow>
        <div style={styles.content}>
          {/* Logo */}
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🔊</div>
            <h1 style={styles.title}>EverEcho</h1>
          </div>
          
          <p style={styles.subtitle}>Decentralized Task Marketplace</p>

          {!address ? (
            <>
              <p style={styles.description}>
                Connect your wallet to get started with EverEcho.
                Earn ECHO tokens by completing tasks or find helpers for your projects.
              </p>
              
              <ButtonV2
                onClick={() => connect(true)}
                loading={isConnecting}
                fullWidth
                size="lg"
              >
                Connect Wallet
              </ButtonV2>

              {error && (
                <Alert variant="error">
                  {error}
                </Alert>
              )}

              <p style={styles.hint}>
                💡 Make sure you have MetaMask installed and connected to Base Sepolia
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
      </CardV2>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: themeV2.colors.bg.gradient,
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDecoration: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  logoIcon: {
    fontSize: '56px',
    filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    background: themeV2.colors.brand.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  subtitle: {
    fontSize: '20px',
    color: themeV2.colors.text.secondary,
    marginBottom: '40px',
    fontWeight: 500,
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: themeV2.colors.text.tertiary,
    marginBottom: '32px',
  },
  hint: {
    fontSize: '14px',
    color: themeV2.colors.text.muted,
    marginTop: '16px',
  },
};
