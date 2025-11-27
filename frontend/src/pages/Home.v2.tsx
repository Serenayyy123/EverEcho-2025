import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

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
      {/* 深邃背景层次 - UI only */}
      <div style={styles.bgLayer1} />
      <div style={styles.bgLayer2} />
      
      <div style={styles.content}>
        {/* 巨大白色衬线标题 - 电影海报风格 - UI only */}
        <h1 style={styles.title}>EverEcho</h1>

        {!address ? (
          <>
            {/* 高级产品官网风格按钮 - UI only */}
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
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}
          </>
        ) : (
          <p style={styles.statusText}>
            Checking registration...
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // 深邃背景 - 安静但有层次 - UI only
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  // 背景层次 1 - 深层渐变 - UI only
  bgLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at 50% 30%, rgba(20, 20, 40, 0.4) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  // 背景层次 2 - 微妙光晕 - UI only
  bgLayer2: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '64px',
  },
  // 巨大白色衬线标题 - 电影海报风格 - UI only
  title: {
    fontSize: '120px',
    fontWeight: 300,
    fontFamily: '"Playfair Display", "Georgia", "Times New Roman", serif',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '0.03em',
    lineHeight: 0.9,
    textShadow: '0 2px 40px rgba(0, 0, 0, 0.5)',
    animation: 'fadeInUp 1s ease-out',
  },
  // 高级产品官网风格按钮 - UI only
  premiumButton: {
    padding: '18px 56px',
    fontSize: '16px',
    fontWeight: 500,
    color: '#ffffff',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.02em',
  },
  premiumButtonHover: {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  },
  premiumButtonLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    letterSpacing: '0.01em',
  },
  errorMessage: {
    fontSize: '14px',
    color: 'rgba(255, 100, 100, 0.9)',
    padding: '12px 24px',
    background: 'rgba(255, 100, 100, 0.1)',
    border: '1px solid rgba(255, 100, 100, 0.2)',
    borderRadius: '8px',
    maxWidth: '400px',
  },
};
