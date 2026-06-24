import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Sparkles, 
  LayoutDashboard, 
  KanbanSquare, 
  MessageCircle, 
  Image, 
  BarChart3, 
  FileEdit, 
  FileText, 
  Calendar, 
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { apiGetUsers, apiCreateUser, apiDeleteUser } from '../utils/api';

const AdminDashboard = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  
  // Status Alert
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiGetUsers();
      setUsers(data);
    } catch (err) {
      console.error('Gagal mengambil daftar pengguna:', err);
      setError('Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }

    try {
      const response = await apiCreateUser({
        username: username.trim(),
        password,
        role
      });

      if (response && response.success) {
        setSuccess(`Pengguna "${username}" berhasil dibuat!`);
        setUsername('');
        setPassword('');
        setRole('user');
        fetchUsers();
      } else {
        setError(response.error || 'Gagal membuat pengguna.');
      }
    } catch (err) {
      console.error('Gagal membuat user:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userName.toLowerCase() === 'admin') {
      alert('Akun admin bawaan tidak dapat dihapus demi keamanan.');
      return;
    }
    if (currentUser && currentUser.id === userId) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await apiDeleteUser(userId);
      if (response && response.success) {
        setSuccess(`Pengguna "${userName}" berhasil dihapus.`);
        fetchUsers();
      } else {
        setError(response.error || 'Gagal menghapus pengguna.');
      }
    } catch (err) {
      console.error('Gagal menghapus user:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const appFeatures = [
    { id: 'overview', label: 'Dashboard Utama', desc: 'Ringkasan performa finansial, grafik invoice, & ide harian asisten AI.', icon: LayoutDashboard, access: 'Semua' },
    { id: 'pipeline', label: 'Alur Konten (Pipeline)', desc: 'Papan kanban interaktif untuk mengelola status & tenggat pengerjaan video.', icon: KanbanSquare, access: 'Semua' },
    { id: 'note', label: 'Catatan (Note)', desc: 'Editor teks cepat untuk mencatat ideasi, brief singkat, atau memo asisten.', icon: FileEdit, access: 'Semua' },
    { id: 'calendar', label: 'Kalender & Jadwal', desc: 'Visualisasi tenggat waktu, jadwal posting, & integrasi Google Calendar.', icon: Calendar, access: 'Semua' },
    { id: 'settings', label: 'Setelan', desc: 'Preferensi visual (tema, font), konfigurasi API Key Sumopod & Google Client ID.', icon: SettingsIcon, access: 'Semua' },
    { id: 'ai-portal', label: 'Pusat Asisten AI', desc: 'Modul AI untuk menganalisis brief brand secara otomatis & memeriksa draf kontrak.', icon: Sparkles, access: 'Hanya Admin' },
    { id: 'conversation', label: 'Diskusi Manajer', desc: 'Simulasi rapat/diskusi multipersona asisten AI dengan keahlian berbeda.', icon: MessageCircle, access: 'Hanya Admin' },
    { id: 'toolkit', label: 'Perangkat Kreator', desc: 'Pembuat naskah video & penilai ide konten terintegrasi AI.', icon: Sparkles, access: 'Hanya Admin' },
    { id: 'mediakit', label: 'Media Kit PDF', desc: 'Halaman generator profil, statistik media sosial, & portofolio dalam PDF premium.', icon: Image, access: 'Hanya Admin' },
    { id: 'analytics', label: 'Analitik Performa', desc: 'Prediksi performa video serta kalkulasi pendapatan otomatis.', icon: BarChart3, access: 'Hanya Admin' },
    { id: 'invoices', label: 'Invoice & Bayar', desc: 'Manajemen invoice klien, pembuatan invoice otomatis, & tracking pembayaran.', icon: FileText, access: 'Hanya Admin' },
    { id: 'admin-dashboard', label: 'Kelola Pengguna', desc: 'Dasbor admin untuk mengelola user, membuat user, menghapus, & melihat katalog fitur.', icon: Users, access: 'Hanya Admin' }
  ];

  return (
    <div className="admin-dashboard-container animate-fade-in-up" style={{ padding: '24px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
            Dasbor Admin <span style={{ color: 'var(--accent-color)' }}>Kelola Pengguna</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Kelola hak akses portal asisten, tambahkan anggota tim baru, dan pantau status seluruh fitur sistem.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--danger-light)',
          border: '1px solid var(--danger-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 20px',
          color: 'var(--danger-color)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--success-light)',
          border: '1px solid var(--success-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '14px 20px',
          color: 'var(--success-color)',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div className="stat-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-color)',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Total Pengguna</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{users.length}</div>
          </div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            color: '#a78bfa',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex'
          }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Administrator</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{adminCount}</div>
          </div>
        </div>

        <div className="stat-card" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            color: 'var(--accent-cyan)',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex'
          }}>
            <UserIcon size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Staf Regular</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>{userCount}</div>
          </div>
        </div>
      </div>

      {/* Main Action Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Form panel */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <UserPlus size={20} style={{ color: 'var(--accent-color)' }} />
            Tambah Pengguna Baru
          </h3>
          
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="form-username" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>Username</label>
              <input 
                id="form-username"
                type="text" 
                placeholder="Masukkan username baru"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  padding: '11px 14px',
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="form-password" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>Kata Sandi</label>
              <input 
                id="form-password"
                type="password" 
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  padding: '11px 14px',
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="form-role" style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>Peran Hak Akses</label>
              <select 
                id="form-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  padding: '11px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-speed)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="user">User (Staf Biasa)</option>
                <option value="admin">Admin (Akses Penuh)</option>
              </select>
            </div>

            <button 
              type="submit"
              style={{
                marginTop: '10px',
                padding: '11px',
                backgroundColor: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color var(--transition-speed)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-color)')}
            >
              Simpan Pengguna
            </button>
          </form>
        </div>

        {/* Users list panel */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Users size={20} style={{ color: 'var(--accent-cyan)' }} />
            Daftar Anggota Portal
          </h3>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '4px' }}>
            {loading && users.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat data pengguna...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Tidak ada pengguna terdaftar.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.map((user) => (
                  <div key={user.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: user.role === 'admin' ? 'var(--accent-light)' : 'rgba(6, 182, 212, 0.15)',
                        color: user.role === 'admin' ? 'var(--accent-hover)' : 'var(--accent-cyan)',
                        border: `1px solid ${user.role === 'admin' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {user.username.trim().substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '14.5px' }}>{user.username}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {user.role === 'admin' ? (
                            <span style={{ fontSize: '10px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-hover)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', fontWeight: '600' }}>Admin</span>
                          ) : (
                            <span style={{ fontSize: '10px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: '600' }}>User</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.username.toLowerCase() === 'admin'}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: user.username.toLowerCase() === 'admin' ? 'var(--text-muted)' : 'var(--danger-color)',
                        cursor: user.username.toLowerCase() === 'admin' ? 'not-allowed' : 'pointer',
                        borderRadius: 'var(--border-radius-sm)',
                        display: 'flex',
                        transition: 'background-color var(--transition-speed)'
                      }}
                      onMouseOver={(e) => user.username.toLowerCase() !== 'admin' && (e.currentTarget.style.backgroundColor = 'var(--danger-light)')}
                      onMouseOut={(e) => user.username.toLowerCase() !== 'admin' && (e.currentTarget.style.backgroundColor = 'transparent')}
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Catalog of all features (satisfying: "melihat semua fitur") */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Eye size={22} style={{ color: 'var(--accent-color)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>Katalog Fitur Sistem</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
          Berikut adalah rincian fungsionalitas dan peta pembatasan hak akses yang saat ini diterapkan pada seluruh modul aplikasi.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {appFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div key={feat.id} style={{
                padding: '16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid rgba(255,255,255,0.02)',
                display: 'flex',
                gap: '14px',
                transition: 'border-color var(--transition-speed)'
              }}>
                <div style={{
                  color: feat.access === 'Semua' ? 'var(--accent-cyan)' : 'var(--accent-color)',
                  marginTop: '2px',
                  display: 'flex'
                }}>
                  <IconComp size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#fff', fontSize: '13.5px' }}>{feat.label}</span>
                    <span style={{
                      fontSize: '9.5px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      backgroundColor: feat.access === 'Semua' ? 'rgba(6, 182, 212, 0.1)' : 'var(--accent-light)',
                      color: feat.access === 'Semua' ? 'var(--accent-cyan)' : 'var(--accent-hover)',
                      border: `1px solid ${feat.access === 'Semua' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`
                    }}>
                      {feat.access}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4' }}>{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
