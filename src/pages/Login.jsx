import React, { useState } from 'react';
import { apiLogin } from '../utils/api';
import { Lock, User, AlertCircle, Sparkles } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiLogin(username.trim(), password);
      if (response && response.success) {
        onLoginSuccess(response.user);
      } else {
        setError(response.error || 'Autentikasi gagal.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 60%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      <div className="login-card animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '40px 32px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        textAlign: 'center',
        transition: 'border-color var(--transition-speed)',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            border: '1px solid var(--accent-color)',
            color: 'var(--accent-hover)',
            marginBottom: '16px',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
          }}>
            <Sparkles size={28} />
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            TEAM <span style={{ color: 'var(--accent-color)' }}>urufachan</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Portal Manajer & Asisten Kreator
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger-color)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '12px',
            color: 'var(--danger-color)',
            fontSize: '13px',
            textAlign: 'left',
            marginBottom: '20px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label htmlFor="username" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <User size={16} />
              </span>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color var(--transition-speed)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
            <label htmlFor="password" style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '500' }}>
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color var(--transition-speed)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: 'var(--accent-color)',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              color: '#fff',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color var(--transition-speed), transform 0.1s ease',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-color)')}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? 'Mengautentikasi...' : 'Masuk ke Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Gunakan <code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>admin</code> / <code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>admin123</code> untuk akses admin.
        </div>
      </div>
    </div>
  );
};

export default Login;
