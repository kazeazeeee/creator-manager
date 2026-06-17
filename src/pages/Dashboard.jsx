import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Check,
  Coffee
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { apiGetDailyIdea, apiSyncSocialMetrics, apiGetBriefing } from '../utils/api';
const formatText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} style={{ height: '8px' }} />;
    
    const isBullet = trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•') || /^\d+\./.test(trimmed);
    
    let cleanedLine = trimmed;
    if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
      cleanedLine = trimmed.substring(1).trim();
    }
    
    if (isBullet) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '6px', paddingLeft: '8px', alignItems: 'start' }}>
          <span style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '2px' }}>•</span>
          <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{cleanedLine}</span>
        </div>
      );
    }
    
    return (
      <p key={idx} style={{ marginBottom: '10px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        {trimmed}
      </p>
    );
  });
};

const Dashboard = ({ 
  invoices = [], 
  pipelineTasks = [], 
  calendarEvents = [], 
  setActiveTab,
  addPipelineTask,
  profile = {},
  setProfile
}) => {
  const [briefingText, setBriefingText] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [errorBriefing, setErrorBriefing] = useState(null);

  const loadBriefing = async () => {
    setLoadingBriefing(true);
    setErrorBriefing(null);
    try {
      const res = await apiGetBriefing();
      if (res && res.briefing) {
        setBriefingText(res.briefing);
      } else {
        throw new Error("Gagal memuat briefing harian.");
      }
    } catch (err) {
      console.error(err);
      setErrorBriefing(err.message || "Gagal memuat briefing.");
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    loadBriefing();
  }, []);

  const [syncingSocials, setSyncingSocials] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const handleSyncSocials = async () => {
    setSyncingSocials(true);
    setSyncError(null);
    try {
      const res = await apiSyncSocialMetrics();
      if (res && res.success) {
        setProfile(res.profile);
      } else {
        throw new Error("Gagal menyinkronkan data.");
      }
    } catch (err) {
      console.error(err);
      setSyncError(err.message || "Gagal menyinkronkan pengikut sosial media.");
    } finally {
      setSyncingSocials(false);
    }
  };
  const [dailyIdea, setDailyIdea] = useState(null);
  const [loadingDailyIdea, setLoadingDailyIdea] = useState(false);
  const [errorDailyIdea, setErrorDailyIdea] = useState(null);
  const [ideaAdded, setIdeaAdded] = useState(false);

  const loadDailyIdea = async (force = false) => {
    setLoadingDailyIdea(true);
    setErrorDailyIdea(null);
    setIdeaAdded(false);
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (!force) {
      const saved = localStorage.getItem('daily_idea_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.date === todayStr) {
            setDailyIdea(parsed.idea);
            setLoadingDailyIdea(false);
            
            // Check if this idea was already added to the pipeline
            const alreadyExists = pipelineTasks.some(t => t.title === parsed.idea.title);
            if (alreadyExists) {
              setIdeaAdded(true);
            }
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached daily idea:', e);
        }
      }
    }
    
    try {
      const data = await apiGetDailyIdea();
      if (data && data.title) {
        setDailyIdea(data);
        localStorage.setItem('daily_idea_data', JSON.stringify({
          date: todayStr,
          idea: data
        }));
      } else {
        throw new Error('Respons AI tidak lengkap atau tidak valid.');
      }
    } catch (err) {
      console.error(err);
      setErrorDailyIdea(err.message || 'Gagal memuat ide konten harian.');
    } finally {
      setLoadingDailyIdea(false);
    }
  };

  useEffect(() => {
    loadDailyIdea(false);
  }, []);

  // Sync added status if tasks change
  useEffect(() => {
    if (dailyIdea && pipelineTasks.some(t => t.title === dailyIdea.title)) {
      setIdeaAdded(true);
    } else {
      setIdeaAdded(false);
    }
  }, [pipelineTasks, dailyIdea]);

  const handleAddToPipeline = () => {
    if (!dailyIdea) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: dailyIdea.title,
      brand: 'Ide Harian AI',
      platform: dailyIdea.platform || 'TikTok',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Besok
      deliverables: dailyIdea.deliverables || '1x Video',
      notes: `Konsep: ${dailyIdea.concept}\n\nHook: ${dailyIdea.hook}\n\nCatatan Viral: ${dailyIdea.notes}`,
      status: 'idea'
    };
    addPipelineTask(newTask);
    setIdeaAdded(true);
  };
  
  // Calculations
  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const activeProjectsCount = pipelineTasks
    .filter(task => task.status !== 'published').length;

  const urgentTasks = pipelineTasks
    .filter(task => {
      if (task.status === 'published') return false;
      const today = new Date();
      const due = new Date(task.dueDate);
      const diffTime = due - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });

  return (
    <div>
      <div className="content-header">
        <div className="content-title">
          <h1>Ringkasan Dasbor</h1>
          <p>Pantau status finansial, jadwal, dan tenggat waktu konten Anda.</p>
        </div>
      </div>

      {/* Morning Briefing Card */}
      <div className="card" style={{ 
        marginBottom: '24px', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(24, 26, 31, 0.9) 0%, rgba(53, 90, 102, 0.2) 100%)',
        border: '1.5px solid var(--border-color)',
        padding: '20px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', margin: 0, color: 'var(--text-primary)' }}>
            <Coffee size={16} style={{ color: 'var(--accent-color)' }} /> Briefing Pagi Manajer
          </h3>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={loadBriefing}
            disabled={loadingBriefing}
          >
            <RefreshCw size={11} className={loadingBriefing ? 'spin-animation' : ''} />
            {loadingBriefing ? 'Memuat...' : 'Perbarui'}
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {loadingBriefing ? (
            <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <RefreshCw className="spin-animation" size={13} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '13px' }}>Manajer sedang merangkum status hari ini...</span>
            </div>
          ) : errorBriefing ? (
            <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ {errorBriefing}</span>
              <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10.5px', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={loadBriefing}>Coba Lagi</button>
            </div>
          ) : briefingText ? (
            <div style={{ 
              fontSize: '13.5px', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6',
              backgroundColor: 'rgba(17, 17, 17, 0.4)',
              padding: '14px 16px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1.5px solid var(--border-color)'
            }}>
              {formatText(briefingText)}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Belum ada briefing hari ini.</div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="card stats-card">
          <div className="stats-header">
            <span>Pendapatan Cair</span>
            <DollarSign size={16} className="text-success" style={{ color: 'var(--success-color)' }} />
          </div>
          <div className="stats-value">{formatCurrency(totalPaid)}</div>
          <div className="stats-change up">
            <TrendingUp size={12} />
            <span>Invoice Lunas</span>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-header">
            <span>Tertunda & Telat</span>
            <Clock size={16} className="text-warning" style={{ color: 'var(--warning-color)' }} />
          </div>
          <div className="stats-value">{formatCurrency(totalPending + totalOverdue)}</div>
          <div className="stats-change down" style={{ color: totalOverdue > 0 ? 'var(--danger-color)' : 'var(--warning-color)' }}>
            {totalOverdue > 0 ? <TrendingDown size={12} /> : <Clock size={12} />}
            <span>{totalOverdue > 0 ? `${formatCurrency(totalOverdue)} Telat Bayar` : 'Menunggu pembayaran'}</span>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-header">
            <span>Proyek Aktif</span>
            <CalendarIcon size={16} className="text-accent" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="stats-value">{activeProjectsCount}</div>
          <div className="stats-change up" style={{ color: 'var(--accent-color)' }}>
            <span>Dalam Alur Kerja Konten</span>
          </div>
        </div>
      </div>

      {/* Social Media Tracker Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-color)' }} /> Pemantau Statistik Sosial Media
            </h3>
            {profile.socialsLastSynced ? (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Terakhir diperbarui: {new Date(profile.socialsLastSynced).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Belum disinkronkan</span>
            )}
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12.5px', border: '1px solid var(--border-color)' }}
            onClick={handleSyncSocials}
            disabled={syncingSocials}
          >
            <RefreshCw size={13} className={syncingSocials ? 'spin-animation' : ''} />
            {syncingSocials ? 'Menyinkronkan...' : 'Perbarui Statistik'}
          </button>
        </div>

        {syncError && (
          <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>
            {syncError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Instagram Stat */}
          <div style={{ 
            padding: '18px', 
            borderRadius: 'var(--border-radius-md)', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', textAlign: 'center', lineHeight: '22px', fontSize: '11px', color: 'white', fontWeight: 'bold' }}>IG</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Instagram</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1 }}>
              {profile.instagramFollowers || '-'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>Pengikut (Followers)</span>
            {profile.instagram && (
              <a href={profile.instagram} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '500', textDecoration: 'none', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Lihat Profil &rarr;
              </a>
            )}
          </div>

          {/* TikTok Stat */}
          <div style={{ 
            padding: '18px', 
            borderRadius: 'var(--border-radius-md)', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#000000', border: '1px solid #333', textAlign: 'center', lineHeight: '20px', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>TT</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>TikTok</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1 }}>
              {profile.tiktokFollowers || '-'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>
              Pengikut {profile.tiktokLikes ? `• ${profile.tiktokLikes} Suka` : ''}
            </span>
            {profile.tiktok && (
              <a href={profile.tiktok} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '500', textDecoration: 'none', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Lihat Profil &rarr;
              </a>
            )}
          </div>

          {/* YouTube Stat */}
          <div style={{ 
            padding: '18px', 
            borderRadius: 'var(--border-radius-md)', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#FF0000', textAlign: 'center', lineHeight: '22px', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>YT</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>YouTube</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1 }}>
              {profile.youtubeFollowers || '-'}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>
              Subscribers {profile.youtubeVideos ? `• ${profile.youtubeVideos} Video` : ''}
            </span>
            {profile.youtube && (
              <a href={profile.youtube} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '500', textDecoration: 'none', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Lihat Channel &rarr;
              </a>
            )}
          </div>

          {/* Engagement Rate Radial Gauge Stat Card */}
          <div style={{ 
            padding: '18px', 
            borderRadius: 'var(--border-radius-md)', 
            border: '1px solid var(--border-color)', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', alignSelf: 'flex-start' }}>
              <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '6px', backgroundColor: 'var(--success-color)', textAlign: 'center', lineHeight: '22px', fontSize: '10px', color: 'var(--bg-secondary)', fontWeight: 'bold' }}>ER</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Rasio Interaksi (ER)</span>
            </div>

            {/* Custom SVG Radial Gauge */}
            {(() => {
              const erPercent = parseFloat(profile.engagementRate || '4.8') || 4.8;
              const maxGaugeScale = 15; // 15% ER is considered maximum for scaling
              const fillPct = Math.min(100, (erPercent / maxGaugeScale) * 100);
              const arcLength = 157.08; // Circumference of semicircle (pi * r = pi * 50)
              const offset = arcLength - (fillPct / 100) * arcLength;
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px', width: '100%' }}>
                  <svg width="140" height="75" viewBox="0 0 140 75" style={{ display: 'block' }}>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--text-primary)" />
                        <stop offset="100%" stopColor="var(--success-color)" />
                      </linearGradient>
                    </defs>
                    {/* Background Arc */}
                    <path
                      d="M 20,70 A 50,50 0 0,1 120,70"
                      fill="none"
                      stroke="var(--border-color)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity={0.3}
                    />
                    {/* Filled Arc */}
                    <path
                      d="M 20,70 A 50,50 0 0,1 120,70"
                      fill="none"
                      stroke="url(#gaugeGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={arcLength}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                    {/* Display Value Text */}
                    <text x="70" y="55" textAnchor="middle" fontSize="16px" fontWeight="bold" fill="var(--text-primary)">
                      {erPercent}%
                    </text>
                    <text x="70" y="68" textAnchor="middle" fontSize="9px" fill="var(--text-secondary)">
                      Skala 0 - 15%
                    </text>
                  </svg>
                  <span style={{ fontSize: '11px', color: erPercent >= 5 ? 'var(--success-color)' : 'var(--warning-color)', fontWeight: '600', marginTop: '6px' }}>
                    {erPercent >= 5 ? 'Sangat Kuat (Strong)' : 'Stabil (Average)'}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Urgent Notifications */}
      {(totalOverdue > 0 || urgentTasks.length > 0) && (
        <div className="card" style={{ marginBottom: '24px', borderColor: 'var(--danger-color)', backgroundColor: 'rgba(244, 63, 94, 0.02)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-color)', marginBottom: '12px', fontSize: '15px' }}>
            <AlertCircle size={18} /> Tindakan Mendesak Diperlukan
          </h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {totalOverdue > 0 && (
              <li style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚠️ Ada invoice senilai <strong>{formatCurrency(totalOverdue)}</strong> yang telah melewati tanggal jatuh tempo pembayaran!</span>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setActiveTab('invoices')}>
                  Kirim Pengingat
                </button>
              </li>
            )}
            {urgentTasks.map(task => (
              <li key={task.id} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⏰ Proyek <strong>"{task.title}"</strong> untuk <strong>{task.brand}</strong> jatuh tempo pada {task.dueDate} (Kurang dari 3 hari)!</span>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setActiveTab('pipeline')}>
                  Lihat Pipeline
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Content Idea Generator Card */}
      <div className="card" style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Keyframes style tag helper */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin-animation {
            animation: spin 1s linear infinite;
          }
        `}</style>

        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-color)' }} /> Ide Konten Kuliner Harian AI
          </h3>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => loadDailyIdea(true)}
            disabled={loadingDailyIdea}
          >
            <RefreshCw size={12} className={loadingDailyIdea ? 'spin-animation' : ''} />
            {loadingDailyIdea ? 'Menjana...' : 'Ide Baru'}
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {loadingDailyIdea ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid var(--border-color)',
                borderTopColor: 'var(--accent-color)',
                borderRadius: '50%',
                margin: '0 auto 12px',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ fontSize: '13px' }}>Asisten sedang merancang ide konten kuliner viral hari ini...</p>
            </div>
          ) : errorDailyIdea ? (
            <div style={{ padding: '12px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ {errorDailyIdea}</span>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', borderColor: 'rgba(244, 63, 94, 0.2)' }} onClick={() => loadDailyIdea(true)}>Coba Lagi</button>
            </div>
          ) : dailyIdea ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <span className="badge badge-success" style={{ textTransform: 'none' }}>{dailyIdea.platform}</span>
                <span className="badge badge-neutral" style={{ textTransform: 'none' }}>{dailyIdea.deliverables}</span>
              </div>
              
              <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                {dailyIdea.title}
              </h4>
              
              <div style={{ marginBottom: '16px' }}>
                {formatText(dailyIdea.concept)}
              </div>

              {/* Hook display */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'var(--bg-tertiary)', 
                border: '1px solid var(--border-color)',
                borderLeft: '4px solid var(--accent-color)', 
                borderRadius: 'var(--border-radius-sm)',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: '700', marginBottom: '6px', letterSpacing: '0.05em' }}>Hook Pembuka Video (3 Detik Pertama)</div>
                <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.5' }}>
                  "{dailyIdea.hook}"
                </div>
              </div>

              {dailyIdea.notes && (
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Tips Viral & Produksi:</span>
                  <div style={{ paddingLeft: '4px' }}>
                    {formatText(dailyIdea.notes)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className={`btn ${ideaAdded ? 'btn-secondary' : 'btn-primary'}`} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
                  onClick={handleAddToPipeline}
                  disabled={ideaAdded}
                >
                  {ideaAdded ? (
                    <>
                      <Check size={14} style={{ color: 'var(--success-color)' }} /> Sudah di Alur Kerja
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Tambah ke Alur Kerja
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '13px' }}>Tidak ada ide harian saat ini.</p>
              <button className="btn btn-primary" style={{ marginTop: '8px', fontSize: '12px' }} onClick={() => loadDailyIdea(true)}>Buat Ide</button>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Upcoming Tasks in Pipeline */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Konten Berjalan</h3>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setActiveTab('pipeline')}
            >
              Semua Konten <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pipelineTasks.filter(t => t.status !== 'published').slice(0, 4).map(task => (
              <div 
                key={task.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600' }}>{task.brand}</div>
                  <div style={{ fontWeight: '500', fontSize: '13px', marginTop: '2px' }}>{task.title}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`badge ${
                    task.status === 'review' ? 'badge-warning' : 
                    task.status === 'production' ? 'badge-success' : 'badge-neutral'
                  }`}>
                    {task.status}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Due: {task.dueDate}</span>
                </div>
              </div>
            ))}
            {pipelineTasks.filter(t => t.status !== 'published').length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <CheckCircle2 size={24} style={{ color: 'var(--success-color)', margin: '0 auto 8px', display: 'block' }} />
                Semua proyek konten selesai!
              </div>
            )}
          </div>
        </div>

        {/* Calendar Preview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Jadwal Terdekat</h3>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setActiveTab('calendar')}
            >
              Lihat Kalender <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {calendarEvents.slice(0, 4).map(event => (
              <div 
                key={event.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ 
                  width: '4px', 
                  height: '32px', 
                  borderRadius: '2px', 
                  backgroundColor: event.type === 'deadline' ? 'var(--danger-color)' : 
                                   event.type === 'brand' ? 'var(--accent-color)' : 'var(--success-color)'
                }} />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '13px' }}>{event.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {event.brand ? `${event.brand} | ` : ''}{event.start}
                  </div>
                </div>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Tidak ada agenda terdekat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
