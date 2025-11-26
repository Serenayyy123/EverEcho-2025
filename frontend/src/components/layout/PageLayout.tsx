import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../ui/Button';

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PageLayout({ children, title, showNav = true, maxWidth = 'lg' }: PageLayoutProps) {
  const navigate = useNavigate();
  const { address, chainId, disconnect, connect, isConnecting } = useWallet();

  const maxWidthValues: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
  };

  const headerContentStyles: React.CSSProperties = {
    maxWidth: maxWidthValues[maxWidth],
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#2563eb',
    cursor: 'pointer',
    margin: 0,
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  const addressStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
  };

  const mainStyles: React.CSSProperties = {
    maxWidth: maxWidthValues[maxWidth],
    margin: '0 auto',
    padding: '24px',
  };

  const getChainName = (chainId: number | null): string => {
    if (!chainId) return 'Unknown';
    const names: Record<number, string> = {
      11155111: 'Sepolia',
      31337: 'Hardhat',
      1: 'Mainnet',
    };
    return names[chainId] || `Chain ${chainId}`;
  };

  return (
    <div style={containerStyles}>
      {showNav && (
        <header style={headerStyles}>
          <div style={headerContentStyles}>
            <h1 style={logoStyles} onClick={() => navigate('/')}>
              EverEcho
            </h1>
            <nav style={navStyles}>
              {address ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/tasks')}
                  >
                    Tasks
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/publish')}
                  >
                    Publish
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                  >
                    Profile
                  </Button>
                  <div style={addressStyles}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>
                      {getChainName(chainId)}
                    </div>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => connect(true)}
                  loading={isConnecting}
                >
                  Connect Wallet
                </Button>
              )}
            </nav>
          </div>
        </header>
      )}
      <main style={mainStyles}>
        {title && (
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '24px',
              color: '#111827',
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </main>
    </div>
  );
}
