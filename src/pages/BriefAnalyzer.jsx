import React, { useState } from 'react';
import { Sparkles, Calendar, CheckSquare, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { apiAnalyzeBrief } from '../utils/api';
import PerformancePredictor from '../components/PerformancePredictor';

const MOCK_BRIEF_INPUT = `Watsons Indonesia - Beauty Festival Campaign 2026.
Kami mencari kreator untuk mempromosikan Watsons Beauty Festival yang berlangsung pada 20-30 Juni 2026.
Deliverables:
- 1x Instagram Reels (durasi minimal 30 detik) tayang tanggal 22 Juni 2026.
- 3x Instagram Stories berisi link belanja di Watsons Online (tayang bareng Reels, H+1, dan H+3).

Do's:
- Tunjukkan keseruan berbelanja produk diskon up to 50% di store Watsons terdekat.
- Wajib tunjukkan struk belanja dan keranjang belanja penuh.
- Mention akun @watsonsindo dan sertakan hashtag wajib #WatsonsBeautyFestival2026 #WatsonsDiskon.

Don'ts:
- Dilarang menyebutkan platform e-commerce lain atau toko ritel farmasi kompetitor (seperti Guardian atau Century).
- Dilarang merekam logo brand lain secara sengaja di latar belakang video.
- Harap ajukan draf konten (video & script) maksimal tanggal 19 Juni 2026 untuk disetujui tim brand sebelum di-posting.`;

const MOCK_BRIEF_ANALYSIS = {
  brand: 'Watsons Indonesia',
  projectName: 'Watsons Beauty Festival 2026',
  deliverables: '1x Instagram Reels, 3x Instagram Stories',
  doList: [
    'Tunjukkan keseruan berbelanja produk diskon hingga 50% di store Watsons terdekat',
    'Tunjukkan struk belanja dan keranjang belanja penuh',
    'Kirim draf konten (video & script) maksimal 19 Juni 2026 untuk review brand'
  ],
  dontList: [
    'Menyebutkan platform e-commerce lain atau kompetitor ritel farmasi (Guardian, Century)',
    'Merekam logo brand lain secara sengaja di latar belakang video'
  ],
  hashtags: ['#WatsonsBeautyFestival2026', '#WatsonsDiskon'],
  mentions: ['@watsonsindo'],
  dueDate: '2026-06-19' // Draft due date
};

const BriefAnalyzer = ({ apiKey, addPipelineTask, addCalendarEvent, creatorProfile }) => {
  const [briefText, setBriefText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async (useDemo = false) => {
    setError('');
    setSaved(false);
    
    const textToAnalyze = useDemo ? MOCK_BRIEF_INPUT : briefText;
    if (useDemo) {
      setBriefText(MOCK_BRIEF_INPUT);
    }

    if (!textToAnalyze.trim()) {
      setError('Harap masukkan teks brief terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      if (useDemo || !apiKey) {
        // Mock response if using demo or no API key provided
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult(MOCK_BRIEF_ANALYSIS);
        if (!apiKey && !useDemo) {
          setError('Catatan: Menampilkan hasil simulasi karena API Key SumoPod belum diatur di Setelan.');
        }
      } else {
        const analysis = await apiAnalyzeBrief(textToAnalyze);
        setResult(analysis);
      }
    } catch (err) {
      console.error(err);
      setError(`Gagal menganalisis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPipeline = () => {
    if (!result) return;

    // Create a new task in pipeline
    addPipelineTask({
      id: `task-${Date.now()}`,
      title: result.projectName,
      brand: result.brand,
      platform: 'Instagram', // Default
      status: 'idea',
      dueDate: result.dueDate || new Date().toISOString().substring(0, 10),
      deliverables: result.deliverables,
      notes: `DO'S:\n${result.doList.join('\n')}\n\nDON'TS:\n${result.dontList.join('\n')}\n\nHASHTAGS: ${result.hashtags.join(', ')}`
    });

    // Also create calendar deadline event
    if (result.dueDate) {
      addCalendarEvent({
        id: `event-${Date.now()}`,
        title: `Tenggat Draft: ${result.projectName}`,
        start: result.dueDate,
        type: 'deadline',
        brand: result.brand
      });
    }

    setSaved(true);
    alert('Berhasil disinkronkan ke Alur Konten & Kalender!');
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `Brand: ${result.brand}\nProject: ${result.projectName}\nDeliverables: ${result.deliverables}\nDeadline: ${result.dueDate}\nDo's:\n- ${result.doList.join('\n- ')}\nDon'ts:\n- ${result.dontList.join('\n- ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Input Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Masukkan Teks Brief
          </h3>
          
          {!apiKey && (
            <div style={{ 
              padding: '12px', 
              borderRadius: 'var(--border-radius-md)', 
              backgroundColor: 'var(--warning-light)', 
              color: 'var(--warning-color)',
              fontSize: '12px',
              marginBottom: '16px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>API Key belum diatur di Setelan. Anda tetap bisa mencoba menggunakan tombol "Gunakan Demo" di bawah.</span>
            </div>
          )}

          <textarea 
            className="form-control" 
            style={{ minHeight: '300px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'monospace' }}
            placeholder="Salin dan tempel brief dari email, PDF, atau chat di sini..."
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
          />

          {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAnalyze(false)} 
              disabled={loading || !briefText.trim()}
              style={{ flexGrow: 1 }}
            >
              {loading ? <><RefreshCw className="animate-spin" size={14} /> Menganalisis...</> : 'Mulai Analisis AI'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleAnalyze(true)}
              disabled={loading}
            >
              Gunakan Demo
            </button>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px' }}>Hasil Analisis Asisten</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={handleCopy} title="Copy Analysis">
                  {copied ? <Check size={14} style={{ color: 'var(--success-color)' }} /> : <Copy size={14} />}
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleSaveToPipeline}
                  disabled={saved}
                >
                  {saved ? 'Tersinkronisasi' : 'Sinkronkan ke Pipeline'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase' }}>Brand / Klien</span>
                <h2 style={{ fontSize: '20px', marginTop: '2px' }}>{result.brand}</h2>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nama Kampanye</span>
                <p style={{ fontWeight: '500', fontSize: '14px' }}>{result.projectName}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deliverables</span>
                  <p style={{ fontWeight: '500', fontSize: '13px', marginTop: '2px' }}>{result.deliverables}</p>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tenggat Draf</span>
                  <p style={{ fontWeight: '500', fontSize: '13px', marginTop: '2px', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {result.dueDate}
                  </p>
                </div>
              </div>

              <div className="analysis-results">
                <div className="analysis-section">
                  <h3>✅ Wajib Dilakukan (Do's)</h3>
                  <ul className="analysis-list">
                    {result.doList.map((item, idx) => (
                      <li key={idx} style={{ fontSize: '13px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section danger" style={{ borderLeftColor: 'var(--danger-color)' }}>
                  <h3 style={{ color: 'var(--danger-color)' }}>❌ Dilarang (Don'ts)</h3>
                  <ul className="analysis-list">
                    {result.dontList.map((item, idx) => (
                      <li key={idx} style={{ fontSize: '13px' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {(result.hashtags.length > 0 || result.mentions.length > 0) && (
                  <div className="analysis-section success" style={{ borderLeftColor: 'var(--success-color)' }}>
                    <h3 style={{ color: 'var(--success-color)' }}>🏷️ Tags & Hashtags Wajib</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {result.mentions.map((item, idx) => (
                        <span key={idx} style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)', fontSize: '11px', fontWeight: '500' }}>
                          {item}
                        </span>
                      ))}
                      {result.hashtags.map((item, idx) => (
                        <span key={idx} style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '11px' }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Performance Predictor Widget */}
                <PerformancePredictor 
                  hook={result.doList && result.doList[0] ? result.doList[0] : ''}
                  script={`Campaign: ${result.projectName}. Deliverables: ${result.deliverables}. Do's: ${result.doList.join(', ')}`}
                  duration="30s"
                  creatorProfile={creatorProfile}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BriefAnalyzer;
