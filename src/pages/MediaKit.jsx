import React, { useState, useEffect } from 'react';
import { User, Image, Plus, Trash, Download, Check, Save, Mail, ExternalLink, Sparkles, Send, Copy } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { apiGetProfile, apiSaveProfile, apiGeneratePitch } from '../utils/api';

const MediaKit = ({ profile, setProfile }) => {
  const parseFollowers = (str) => {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9.,kKmM]/g, '').trim().toLowerCase();
    let multiplier = 1;
    let valStr = cleaned;
    if (cleaned.endsWith('k')) {
      multiplier = 1000;
      valStr = cleaned.slice(0, -1);
    } else if (cleaned.endsWith('m')) {
      multiplier = 1000000;
      valStr = cleaned.slice(0, -1);
    }
    const num = parseFloat(valStr.replace(/,/g, '.')) || 0;
    return num * multiplier;
  };

  const formatFollowersCount = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const [editing, setEditing] = useState(false);
  const [formProfile, setFormProfile] = useState({
    name: '',
    handle: '',
    niche: '',
    bio: 'Saya membuat konten menarik tentang gaya hidup dan teknologi minimalis.',
    followers: '250.000',
    engagementRate: '4.8%',
    youtubeViews: '75.000',
    ratesList: [
      { service: '1x Instagram Reels', rate: 5000000 },
      { service: '3x Instagram Story Frames', rate: 2500000 },
      { service: '1x YouTube Video Integration', rate: 12000000 },
      { service: '1x TikTok Video Post', rate: 4500000 }
    ]
  });

  const [savedMsg, setSavedMsg] = useState(false);

  // Interactive Brand Pitch states
  const [pitchBrandName, setPitchBrandName] = useState('');
  const [pitchObjective, setPitchObjective] = useState('Brand Awareness');
  const [pitchServiceIdx, setPitchServiceIdx] = useState(0);
  const [pitchTone, setPitchTone] = useState('Profesional Formal');
  
  const [pitchSubject, setPitchSubject] = useState('');
  const [pitchBody, setPitchBody] = useState('');
  const [pitchLoading, setPitchLoading] = useState(false);
  
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormProfile(prev => ({
        ...prev,
        ...profile,
        ratesList: profile.ratesList || prev.ratesList
      }));
    }
  }, [profile]);

  const igNum = parseFollowers(formProfile.instagramFollowers);
  const ttNum = parseFollowers(formProfile.tiktokFollowers);
  const ytNum = parseFollowers(formProfile.youtubeFollowers);
  const combinedNum = igNum + ttNum + ytNum;
  const displayFollowers = combinedNum > 0 ? formatFollowersCount(combinedNum) : formProfile.followers;

  const handleAddRateItem = () => {
    setFormProfile({
      ...formProfile,
      ratesList: [...formProfile.ratesList, { service: '', rate: 0 }]
    });
  };

  const handleRemoveRateItem = (index) => {
    setFormProfile({
      ...formProfile,
      ratesList: formProfile.ratesList.filter((_, i) => i !== index)
    });
  };

  const handleRateItemChange = (index, field, value) => {
    const updated = formProfile.ratesList.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'rate' ? parseInt(value) || 0 : value
        };
      }
      return item;
    });
    setFormProfile({ ...formProfile, ratesList: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await apiSaveProfile(formProfile);
      setProfile(formProfile);
      setEditing(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePitch = async () => {
    if (!pitchBrandName.trim()) {
      alert('Harap masukkan nama brand target terlebih dahulu.');
      return;
    }

    setPitchLoading(true);
    setPitchSubject('');
    setPitchBody('');

    const selectedServiceObj = formProfile.ratesList[pitchServiceIdx] || { service: 'Layanan Kolaborasi', rate: 0 };
    const formattedRate = formatCurrency(selectedServiceObj.rate, formProfile.currency);

    try {
      const result = await apiGeneratePitch(
        pitchBrandName,
        pitchObjective,
        selectedServiceObj.service,
        formattedRate,
        pitchTone,
        formProfile,
        displayFollowers
      );
      
      setPitchSubject(result.subject || '');
      setPitchBody(result.body || '');
    } catch (err) {
      console.error(err);
      alert(`Gagal membuat draf pitch: ${err.message}`);
    } finally {
      setPitchLoading(false);
    }
  };

  const handleCopyPitchSubject = () => {
    navigator.clipboard.writeText(pitchSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyPitchBody = () => {
    navigator.clipboard.writeText(pitchBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div>
      {/* Print-only Wrapper (Hidden on screen) */}
      <div id="print-section" className="print-only">
        <div style={{ padding: '50px', backgroundColor: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '30px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', color: '#8b5cf6' }}>MEDIA KIT</h1>
            <h2 style={{ fontSize: '22px', margin: '0 0 4px 0', fontWeight: '600' }}>{formProfile.name}</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>{formProfile.handle} | {formProfile.niche}</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#666', borderBottom: '1px solid #eaeaea', paddingBottom: '6px' }}>Tentang Saya</h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: '8px 0 0 0', color: '#333' }}>{formProfile.bio}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px', textAlign: 'center' }}>
            <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Pengikut (Followers)</span>
              <h2 style={{ fontSize: '24px', margin: '6px 0 0 0', color: '#8b5cf6' }}>{displayFollowers}</h2>
            </div>
            <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Engagement Rate</span>
              <h2 style={{ fontSize: '24px', margin: '6px 0 0 0', color: '#8b5cf6' }}>{formProfile.engagementRate}</h2>
            </div>
            <div style={{ padding: '20px', border: '1px solid #eaeaea', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Rata-rata Tayangan</span>
              <h2 style={{ fontSize: '24px', margin: '6px 0 0 0', color: '#8b5cf6' }}>{formProfile.youtubeViews}</h2>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#666', borderBottom: '1px solid #eaeaea', paddingBottom: '6px', marginBottom: '16px' }}>Daftar Harga Jasa (Rate Card)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {formProfile.ratesList.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '500' }}>{item.service}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '600', color: '#8b5cf6' }}>
                      {formatCurrency(item.rate, formProfile.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '60px', borderTop: '1px solid #eaeaea', paddingTop: '20px', fontSize: '11px', color: '#999', textAlign: 'center' }}>
            Hubungi saya via email/DM untuk detail penawaran kustom. Dibuat otomatis menggunakan CreatorManager.
          </div>
        </div>
      </div>

      {/* Screen Layout */}
      <div className="no-print">
        <div className="content-header">
          <div className="content-title">
            <h1>Generator Media Kit & Rate Card</h1>
            <p>Kelola profil statistik media sosial Anda dan buat Media Kit estetik yang siap diunduh menjadi PDF.</p>
          </div>
          <div className="header-actions">
            {editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Batal</button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profil & Harga</button>
                <button className="btn btn-primary" onClick={handlePrint}><Download size={14} /> Cetak PDF</button>
              </>
            )}
          </div>
        </div>

        {savedMsg && (
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--border-radius-md)', 
            backgroundColor: 'var(--success-light)', 
            color: 'var(--success-color)', 
            marginBottom: '20px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <Check size={16} /> Profil Media Kit berhasil diperbarui!
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr' : '1.2fr 0.8fr', gap: '24px' }}>
          
          {/* Edit Form */}
          {editing ? (
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Ubah Profil & Rate Card</h3>
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Kreator</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.name}
                      onChange={e => setFormProfile({ ...formProfile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username Medsos</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.handle}
                      onChange={e => setFormProfile({ ...formProfile, handle: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ceruk Kreator (Niche)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.niche}
                      onChange={e => setFormProfile({ ...formProfile, niche: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mata Uang</label>
                    <select 
                      className="form-control"
                      value={formProfile.currency}
                      onChange={e => setFormProfile({ ...formProfile, currency: e.target.value })}
                    >
                      <option value="IDR">Rupiah (IDR)</option>
                      <option value="USD">Dolar AS (USD)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Deskripsi Singkat / Bio Tentang Anda</label>
                  <textarea 
                    className="form-control"
                    value={formProfile.bio}
                    onChange={e => setFormProfile({ ...formProfile, bio: e.target.value })}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div className="form-row" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div className="form-group">
                    <label>Jumlah Pengikut (e.g. 250k)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.followers}
                      onChange={e => setFormProfile({ ...formProfile, followers: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Engagement Rate (e.g. 4.8%)</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.engagementRate}
                      onChange={e => setFormProfile({ ...formProfile, engagementRate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rata-rata Tayangan/Views</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={formProfile.youtubeViews}
                      onChange={e => setFormProfile({ ...formProfile, youtubeViews: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontWeight: '600' }}>Daftar Harga Jasa (Rate Card)</label>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={handleAddRateItem}>
                      + Tambah Jasa
                    </button>
                  </div>

                  {formProfile.ratesList.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Nama Jasa (misal: 1x Reels)"
                        value={item.service}
                        onChange={e => handleRateItemChange(index, 'service', e.target.value)}
                        required
                        style={{ flexGrow: 2 }}
                      />
                      <input 
                        type="number" 
                        className="form-control"
                        placeholder="Harga"
                        value={item.rate}
                        onChange={e => handleRateItemChange(index, 'rate', e.target.value)}
                        required
                        style={{ width: '150px' }}
                      />
                      {formProfile.ratesList.length > 1 && (
                        <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemoveRateItem(index)}>
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
                  <Save size={14} /> Simpan Perubahan Profil
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Preview Layout Screen */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid var(--border-color)'
                  }}>
                    <User size={28} style={{ color: 'var(--accent-color)' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{formProfile.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formProfile.handle} | <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{formProfile.niche}</span></p>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>Tentang Kreator:</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{formProfile.bio}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Followers</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-color)', marginTop: '4px' }}>{displayFollowers}</h3>
                  </div>
                  <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Engagement Rate</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-color)', marginTop: '4px' }}>{formProfile.engagementRate}</h3>
                  </div>
                  <div className="card" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg. Views</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent-color)', marginTop: '4px' }}>{formProfile.youtubeViews}</h3>
                  </div>
                </div>
              </div>

              {/* Rate Card Preview List */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  Rate Card (Jasa Layanan)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '320px' }}>
                  {formProfile.ratesList.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 14px', 
                        borderRadius: 'var(--border-radius-md)', 
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.service}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--success-color)' }}>
                        {formatCurrency(item.rate, formProfile.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Interactive Brand Pitch Generator Panel */}
          {!editing && (
            <div className="card" style={{ gridColumn: 'span 2', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Generator Penawaran Sponsor (Brand Pitch)
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Buat draf proposal email sponsor penawaran kerja sama untuk brand target menggunakan data Media Kit Anda.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Brand Name */}
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>NAMA BRAND TARGET</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="misal: Tokopedia, Shopee, Samsung"
                    value={pitchBrandName}
                    onChange={(e) => setPitchBrandName(e.target.value)}
                  />
                </div>

                {/* Campaign Objective */}
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>TUJUAN KAMPANYE</label>
                  <select 
                    className="form-control"
                    value={pitchObjective}
                    onChange={(e) => setPitchObjective(e.target.value)}
                  >
                    <option value="Brand Awareness">Brand Awareness (Jangkauan luas)</option>
                    <option value="Product Launch">Product Launch (Peluncuran produk baru)</option>
                    <option value="Conversions / Sales">Conversions / Sales (Penjualan/Klik)</option>
                  </select>
                </div>

                {/* Selected Service */}
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>LAYANAN JASA DITAWARKAN</label>
                  <select 
                    className="form-control"
                    value={pitchServiceIdx}
                    onChange={(e) => setPitchServiceIdx(parseInt(e.target.value))}
                  >
                    {formProfile.ratesList.map((item, idx) => (
                      <option key={idx} value={idx}>
                        {item.service} ({formatCurrency(item.rate, formProfile.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tone of Voice */}
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>GAYA BAHASA (TONE)</label>
                  <select 
                    className="form-control"
                    value={pitchTone}
                    onChange={(e) => setPitchTone(e.target.value)}
                  >
                    <option value="Profesional Formal">Profesional & Formal</option>
                    <option value="Kasual / Akrab">Kasual & Akrab</option>
                    <option value="Kreatif / Out of the box">Kreatif & Out of the box</option>
                  </select>
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={handleGeneratePitch}
                disabled={pitchLoading || !pitchBrandName.trim()}
                style={{ width: '100%' }}
              >
                {pitchLoading ? 'Menyusun Proposal AI...' : 'Buat Proposal Penawaran (AI)'}
              </button>

              {/* Pitch Output Preview */}
              {(pitchSubject || pitchBody) && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Subject Line */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>SUBJEK EMAIL</span>
                      <button 
                        className="btn btn-secondary"
                        onClick={handleCopyPitchSubject}
                        style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                      >
                        {copiedSubject ? <><Check size={10} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={10} /> Salin Subjek</>}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={pitchSubject}
                      onChange={(e) => setPitchSubject(e.target.value)}
                      style={{ fontSize: '13px', fontWeight: '500' }}
                    />
                  </div>

                  {/* Body Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>ISI EMAIL PENAWARAN (PITCH)</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCopyPitchBody}
                          style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
                        >
                          {copiedBody ? <><Check size={10} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={10} /> Salin Isi Email</>}
                        </button>
                        <a 
                          href={`mailto:?subject=${encodeURIComponent(pitchSubject)}&body=${encodeURIComponent(pitchBody)}`}
                          className="btn btn-primary"
                          style={{ 
                            padding: '2px 8px', 
                            fontSize: '11px', 
                            height: '24px', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            textDecoration: 'none',
                            color: '#fff'
                          }}
                        >
                          <Send size={10} /> Kirim Langsung
                        </a>
                      </div>
                    </div>
                    <textarea 
                      className="form-control" 
                      value={pitchBody}
                      onChange={(e) => setPitchBody(e.target.value)}
                      style={{ minHeight: '220px', fontSize: '12.5px', fontFamily: 'var(--font-sans)', lineHeight: '1.6' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MediaKit;
