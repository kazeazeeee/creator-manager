import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, CheckCircle, FileEdit, Trash2, RefreshCw } from 'lucide-react';
import { apiAnalyzeScript } from '../utils/api';

const Note = () => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Load saved note on mount
  useEffect(() => {
    const saved = localStorage.getItem('creator_note_draft');
    if (saved) {
      setContent(saved);
    }
  }, []);

  // Save note on change
  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem('creator_note_draft', val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Yakin ingin menghapus seluruh draft ini?')) {
      setContent('');
      localStorage.removeItem('creator_note_draft');
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await apiAnalyzeScript(content);
      if (res && res.improvedScript) {
        const formattedResult = `
**NASKAH YANG DIPERBAIKI (IMPROVED)**
${res.improvedScript}

**ALTERNATIF HOOK VIRAL**
${res.viralHookSuggestion || 'Tidak ada saran.'}

**PERBAIKAN TYPO & TATA BAHASA**
${res.typosFixed && res.typosFixed.length > 0 ? res.typosFixed.map(t => `- **${t.original}** -> **${t.corrected}** (${t.reason})`).join('\n') : '- Tidak ada typo yang ditemukan.'}

**SARAN UNTUK VIRALITAS & PACING**
${res.viralImprovements && res.viralImprovements.length > 0 ? res.viralImprovements.map(v => `- ${v}`).join('\n') : '- Tidak ada saran spesifik.'}
        `.trim();
        setAnalysisResult(formattedResult);
      } else {
        throw new Error('Gagal mendapatkan analisis atau format response tidak sesuai.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat menganalisis skrip.');
    } finally {
      setAnalyzing(false);
    }
  };

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
      
      // Simple bold parsing
      const parts = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={idx} style={{ marginBottom: '10px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {parts}
        </p>
      );
    });
  };

  return (
    <div>
      <div className="content-header">
        <div className="content-title">
          <h1>Note & Draft</h1>
          <p>Tulis skrip konten, ide, atau draft teks Anda di sini layaknya Microsoft Word.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: analysisResult ? '1fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>
        
        {/* Editor Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', margin: 0 }}>
              <FileEdit size={16} style={{ color: 'var(--accent-color)' }} /> Editor Skrip
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={handleClear} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={13} /> Bersihkan
              </button>
              <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {copied ? <CheckCircle size={13} style={{ color: 'var(--success-color)' }} /> : <Copy size={13} />} 
                {copied ? 'Tersalin!' : 'Salin Teks'}
              </button>
              <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || !content.trim()} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} className={analyzing ? 'spin-animation' : ''} /> 
                {analyzing ? 'Menganalisis...' : 'Analisis Skrip'}
              </button>
            </div>
          </div>

          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Mulai ketik draft atau skrip video Anda di sini..."
            style={{
              flexGrow: 1,
              width: '100%',
              resize: 'none',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-md)',
              padding: '16px',
              fontSize: '14.5px',
              lineHeight: '1.7',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          {error && (
            <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', borderRadius: '6px', fontSize: '12px' }}>
              {error}
            </div>
          )}
        </div>

        {/* Analysis Result Area */}
        {(analysisResult || analyzing) && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', padding: '20px', overflowY: 'auto' }}>
            {analyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>AI Sedang Menganalisis...</h3>
                <p>Harap tunggu sebentar, AI sedang memproses skrip Anda.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', margin: 0, color: 'var(--accent-color)' }}>
                    <Sparkles size={16} /> Hasil Analisis AI
                  </h3>
                  <button className="btn btn-secondary" onClick={() => setAnalysisResult(null)} style={{ padding: '4px 8px', fontSize: '11px' }}>
                    Tutup
                  </button>
                </div>
                
                <div style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '20px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--border-color)',
                  flexGrow: 1,
                  overflowY: 'auto'
                }}>
                  {formatText(analysisResult)}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Note;
