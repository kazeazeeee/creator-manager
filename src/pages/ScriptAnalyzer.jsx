import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check, RefreshCw, AlertTriangle, FileText, CheckCircle, TrendingUp, HelpCircle, Play, Pause, Square, Volume2 } from 'lucide-react';
import { apiAnalyzeScript } from '../utils/api';

const MOCK_ANALYZE_SCRIPT_RESPONSE = {
  originalScript: "Kalo lo cape pake skinker mahal tapi ga ad hasil, coba dengerin ini. Mungkin lo slah cara pake. Pertama cuci muka pake sabun trus langsung pake cream. Pdhl harus nya pake toner dlu biar meresap. Beli toner nya skrg di shopee link di bio ya guys.",
  improvedScript: `[Visual] Kamera closeup menyorot wajah lelah, lalu bertransisi menunjukkan botol toner yang dipegang.
[Audio/Voiceover] Capek banget kan udah beli skincare mahal-mahal tapi nggak ada hasilnya sama sekali? Coba dengerin ini dulu, mungkin cara pakai kamu yang salah!

[Visual] Tunjukkan urutan pemakaian skincare: cuci muka, lalu aplikasikan toner dengan gerakan menepuk lembut di wajah.
[Audio/Voiceover] Kebanyakan orang habis cuci muka langsung pakai cream. Padahal, harusnya pakai toner dulu untuk menyeimbangkan pH kulit dan membantu produk selanjutnya meresap sempurna!

[Visual] Kreator menunjukkan tekstur kulit yang glowing dan sehat sambil menunjuk ke arah bio profil.
[Audio/Voiceover] Biar skincare kamu nggak sia-sia, yuk mulai pakai toner yang tepat! Dapatkan toner rekomendasi aku sekarang dengan klik link di bio, ya!`,
  typosFixed: [
    { original: "Kalo", corrected: "Kalau", reason: "Bahasa baku dan lebih enak diucapkan saat voiceover." },
    { original: "cape", corrected: "capek", reason: "Penulisan kata tidak baku." },
    { original: "skinker", corrected: "skincare", reason: "Kesalahan penulisan istilah asing (skincare)." },
    { original: "ga ad", corrected: "tidak ada / nggak ada", reason: "Singkatan yang tidak formal." },
    { original: "slah", corrected: "salah", reason: "Kesalahan ketik (typo)." },
    { original: "trus", corrected: "terus / kemudian", reason: "Penulisan tidak baku." },
    { original: "Pdhl", corrected: "Padahal", reason: "Singkatan tidak baku." },
    { original: "harus nya", corrected: "harusnya", reason: "Spasi tidak perlu." },
    { original: "dlu", corrected: "dulu", reason: "Singkatan tidak baku." },
    { original: "skrg", corrected: "sekarang", reason: "Singkatan tidak baku." }
  ],
  viralImprovements: [
    "Hook pembuka diubah dari pasif menjadi pertanyaan menantang untuk menahan retensi penonton di 3 detik pertama.",
    "Visual di setiap bagian naskah ditambahkan dengan instruksi aksi yang jelas agar video lebih dinamis dan interaktif.",
    "Kalimat penutup (Call-To-Action) diubah agar memberikan alasan konkret sehingga penonton terdorong mengklik link bio."
  ],
  performanceScore: {
    virality: 88,
    clarity: 92,
    pacing: 85
  },
  viralHookSuggestion: "Jangan-jangan kulit lo kusam bukan karena skincare-nya jelek, tapi karena urutan pakainya yang ngaco! Sini gue kasih tahu cara benarnya..."
};

const ScriptAnalyzer = ({ apiKey, addPipelineTask, creatorProfile }) => {
  const [scriptText, setScriptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [saved, setSaved] = useState(false);

  // States & Refs for Text-to-Speech (TTS)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceoverOnly, setVoiceoverOnly] = useState(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);
        
        // Prioritas Bahasa Indonesia
        const idVoice = allVoices.find(v => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesian'));
        const defaultChoice = idVoice || allVoices.find(v => v.lang.startsWith('en')) || allVoices[0];
        setSelectedVoice(prev => prev || defaultChoice);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const filterVoiceoverOnly = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    let voiceoverText = '';
    let inVoiceoverBlock = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[Audio') || trimmed.toLowerCase().startsWith('[audio')) {
        inVoiceoverBlock = true;
        const content = trimmed.replace(/^\[Audio\/Voiceover\]|^\[Audio\]/i, '').trim();
        if (content) voiceoverText += content + ' ';
      } else if (trimmed.startsWith('[')) {
        inVoiceoverBlock = false;
      } else {
        if (inVoiceoverBlock && trimmed) {
          voiceoverText += trimmed + ' ';
        }
      }
    });

    if (!voiceoverText.trim()) {
      return text
        .replace(/\[Visual[^\]]*\][^\n]*/gi, '')
        .replace(/\[[^\]]+\]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    }
    return voiceoverText.trim();
  };

  const handlePlayTTS = () => {
    if (!result || !result.improvedScript) return;
    
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Browser Anda tidak mendukung fitur Text-to-Speech.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = voiceoverOnly ? filterVoiceoverOnly(result.improvedScript) : result.improvedScript;
    
    if (!textToRead.trim()) {
      alert('Tidak ada teks voiceover yang bisa dibacakan.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = speed;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStopTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };


  const handleAnalyze = async (useDemo = false) => {
    setError('');
    setSaved(false);
    setLoading(true);

    const targetScript = useDemo ? MOCK_ANALYZE_SCRIPT_RESPONSE.originalScript : scriptText;

    if (useDemo) {
      setScriptText(targetScript);
    }

    if (!targetScript || !targetScript.trim()) {
      setError('Harap masukkan naskah skrip yang ingin dianalisis.');
      setLoading(false);
      return;
    }

    try {
      if (useDemo || !apiKey) {
        // Fallback simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult(MOCK_ANALYZE_SCRIPT_RESPONSE);
        if (!apiKey && !useDemo) {
          setError('Catatan: Menampilkan hasil simulasi karena API Key belum diatur di Setelan.');
        }
      } else {
        const analysisData = await apiAnalyzeScript(targetScript);
        setResult(analysisData);
      }
    } catch (err) {
      console.error(err);
      setError(`Gagal menganalisis skrip: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.improvedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyHook = () => {
    if (!result || !result.viralHookSuggestion) return;
    navigator.clipboard.writeText(result.viralHookSuggestion);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleAddToPipeline = () => {
    if (!result) return;
    
    addPipelineTask({
      id: `task-${Date.now()}`,
      title: `Analisis Skrip: ${result.viralHookSuggestion ? result.viralHookSuggestion.substring(0, 30) + '...' : 'Optimized Script'}`,
      brand: 'Skrip Mandiri',
      platform: 'TikTok',
      status: 'idea',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // + 5 Days
      deliverables: '1x Video pendek (Optimized)',
      notes: `DRAF NASKAH OPTIMAL:\n\n${result.improvedScript}\n\nREKOMENDASI AI:\n- ${result.viralImprovements.join('\n- ')}`
    });

    setSaved(true);
    alert('Hasil analisis skrip berhasil disimpan ke Alur Kerja Konten (status: Ideasi)!');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Input Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Masukkan Draf Skrip Anda
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
              <AlertTriangle size={16} />
              <span>API Key belum diatur di Setelan. Anda tetap bisa mencoba menggunakan tombol "Gunakan Demo" di bawah.</span>
            </div>
          )}

          <textarea 
            className="form-control" 
            style={{ minHeight: '180px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'monospace' }}
            placeholder="Ketik atau tempel draf skrip/naskah kasar Anda di sini..."
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
          />

          {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAnalyze(false)} 
              disabled={loading || !scriptText.trim()}
              style={{ flexGrow: 1 }}
            >
              {loading ? <><RefreshCw className="animate-spin" size={14} /> Menganalisis Skrip...</> : 'Mulai Analisis AI'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleAnalyze(true)}
              disabled={loading}
            >
              Gunakan Demo Skrip
            </button>
          </div>
        </div>

        {/* Results Card */}
        {(result || loading) && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', minHeight: loading ? '300px' : 'auto' }}>
            {loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: 'var(--border-radius-xl)', opacity: 0.95 }}>
                <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>Menganalisis Skrip...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>Mohon tunggu sebentar, AI sedang memproses.</p>
              </div>
            )}
            
            {/* Header section inside card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Hasil Analisis & Perbaikan Skrip</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Draf naskah Anda telah diperbaiki typo-nya dan dioptimalkan agar lebih menarik.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleCopyScript}
                >
                  {copiedScript ? <><Check size={12} style={{ color: 'var(--success-color)' }} /> Tersalin</> : 'Salin Skrip Baru'}
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleAddToPipeline}
                  disabled={saved}
                >
                  {saved ? 'Tersimpan ke Pipeline' : 'Sinkronkan ke Pipeline'}
                </button>
              </div>
            </div>

            {/* Performance Score Dashboard */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              padding: '16px',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>🔥 POTENSI VIRALITAS</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${result.performanceScore?.virality || 50}%`, height: '100%', backgroundColor: getScoreColor(result.performanceScore?.virality || 50) }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{result.performanceScore?.virality || 50}%</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>📢 KEJELASAN PESAN</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${result.performanceScore?.clarity || 50}%`, height: '100%', backgroundColor: getScoreColor(result.performanceScore?.clarity || 50) }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{result.performanceScore?.clarity || 50}%</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>⏱️ TEMPO / PACING</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flexGrow: 1, height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${result.performanceScore?.pacing || 50}%`, height: '100%', backgroundColor: getScoreColor(result.performanceScore?.pacing || 50) }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>{result.performanceScore?.pacing || 50}%</span>
                </div>
              </div>
            </div>

            {/* Standout Viral Hook Suggestion */}
            {result.viralHookSuggestion && (
              <div style={{ 
                padding: '16px',
                borderRadius: 'var(--border-radius-md)',
                backgroundColor: 'rgba(var(--accent-rgb, 224,108,117), 0.05)',
                border: '1px dashed var(--accent-color)',
                position: 'relative'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <TrendingUp size={14} /> IDE HOOK VIRAL ALTERNATIF (3 DETIK PERTAMA)
                </span>
                <p style={{ fontSize: '14px', fontWeight: '500', fontStyle: 'italic', paddingRight: '120px', margin: 0, color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  "{result.viralHookSuggestion}"
                </p>
                <button 
                  className="btn btn-secondary"
                  style={{ 
                    position: 'absolute', 
                    right: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    padding: '4px 10px', 
                    fontSize: '11px',
                    borderColor: 'var(--accent-color)',
                    color: 'var(--accent-color)'
                  }}
                  onClick={handleCopyHook}
                >
                  {copiedHook ? 'Tersalin' : 'Salin Hook'}
                </button>
              </div>
            )}

            {/* Two-Column split for Typo fixes vs Viral Recommendations */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Typo Corrections Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📝 Perbaikan Ejaan & Typo
                </h4>
                {result.typosFixed && result.typosFixed.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border-color)' }}>
                          <th style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontWeight: '500' }}>Teks Asli</th>
                          <th style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontWeight: '500' }}>Koreksi</th>
                          <th style={{ padding: '6px 8px', color: 'var(--text-secondary)', fontWeight: '500' }}>Alasan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.typosFixed.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '8px', color: 'var(--danger-color)', textDecoration: 'line-through' }}>{item.original}</td>
                            <td style={{ padding: '8px', color: 'var(--success-color)', fontWeight: '600' }}>{item.corrected}</td>
                            <td style={{ padding: '8px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-color)', padding: '12px 0' }}>
                    <CheckCircle size={18} />
                    <span style={{ fontSize: '12px' }}>Hebat! Tidak ditemukan kesalahan ketik (typo) di skrip Anda.</span>
                  </div>
                )}
              </div>

              {/* Viral Enhancements Recommendations */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', padding: '16px', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚀 Catatan Peningkatan Viralitas
                </h4>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: '1.5' }}>
                  {result.viralImprovements && result.viralImprovements.map((imp, idx) => (
                    <li key={idx}>
                      <span style={{ color: 'var(--text-primary)' }}>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Audio Voice Narration (Text-to-Speech) Panel */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--border-radius-md)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>Pratinjau Suara AI (Text-to-Speech)</span>
                  {isPlaying && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '8px' }}>
                      <div className="bar-visualizer" style={{ width: '3px', height: '12px', backgroundColor: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce-bar 0.8s ease-in-out infinite alternate' }} />
                      <div className="bar-visualizer" style={{ width: '3px', height: '16px', backgroundColor: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce-bar 0.8s ease-in-out infinite alternate 0.2s' }} />
                      <div className="bar-visualizer" style={{ width: '3px', height: '10px', backgroundColor: 'var(--accent-color)', borderRadius: '2px', animation: 'bounce-bar 0.8s ease-in-out infinite alternate 0.4s' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={voiceoverOnly} 
                      onChange={(e) => setVoiceoverOnly(e.target.checked)}
                      style={{ 
                        accentColor: 'var(--accent-color)', 
                        width: '14px', 
                        height: '14px',
                        cursor: 'pointer' 
                      }} 
                    />
                    Hanya Suara (Lewati Arahan Visual)
                  </label>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                alignItems: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '12px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                {/* Control Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isPlaying ? (
                    <button 
                      className="btn btn-primary"
                      onClick={handlePlayTTS}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', flexGrow: 1 }}
                    >
                      <Play size={14} fill="currentColor" /> Putar Suara
                    </button>
                  ) : (
                    <button 
                      className="btn btn-secondary"
                      onClick={handlePauseTTS}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px', flexGrow: 1, borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                    >
                      <Pause size={14} fill="currentColor" /> Jeda
                    </button>
                  )}
                  
                  {(isPlaying || isPaused) && (
                    <button 
                      className="btn btn-secondary"
                      onClick={handleStopTTS}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                    >
                      <Square size={14} fill="currentColor" /> Stop
                    </button>
                  )}
                </div>

                {/* Voice Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500' }}>PILIHAN SUARA</span>
                  <select
                    className="form-control"
                    style={{ padding: '6px 10px', fontSize: '12px', height: '32px', cursor: 'pointer' }}
                    value={selectedVoice ? selectedVoice.name : ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      if (voice) {
                        setSelectedVoice(voice);
                        if (isPlaying) {
                          setTimeout(() => {
                            window.speechSynthesis.cancel();
                            handlePlayTTS();
                          }, 100);
                        }
                      }
                    }}
                  >
                    {voices.length === 0 ? (
                      <option>Mendeteksi suara...</option>
                    ) : (
                      voices.map((v, idx) => (
                        <option key={idx} value={v.name}>
                          {v.lang.startsWith('id') ? '🇮🇩 ' : '🌐 '} {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speed Setting */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <span>KECEPATAN</span>
                    <span>{speed}x</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      style={{ flexGrow: 1, accentColor: 'var(--accent-color)', height: '4px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Improved Script output */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                🎬 Draf Naskah Final Terformat Rapi
              </h4>
              <textarea 
                className="form-control"
                style={{ 
                  width: '100%',
                  minHeight: '260px', 
                  fontSize: '13px', 
                  fontFamily: 'monospace', 
                  lineHeight: '1.6',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)'
                }}
                value={result.improvedScript}
                readOnly
              />
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptAnalyzer;
