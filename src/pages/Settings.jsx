import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Calendar, User, Check, RefreshCw, AlertTriangle, Palette } from 'lucide-react';
import { getGoogleAuthUrl } from '../utils/googleCalendar';
import { THEMES } from '../utils/themes';

const formatNumber = (num) => {
  if (num === undefined || num === null || num === '') return '';
  const clean = num.toString().replace(/\D/g, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumber = (str) => {
  return parseInt(str.replace(/\./g, '')) || 0;
};

const Settings = ({ 
  profile, 
  setProfile, 
  sumopodApiKey, 
  setSumopodApiKey, 
  modelBiasa, 
  setModelBiasa, 
  modelOptimal, 
  setModelOptimal,
  googleClientId, 
  setGoogleClientId, 
  googleConnected, 
  disconnectGoogle,
  selectedTheme,
  setSelectedTheme,
  fontPreference,
  setFontPreference
}) => {
  const [profileForm, setProfileForm] = useState({ ...profile });
  const [apiKeyInput, setApiKeyInput] = useState(sumopodApiKey);
  const [modelBiasaInput, setModelBiasaInput] = useState(modelBiasa || 'deepseek-v4-flash');
  const [modelOptimalInput, setModelOptimalInput] = useState(modelOptimal || 'deepseek-v4-pro');
  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setProfileForm({ ...profile });
  }, [profile]);

  useEffect(() => {
    setApiKeyInput(sumopodApiKey);
    setModelBiasaInput(modelBiasa || 'deepseek-v4-flash');
    setModelOptimalInput(modelOptimal || 'deepseek-v4-pro');
  }, [sumopodApiKey, modelBiasa, modelOptimal]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(profileForm);
    triggerSuccess('Profil Kreator berhasil disimpan!');
  };

  const handleSaveAPIConfig = (e) => {
    e.preventDefault();
    setSumopodApiKey(apiKeyInput);
    setModelBiasa(modelBiasaInput);
    setModelOptimal(modelOptimalInput);
    triggerSuccess('Konfigurasi API SumoPod berhasil disimpan!');
  };

  const handleSaveGoogleConfig = (e) => {
    e.preventDefault();
    setGoogleClientId(clientIdInput);
    triggerSuccess('Client ID Google berhasil disimpan!');
  };

  const handleConnectGoogle = () => {
    if (!googleClientId) {
      alert('Harap masukkan Google Client ID terlebih dahulu.');
      return;
    }
    const url = getGoogleAuthUrl(googleClientId);
    window.location.href = url;
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div>
      <div className="content-header">
        <div className="content-title">
          <h1>Setelan Pengguna</h1>
          <p>Konfigurasi kunci API kecerdasan buatan SumoPod, model pilihan Anda, sambungkan Google Calendar, dan sesuaikan profil kreator.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 'var(--border-radius-md)', 
          backgroundColor: 'var(--success-light)', 
          color: 'var(--success-color)',
          fontWeight: '500',
          marginBottom: '24px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
        
        {/* Section 1: Profil Kreator */}
        <div className="settings-section">
          <div className="settings-meta">
            <h3>
              <User size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Profil Kreator
            </h3>
            <p>
              Kelola informasi identitas publik Anda, ceruk konten (niche), dan rate card standar. Nilai rate card ini akan digunakan secara otomatis oleh Agen AI dalam merancang draf kontrak dan negosiasi.
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Nama Kreator</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Username Medsos</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="@handle"
                    value={profileForm.handle}
                    onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Ceruk Kreator (Niche)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: Tech & Lifestyle"
                    value={profileForm.niche || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nomor Telepon Admin</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: +62 812-3456-7890"
                    value={profileForm.adminPhone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, adminPhone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nama Bank Pembayaran</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: Bank Central Asia (BCA)"
                    value={profileForm.bankName || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nomor Rekening Bank</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: 123-456-7890"
                    value={profileForm.bankAccount || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, bankAccount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nama Pemilik Rekening</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: Jessica Hartono"
                    value={profileForm.bankHolder || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, bankHolder: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Anggota Tim (Pisahkan dengan koma)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Misal: Manager, Talent Utama, Kameramen, Editor"
                  value={profileForm.teamMembers || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, teamMembers: e.target.value })}
                />
                <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                  Akan muncul di pilihan "Tugaskan Ke" pada Alur Konten.
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', textAlign: 'center', lineHeight: '16px', fontSize: '10px', color: 'white', fontWeight: '700' }}>IG</span>
                  Instagram
                </label>
                <input 
                  type="url" 
                  className="form-control"
                  placeholder="https://www.instagram.com/username"
                  value={profileForm.instagram || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#010101', textAlign: 'center', lineHeight: '16px', fontSize: '8px', color: 'white', fontWeight: '700' }}>TT</span>
                    TikTok
                  </label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://www.tiktok.com/@username"
                    value={profileForm.tiktok || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, tiktok: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#FF0000', textAlign: 'center', lineHeight: '16px', fontSize: '8px', color: 'white', fontWeight: '700' }}>YT</span>
                    YouTube
                  </label>
                  <input 
                    type="url" 
                    className="form-control"
                    placeholder="https://www.youtube.com/@channel"
                    value={profileForm.youtube || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rate Card Standar</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Misal: 5.000.000"
                    value={formatNumber(profileForm.rates)}
                    onChange={(e) => setProfileForm({ ...profileForm, rates: parseNumber(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Mata Uang</label>
                  <select 
                    className="form-control"
                    value={profileForm.currency}
                    onChange={(e) => setProfileForm({ ...profileForm, currency: e.target.value })}
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">Dolar AS (USD)</option>
                    <option value="SGD">Dolar Singapura (SGD)</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Simpan Profil
              </button>
            </form>
          </div>
        </div>

        {/* Section: Tema Aplikasi (Odysseus Themes) */}
        <div className="settings-section">
          <div className="settings-meta">
            <h3>
              <Palette size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Tema Antarmuka (Odysseus Themes)
            </h3>
            <p>
              Pilih dari berbagai skema warna dan tema bawaan khas Odysseus untuk mempersonalisasi lingkungan kerja manajer Anda.
            </p>
          </div>
          <div className="card" style={{ margin: 0, padding: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
              width: '100%'
            }}>
              {Object.entries(THEMES).map(([key, t]) => {
                const isSelected = selectedTheme === key;
                return (
                  <div 
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    style={{
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      transition: 'all var(--transition-speed)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}>
                      <span style={{ 
                        fontSize: '12.5px', 
                        fontWeight: '600', 
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)' 
                      }}>
                        {t.label}
                      </span>
                      {isSelected && (
                        <div style={{
                          backgroundColor: 'var(--accent-color)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px'
                        }}>
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    {/* Color Swatch Preview */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.bg, border: '1px solid rgba(128,128,128,0.4)' }} title="Background" />
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.panel, border: '1px solid rgba(128,128,128,0.4)' }} title="Panel" />
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.border, border: '1px solid rgba(128,128,128,0.4)' }} title="Border" />
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.red, border: '1px solid rgba(128,128,128,0.4)' }} title="Accent/Red" />
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.fg, border: '1px solid rgba(128,128,128,0.4)' }} title="Text/Foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 1b: Gaya Tipografi */}
        <div className="settings-section">
          <div className="settings-meta">
            <h3>
              <Palette size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Gaya Tipografi (Typography)
            </h3>
            <p>
              Sesuaikan jenis huruf aplikasi agar sesuai dengan selera Anda. Gunakan Sans-Serif modern agar lebih luwes dibaca, atau Monospace untuk nuansa editor kode yang terstruktur.
            </p>
          </div>
          <div className="card" style={{ margin: 0, padding: '20px' }}>
            <div style={{
              display: 'flex',
              gap: '16px',
              width: '100%',
              flexWrap: 'wrap'
            }}>
              {[
                { id: 'monospace', label: 'Monospace Premium', sub: 'Fira Code', desc: 'Sempurna untuk editor terstruktur & data analitik.' },
                { id: 'sans-serif', label: 'Sans-Serif Modern', sub: 'Outfit / Inter', desc: 'Sangat nyaman dibaca untuk naskah panjang & draf pesan.' }
              ].map(fontOption => {
                const isSelected = fontPreference === fontOption.id;
                return (
                  <div
                    key={fontOption.id}
                    onClick={() => setFontPreference(fontOption.id)}
                    style={{
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-lg)',
                      padding: '16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      transition: 'all var(--transition-speed)',
                      flex: '1 1 200px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)' }}>
                        {fontOption.label}
                      </span>
                      {isSelected && (
                        <div style={{
                          backgroundColor: 'var(--accent-color)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '14px',
                          height: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px'
                        }}>
                          <Check size={8} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Font: {fontOption.sub}</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{fontOption.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Integrasi SumoPod */}
        <div className="settings-section">
          <div className="settings-meta">
            <h3>
              <Key size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Integrasi SumoPod Gateway
            </h3>
            <p>
              Hubungkan dasbor Anda ke gerbang SumoPod untuk mengaktifkan 12 Agen Asisten. Anda dapat menyesuaikan model cepat (untuk obrolan biasa) dan model optimal (untuk kalkulasi, hukum, dan audit stress).
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            <form onSubmit={handleSaveAPIConfig}>
              <div className="form-group">
                <label>SumoPod API Key</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Masukkan Kunci API SumoPod Anda..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model Biasa (Cepat/Santai)</label>
                  <select 
                    className="form-control"
                    value={modelBiasaInput}
                    onChange={e => setModelBiasaInput(e.target.value)}
                  >
                    <option value="deepseek-v4-flash">DeepSeek V4 Flash (Rekomendasi)</option>
                    <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                    <option value="claude-3-5-haiku">Anthropic Claude 3.5 Haiku</option>
                    <option value="llama-3.1-8b-instruct">Meta Llama 3.1 8B</option>
                    <option value="qwen-2.5-7b-instruct">Qwen 2.5 7B</option>
                    <option value="mistral-nemo">Mistral Nemo</option>
                    <option value="glm-5-turbo">GLM 5 Turbo</option>
                    <option value="kimi-k2.6">Kimi K2.6</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Model Optimal (Detail/Hukum)</label>
                  <select 
                    className="form-control"
                    value={modelOptimalInput}
                    onChange={e => setModelOptimalInput(e.target.value)}
                  >
                    <option value="deepseek-v4-pro">DeepSeek V4 Pro (Rekomendasi)</option>
                    <option value="deepseek-r1">DeepSeek R1 (Reasoning)</option>
                    <option value="gpt-4o">OpenAI GPT-4o</option>
                    <option value="gpt-4-turbo">OpenAI GPT-4 Turbo</option>
                    <option value="o1-preview">OpenAI o1-preview</option>
                    <option value="o3-mini">OpenAI o3-mini (Reasoning)</option>
                    <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus-20240229">Anthropic Claude 3 Opus</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                    <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                    <option value="llama-3.1-405b-instruct">Meta Llama 3.1 405B</option>
                    <option value="mistral-large-2407">Mistral Large 2</option>
                    <option value="qwen-2.5-72b-instruct">Qwen 2.5 72B</option>
                    <option value="glm-5">GLM 5</option>
                  </select>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Kunci API disimpan secara aman di backend server lokal Anda. Dapatkan kunci API Anda di **[ai.sumopod.com](https://ai.sumopod.com)**.
              </p>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                Simpan Konfigurasi
              </button>
            </form>
          </div>
        </div>

        {/* Section 3: Google Calendar */}
        <div className="settings-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <div className="settings-meta">
            <h3>
              <Calendar size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Integrasi Google Calendar
            </h3>
            <p>
              Sinkronisasikan tenggat waktu kampanye brand Anda dengan Google Calendar secara otomatis. Jika tidak terhubung, dasbor akan beralih ke Mode Kalender Simulasi Offline.
            </p>
          </div>
          <div className="card" style={{ margin: 0 }}>
            {googleConnected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: 'var(--success-light)', 
                  color: 'var(--success-color)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '13px'
                }}>
                  <Check size={16} /> Connected to Google Calendar
                </div>
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={disconnectGoogle}>
                  Putuskan Koneksi Google
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveGoogleConfig} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Google Client ID</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="xxxxxx.apps.googleusercontent.com"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-secondary" style={{ flexGrow: 1 }}>
                    Simpan Client ID
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    disabled={!googleClientId}
                    onClick={handleConnectGoogle}
                    title={!googleClientId ? 'Masukkan Client ID terlebih dahulu' : 'Otorisasi di Google'}
                  >
                    Hubungkan Kalender
                  </button>
                </div>
                
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Catatan: Butuh Google OAuth Client ID dengan Redirect URI set ke <code>{window.location.origin}</code>. Jika tidak terhubung, sistem akan otomatis berjalan menggunakan <strong>Mode Simulasi Kalender Offline</strong>.
                </p>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
