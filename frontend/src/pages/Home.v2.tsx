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
      
      <div style={styles.content}>
        {/* 高级衬线大标题 - UI only */}
        <div style={styles.heroSection}>
          <div style={styles.logoIcon}>🔊</div>
          <h1 style={styles.title}>EverEcho</h1>
        </div>

        {!address ? (
          <>
            {/* 高级 Connect Wallet 按钮 - UI only */}
            <button
              onClick={() => connect(true)}
              disabled={isConnecting}
              style={{
                ...styles.premiumButton,
                ...(isConnecting ? styles.premiumButtonLoading : {}),
              }}
              onMouseEnter={(e) => {
                if (!isConnecting) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = styles.premiumButtonHover.boxShadow as string;
                }
              }}
              onMouseLeave={(e) => {
                if (!isConnecting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = styles.premiumButton.boxShadow as string;
                }
              }}
              onMouseDown={(e) => {
                if (!isConnecting) {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }
              }}
              onMouseUp={(e) => {
                if (!isConnecting) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
                }
              }}
            >
              {isConnecting ? (
                <>
                  <span style={styles.buttonSpinner}>⏳</span>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}
          </>
        ) : (
          <>
            <Alert variant="info">
              Connected: {address.slice(0, 10)}...{address.slice(-8)}
            </Alert>
            <p style={styles.statusText}>
              Checking registration status...
            </p>
          </>
        )}
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
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    animation: 'pulse 4s ease-in-out infinite',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  // 高级衬线大标题区域 - UI only
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  logoIcon: {
    fontSize: '72px',
    filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.6))',
    animation: 'float 3s ease-in-out infinite',
  },
  // 高级衬线标题 - 电影感、白色、强对比 - UI only
  title: {
    fontSize: '96px',
    fontWeight: 300,
    fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '0.02em',
    lineHeight: 1,
    textShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)',
    animation: 'fadeInUp 0.8s ease-out',
  },
  // 高级 Connect Wallet 按钮 - UI only
  premiumButton: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px 48px',
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    backgroundSize: '200% 200%',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    animation: 'gradientShift 3s ease infinite',
  },
  premiumButtonHover: {
    boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
  },
  premiumButtonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    display: 'inline-block',
    marginRight: '8px',
    animation: 'spin 1s linear infinite',
  },
  statusText: {
    fontSize: '14px',
    color: themeV2.colors.text.tertiary,
    margin: 0,
  },
};
