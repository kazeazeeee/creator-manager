import React, { useState, useEffect } from 'react';
import { User, Image, Plus, Trash, Download, Check, Save, Mail, ExternalLink, Sparkles, Send, Copy } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { apiGetProfile, apiSaveProfile, apiGeneratePitch, apiOptimizeRates } from '../utils/api';

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
  const [pdfTheme, setPdfTheme] = useState('light'); // 'light', 'dark', 'sunset'

  const themeStyles = {
    light: {
      bg: '#ffffff',
      text: '#1f2937',
      textSec: '#6b7280',
      accent: '#7c3aed', // Violet
      accentBg: '#f5f3ff',
      border: '#e5e7eb',
      cardBg: '#f9fafb',
      title: '#4b5563'
    },
    dark: {
      bg: '#1a1f29',
      text: '#f8fafc',
      textSec: '#94a3b8',
      accent: '#06b6d4', // Cyan
      accentBg: 'rgba(6, 182, 212, 0.1)',
      border: '#355a66', // Teal border
      cardBg: '#181a1f',
      title: '#5c6370'
    },
    sunset: {
      bg: '#fffdf9', // Soft Cream
      text: '#27272a', // Charcoal
      textSec: '#71717a',
      accent: '#f43f5e', // Coral Rose
      accentBg: '#fff1f2',
      border: '#e7e5e4',
      cardBg: '#fafaf9',
      title: '#4a5568'
    }
  };

  const [formProfile, setFormProfile] = useState({
    name: '',
    handle: '',
    niche: '',
    bio: 'Saya membuat konten menarik tentang gaya hidup dan teknologi minimalis.',
    followers: '250.000',
    engagementRate: '4.8%',
    youtubeViews: '75.000',
    email: '',
    bankHolder: '',
    instagramFollowers: '',
    tiktokFollowers: '',
    tiktokLikes: '',
    youtubeFollowers: '',
    youtubeVideos: '',
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

  // AI Rate Optimizer states
  const [targetIncomeVal, setTargetIncomeVal] = useState('15000000');
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optResult, setOptResult] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleOptimizeRates = async () => {
    const target = parseInt(targetIncomeVal);
    if (isNaN(target) || target <= 0) {
      alert('Harap masukkan target pendapatan bulanan yang valid.');
      return;
    }

    setOptimizeLoading(true);
    setOptResult(null);
    setApplySuccess(false);

    try {
      const res = await apiOptimizeRates(target);
      if (res && res.recommendedRates) {
        setOptResult(res);
      } else {
        throw new Error('Hasil analisis tidak lengkap.');
      }
    } catch (err) {
      console.error(err);
      alert(`Gagal optimasi: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const handleApplyRecommendedRates = async () => {
    if (!optResult || !optResult.recommendedRates) return;
    
    const newRatesList = optResult.recommendedRates.map(item => ({
      service: item.service,
      rate: item.rate
    }));

    const updatedProfile = {
      ...formProfile,
      ratesList: newRatesList
    };

    try {
      await apiSaveProfile(updatedProfile);
      setFormProfile(updatedProfile);
      setProfile(updatedProfile);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err) {
      alert(`Gagal menerapkan tarif baru: ${err.message}`);
    }
  };

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

  const renderPdfContent = (isPreview = false) => {
    const st = themeStyles[pdfTheme] || themeStyles.light;
    
    return (
      <div style={{ 
        padding: isPreview ? '24px' : '40px', 
        backgroundColor: st.bg, 
        color: st.text, 
        fontFamily: 'var(--font-sans)',
        borderRadius: isPreview ? 'var(--border-radius-md)' : '0',
        border: isPreview ? `1px solid ${st.border}` : 'none',
        boxShadow: isPreview ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header accent bar */}
        <div style={{ 
          height: '6px', 
          backgroundColor: st.accent, 
          borderRadius: '3px 3px 0 0', 
          margin: isPreview ? '-24px -24px 20px -24px' : '-40px -40px 30px -40px' 
        }}></div>

        {/* Bio & Brand Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: `2px solid ${st.border}`, paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: isPreview ? '22px' : '28px', margin: '0 0 4px 0', fontWeight: '800', letterSpacing: '-0.025em', color: st.text }}>
              {formProfile.name || 'Nama Kreator'}
            </h1>
            <p style={{ color: st.accent, fontSize: isPreview ? '12px' : '14px', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {formProfile.handle || '@username'} &bull; {formProfile.niche || 'Niche Konten'}
            </p>
            <p style={{ color: st.textSec, fontSize: '12.5px', lineHeight: '1.5', margin: 0, maxWidth: '500px' }}>
              {formProfile.bio}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: st.textSec, minWidth: '180px', textAlign: isPreview ? 'left' : 'right' }}>
            <div style={{ fontWeight: '700', textTransform: 'uppercase', color: st.text, marginBottom: '4px', letterSpacing: '0.05em' }}>KONTAK &amp; MEDIA</div>
            {formProfile.email && <div><strong>Email:</strong> {formProfile.email}</div>}
            {formProfile.instagram && <div style={{ wordBreak: 'break-all' }}><strong>Instagram:</strong> instagram.com/{formProfile.handle}</div>}
            {formProfile.tiktok && <div style={{ wordBreak: 'break-all' }}><strong>TikTok:</strong> tiktok.com/@{formProfile.handle}</div>}
            {formProfile.youtube && <div style={{ wordBreak: 'break-all' }}><strong>YouTube:</strong> youtube.com/{formProfile.handle}</div>}
          </div>
        </div>

        {/* Platform Stat breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: st.text, letterSpacing: '0.05em', borderBottom: `1px solid ${st.border}`, paddingBottom: '6px', marginBottom: '12px' }}>
            Statistik &amp; Jangkauan Akun
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Instagram Card */}
            <div style={{ padding: '12px', border: `1px solid ${st.border}`, borderRadius: '6px', backgroundColor: st.cardBg }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: st.text, marginBottom: '6px' }}>
                Instagram
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: st.text }}>{formProfile.instagramFollowers || '-'}</span>
                <span style={{ fontSize: '9px', color: st.textSec }}>Pengikut</span>
              </div>
            </div>
            
            {/* TikTok Card */}
            <div style={{ padding: '12px', border: `1px solid ${st.border}`, borderRadius: '6px', backgroundColor: st.cardBg }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: st.text, marginBottom: '6px' }}>
                TikTok
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: st.text }}>{formProfile.tiktokFollowers || '-'}</span>
                <span style={{ fontSize: '9px', color: st.textSec }}>Pengikut {formProfile.tiktokLikes ? `(${formProfile.tiktokLikes} Likes)` : ''}</span>
              </div>
            </div>

            {/* YouTube Card */}
            <div style={{ padding: '12px', border: `1px solid ${st.border}`, borderRadius: '6px', backgroundColor: st.cardBg }}>
              <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: st.text, marginBottom: '6px' }}>
                YouTube
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: st.text }}>{formProfile.youtubeFollowers || '-'}</span>
                <span style={{ fontSize: '9px', color: st.textSec }}>Subscribers {formProfile.youtubeVideos ? `(${formProfile.youtubeVideos} Video)` : ''}</span>
              </div>
            </div>
          </div>

          {/* Aggregated Stats Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '12px', padding: '10px 12px', border: `1px solid ${st.border}`, borderRadius: '6px', backgroundColor: st.accentBg }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: st.textSec, fontWeight: '700' }}>Total Jangkauan (Audience Reach)</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: st.text }}>{displayFollowers} Pengikut</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: st.textSec, fontWeight: '700' }}>Engagement Rate</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: st.accent }}>{formProfile.engagementRate || '4.8%'}</span>
              </div>
            </div>
            {formProfile.youtubeViews && (
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ fontSize: '8.5px', textTransform: 'uppercase', color: st.textSec, fontWeight: '700' }}>Rata-rata Views</span>
                <span style={{ fontSize: '14px', fontWeight: '800', color: st.text }}>{formProfile.youtubeViews} / Post</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Content Showcase */}
        {formProfile.recentPosts && formProfile.recentPosts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: st.text, letterSpacing: '0.05em', borderBottom: `1px solid ${st.border}`, paddingBottom: '6px', marginBottom: '12px' }}>
              Konten Terbaru &amp; Performa
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {formProfile.recentPosts.slice(0, 3).map((post, idx) => (
                <div key={idx} style={{ padding: '10px', border: `1px solid ${st.border}`, borderRadius: '6px', backgroundColor: st.cardBg, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '8px', 
                      fontWeight: '700', 
                      padding: '1px 5px', 
                      borderRadius: '3px',
                      backgroundColor: post.platform === 'TikTok' ? 'rgba(0,0,0,0.15)' : post.platform === 'YouTube' ? 'rgba(255,0,0,0.1)' : 'rgba(225,48,108,0.1)',
                      color: post.platform === 'TikTok' ? st.text : post.platform === 'YouTube' ? '#ff0000' : '#e1306c'
                    }}>
                      {post.platform}
                    </span>
                    <span style={{ fontSize: '8px', color: st.textSec }}>{post.uploadDate}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: st.text, height: '32px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.3' }}>
                    {post.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${st.border}`, paddingTop: '4px', fontSize: '9px', color: st.textSec }}>
                    <span><strong>Views:</strong> {(post.views || 0).toLocaleString('id-ID')}</span>
                    <span><strong>Likes:</strong> {(post.likes || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rate Card Table */}
        <div className="no-break-box" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: st.text, letterSpacing: '0.05em', borderBottom: `1px solid ${st.border}`, paddingBottom: '6px', marginBottom: '12px' }}>
            Daftar Tarif Layanan (Rate Card)
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: `1px solid ${st.border}`, borderRadius: '6px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: st.cardBg, borderBottom: `1px solid ${st.border}` }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '700', color: st.text }}>Jenis Deliverable</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: st.text }}>Tarif Bersih ({formProfile.currency || 'IDR'})</th>
              </tr>
            </thead>
            <tbody>
              {formProfile.ratesList.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx < formProfile.ratesList.length - 1 ? `1px solid ${st.border}` : 'none' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '500', color: st.text }}>{item.service}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: st.accent }}>
                    {formatCurrency(item.rate, formProfile.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cooperation terms */}
        <div className="no-break-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '10px', color: st.textSec, borderTop: `1px solid ${st.border}`, paddingTop: '12px' }}>
          <div>
            <div style={{ fontWeight: '700', color: st.text, marginBottom: '4px', textTransform: 'uppercase' }}>Kebijakan &amp; Kerja Sama</div>
            <ul style={{ paddingLeft: '12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Batas revisi gratis maksimal 2 kali untuk penyesuaian minor.</li>
              <li>Draf konten dikirimkan untuk ditinjau 3 hari sebelum tayang.</li>
              <li>Pihak Brand wajib menyediakan asset visual &amp; brief resmi.</li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: '700', color: st.text, marginBottom: '4px', textTransform: 'uppercase' }}>Metode Pembayaran</div>
            <ul style={{ paddingLeft: '12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li>Pembayaran transfer ke rekening atas nama: <strong>{formProfile.bankHolder || formProfile.name}</strong>.</li>
              <li>Termin pembayaran standar: NET 30 setelah invoice resmi diterbitkan.</li>
              <li>Uang muka (DP) 50% untuk kolaborasi baru.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          borderTop: `1px solid ${st.border}`, 
          paddingTop: '12px', 
          fontSize: '9.5px', 
          color: st.textSec, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span>Konten media kit ini terintegrasi secara dinamis dengan CreatorManager.</span>
          <strong>CREATORMANAGER</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="media-kit-container">
      {/* 
        The printable section is kept completely clean of App UI.
        Only #print-section is shown when printing.
      */}
      <div id="print-section" className="print-only">
        {renderPdfContent(false)}
      </div>

      {/* Screen Layout */}
      <div className="no-print">
        <div className="content-header">
          <div className="content-title">
            <h1>Generator Media Kit &amp; Rate Card</h1>
            <p>Kelola profil statistik media sosial Anda dan buat Media Kit estetik yang siap diunduh menjadi PDF.</p>
          </div>
          <div className="header-actions">
            {editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Batal</button>
            ) : (
              <>
                {/* Print PDF Theme Selector */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>TEMA PDF:</span>
                  <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                    <button 
                      onClick={() => setPdfTheme('light')}
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600', background: pdfTheme === 'light' ? 'var(--text-primary)' : 'var(--bg-secondary)', color: pdfTheme === 'light' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Clean Light
                    </button>
                    <button 
                      onClick={() => setPdfTheme('dark')}
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600', background: pdfTheme === 'dark' ? 'var(--text-primary)' : 'var(--bg-secondary)', color: pdfTheme === 'dark' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: 'none', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Midnight Cyan
                    </button>
                    <button 
                      onClick={() => setPdfTheme('sunset')}
                      style={{ padding: '6px 12px', fontSize: '11px', fontWeight: '600', background: pdfTheme === 'sunset' ? 'var(--text-primary)' : 'var(--bg-secondary)', color: pdfTheme === 'sunset' ? 'var(--bg-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Sunset Rose
                    </button>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit Profil &amp; Harga</button>
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
              <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Ubah Profil &amp; Rate Card</h3>
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

                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>Detail Akun &amp; Kontak Bisnis</label>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Bisnis</label>
                      <input 
                        type="email" 
                        className="form-control"
                        placeholder="email@bisnis.com"
                        value={formProfile.email || ''}
                        onChange={e => setFormProfile({ ...formProfile, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Pemilik Rekening Bank (Bank Holder)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Nama Lengkap"
                        value={formProfile.bankHolder || ''}
                        onChange={e => setFormProfile({ ...formProfile, bankHolder: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label>Pengikut Instagram (e.g. 115K)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formProfile.instagramFollowers || ''}
                        onChange={e => setFormProfile({ ...formProfile, instagramFollowers: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pengikut TikTok (e.g. 768K)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formProfile.tiktokFollowers || ''}
                        onChange={e => setFormProfile({ ...formProfile, tiktokFollowers: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Likes TikTok (e.g. 56M)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formProfile.tiktokLikes || ''}
                        onChange={e => setFormProfile({ ...formProfile, tiktokLikes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ marginTop: '12px' }}>
                    <div className="form-group">
                      <label>Subscribers YouTube (e.g. 238K)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formProfile.youtubeFollowers || ''}
                        onChange={e => setFormProfile({ ...formProfile, youtubeFollowers: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Video YouTube (e.g. 292)</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={formProfile.youtubeVideos || ''}
                        onChange={e => setFormProfile({ ...formProfile, youtubeVideos: e.target.value })}
                      />
                    </div>
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
              {/* Live Media Kit Preview Column */}
              <div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', margin: 0 }}>
                    Pratinjau Media Kit
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Tampilan live sesuai tema cetak terpilih
                  </span>
                </div>
                {renderPdfContent(true)}
              </div>

              {/* Brand Pitch Generator Column */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Sparkles size={16} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Proposal Sponsor (Brand Pitch)
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>Buat draf proposal email sponsor untuk brand target menggunakan data Media Kit Anda.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Brand Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAMA BRAND TARGET</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="misal: Tokopedia, Shopee, Samsung"
                      value={pitchBrandName}
                      onChange={(e) => setPitchBrandName(e.target.value)}
                    />
                  </div>

                  {/* Campaign Objective */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TUJUAN KAMPANYE</label>
                    <select 
                      className="form-control"
                      value={pitchObjective}
                      onChange={(e) => setPitchObjective(e.target.value)}
                    >
                      <option value="Brand Awareness">Brand Awareness (Jangkauan luas)</option>
                      <option value="Product Launch">Product Launch (Produk baru)</option>
                      <option value="Conversions / Sales">Conversions / Sales (Penjualan)</option>
                    </select>
                  </div>

                  {/* Selected Service */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LAYANAN JASA DITAWARKAN</label>
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
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GAYA BAHASA (TONE)</label>
                    <select 
                      className="form-control"
                      value={pitchTone}
                      onChange={(e) => setPitchTone(e.target.value)}
                    >
                      <option value="Profesional Formal">Profesional &amp; Formal</option>
                      <option value="Kasual / Akrab">Kasual &amp; Akrab</option>
                      <option value="Kreatif / Out of the box">Kreatif &amp; Out of the box</option>
                    </select>
                  </div>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleGeneratePitch}
                  disabled={pitchLoading || !pitchBrandName.trim()}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {pitchLoading ? 'Menyusun Proposal AI...' : 'Buat Proposal Penawaran (AI)'}
                </button>

                {/* Pitch Output Preview */}
                {(pitchSubject || pitchBody) && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '14px',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Subject Line */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>SUBJEK EMAIL</span>
                        <button 
                          className="btn btn-secondary"
                          onClick={handleCopyPitchSubject}
                          style={{ padding: '2px 6px', fontSize: '10px', height: '22px' }}
                        >
                          {copiedSubject ? <><Check size={10} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={10} /> Salin</>}
                        </button>
                      </div>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={pitchSubject}
                        onChange={(e) => setPitchSubject(e.target.value)}
                        style={{ fontSize: '12.5px', fontWeight: '500' }}
                      />
                    </div>

                    {/* Body Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ISI EMAIL PITCH</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary"
                            onClick={handleCopyPitchBody}
                            style={{ padding: '2px 6px', fontSize: '10px', height: '22px' }}
                          >
                            {copiedBody ? <><Check size={10} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={10} /> Salin</>}
                          </button>
                          <a 
                            href={`mailto:?subject=${encodeURIComponent(pitchSubject)}&body=${encodeURIComponent(pitchBody)}`}
                            className="btn btn-primary"
                            style={{ 
                              padding: '2px 6px', 
                              fontSize: '10px', 
                              height: '22px', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              textDecoration: 'none',
                              color: '#fff'
                            }}
                          >
                            <Send size={8} /> Kirim
                          </a>
                        </div>
                      </div>
                      <textarea 
                        className="form-control" 
                        value={pitchBody}
                        onChange={(e) => setPitchBody(e.target.value)}
                        style={{ minHeight: '180px', fontSize: '12px', fontFamily: 'var(--font-sans)', lineHeight: '1.55' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* AI Rate Card & Target Income Optimizer Panel */}
        {!editing && (
          <div className="card" style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Sparkles size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Kalkulator Optimalisasi Pendapatan &amp; Rate Card (AI)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Masukkan target pendapatan bulanan Anda untuk merancang struktur rate card optimal berdasarkan metrik akun Anda.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flexGrow: 1, minWidth: '200px', marginBottom: 0 }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>TARGET PENDAPATAN BULANAN (NET - {formProfile.currency || 'IDR'})</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={targetIncomeVal}
                  onChange={(e) => setTargetIncomeVal(e.target.value)}
                  placeholder="misal: 15000000"
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleOptimizeRates}
                disabled={optimizeLoading || !targetIncomeVal}
                style={{ height: '38px', minWidth: '160px' }}
              >
                {optimizeLoading ? 'Mengoptimalkan...' : 'Optimalkan Rate Card'}
              </button>
            </div>

            {optResult && (
              <div style={{ 
                marginTop: '12px',
                padding: '18px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Analysis Text */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Analisis Kelayakan AI</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{optResult.analysis}</p>
                </div>

                {/* Recommended Rates Table */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Rekomendasi Tarif Per Postingan</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Jasa Layanan</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>Tarif Rekomendasi AI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optResult.recommendedRates.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.service}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--success-color)', fontWeight: '600', textAlign: 'right' }}>
                              {formatCurrency(item.rate, formProfile.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Action Plan Table */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Rencana Kerja Bulanan Untuk Target</h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Deliverable</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>Tarif</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center' }}>Jumlah Post</th>
                          <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optResult.monthlyPlan.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>{item.item}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', textAlign: 'right' }}>{formatCurrency(item.rate, formProfile.currency)}</td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '600' }}>{item.quantity}x</td>
                            <td style={{ padding: '8px 12px', color: 'var(--success-color)', fontWeight: '600', textAlign: 'right' }}>{formatCurrency(item.subtotal, formProfile.currency)}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '1.5px solid var(--border-color)' }}>
                          <td colSpan="3" style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>Estimasi Pendapatan Kotor Bulanan</td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--success-color)', textAlign: 'right', fontSize: '14.5px' }}>
                            {formatCurrency(optResult.totalEstimated, formProfile.currency)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Tips */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Rekomendasi Bisnis &amp; Negosiasi AI</h4>
                  <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {optResult.actionTips.map((tip, idx) => (
                      <li key={idx} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Apply Rates Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button 
                    className={`btn ${applySuccess ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleApplyRecommendedRates}
                    disabled={applySuccess}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', padding: '8px 16px' }}
                  >
                    {applySuccess ? (
                      <>
                        <Check size={14} style={{ color: 'var(--success-color)' }} /> Tarif Baru Berhasil Diterapkan!
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Terapkan Rekomendasi Tarif AI Ke Media Kit
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaKit;
