import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, CheckCircle, FileEdit, Trash2, RefreshCw, Plus, FileText, Send, Clock, AlignLeft } from 'lucide-react';
import { apiAnalyzeScript } from '../utils/api';

const Note = ({ addPipelineTask }) => {
  // --- STATE UNTUK MULTI-NOTE ---
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  
  // --- STATE UNTUK EDITOR ---
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Catatan Baru');
  
  // --- STATE UNTUK AI & UI ---
  const [copied, setCopied] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedToPipeline, setSavedToPipeline] = useState(false);

  // 1. Load data saat pertama kali mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('creator_notes_list');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        if (parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
          setContent(parsed[0].content);
          setTitle(parsed[0].title);
        } else {
          createNewNote();
        }
      } catch (e) {
        createNewNote();
      }
    } else {
      // Migrasi dari single note lama jika ada
      const oldSaved = localStorage.getItem('creator_note_draft');
      if (oldSaved) {
        const migratedNote = {
          id: Date.now().toString(),
          title: 'Draft Lama',
          content: oldSaved,
          updatedAt: Date.now()
        };
        setNotes([migratedNote]);
        setActiveNoteId(migratedNote.id);
        setContent(migratedNote.content);
        setTitle(migratedNote.title);
        localStorage.removeItem('creator_note_draft');
        localStorage.setItem('creator_notes_list', JSON.stringify([migratedNote]));
      } else {
        createNewNote();
      }
    }
  }, []);

  // 2. Fungsi untuk membuat catatan baru
  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Catatan Baru',
      content: '',
      updatedAt: Date.now()
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setContent(newNote.content);
    setTitle(newNote.title);
    setAnalysisResult(null);
    saveToLocal(updatedNotes);
  };

  // 3. Fungsi untuk pindah catatan
  const switchNote = (id) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setActiveNoteId(id);
      setContent(note.content);
      setTitle(note.title);
      setAnalysisResult(null);
    }
  };

  // 4. Fungsi untuk menghapus catatan
  const deleteNote = (id, e) => {
    e.stopPropagation();
    if (confirm('Yakin ingin menghapus catatan ini?')) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      saveToLocal(updatedNotes);
      
      if (updatedNotes.length > 0) {
        if (activeNoteId === id) {
          switchNote(updatedNotes[0].id);
        }
      } else {
        createNewNote(); // Selalu sediakan 1 catatan kosong
      }
    }
  };

  // 5. Fungsi simpan ke localStorage
  const saveToLocal = (notesArray) => {
    localStorage.setItem('creator_notes_list', JSON.stringify(notesArray));
  };

  // 6. Handle perubahan isi teks / judul
  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    updateCurrentNoteInList(title, val);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    updateCurrentNoteInList(val, content);
  };

  const updateCurrentNoteInList = (newTitle, newContent) => {
    const updatedNotes = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, title: newTitle, content: newContent, updatedAt: Date.now() };
      }
      return n;
    });
    // Sort so most recently updated is at top
    updatedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
    setNotes(updatedNotes);
    saveToLocal(updatedNotes);
  };

  // --- STATS CALCULATOR ---
  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };
  const wordCount = getWordCount();
  const readingTimeSecs = Math.ceil((wordCount / 130) * 60); // Asumsi 130 kata per menit untuk video bicara santai
  
  const formatDuration = (secs) => {
    if (secs < 60) return `${secs} dtk`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} mnt ${s} dtk`;
  };

  // --- TOOLS ACTIONS ---
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (confirm('Yakin ingin membersihkan isi teks ini?')) {
      setContent('');
      updateCurrentNoteInList(title, '');
      setAnalysisResult(null);
    }
  };

  const handleSaveToPipeline = () => {
    if (!content.trim()) return;
    
    // Add to pipeline via props if available
    if (typeof addPipelineTask === 'function') {
      addPipelineTask({
        id: `task-${Date.now()}`,
        title: title || 'Draft Skrip',
        brand: 'Personal Content',
        platform: 'TikTok/Reels',
        status: 'idea',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // + 3 Days
        deliverables: '1x Video Pendek',
        notes: `HASIL SKRIP DARI NOTE:\n\n${content}`
      });
      setSavedToPipeline(true);
      setTimeout(() => setSavedToPipeline(false), 3000);
    } else {
      alert("Fungsi Pipeline belum tersedia di komponen ini.");
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
          <p>Kelola semua ide skrip dan catatan Anda dalam satu tempat.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* --- SIDEBAR LIST CATATAN --- */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-primary)' }}>Daftar Catatan</h3>
            <button onClick={createNewNote} className="btn btn-primary" style={{ padding: '4px 8px', borderRadius: '4px' }} title="Catatan Baru">
              <Plus size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flexGrow: 1, paddingRight: '4px' }}>
            {notes.map(note => (
              <div 
                key={note.id}
                onClick={() => switchNote(note.id)}
                style={{ 
                  padding: '12px', 
                  borderRadius: 'var(--border-radius-md)', 
                  cursor: 'pointer',
                  backgroundColor: activeNoteId === note.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: activeNoteId === note.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  group: 'note-item'
                }}
              >
                <h4 style={{ fontSize: '13px', margin: '0 0 4px 0', color: activeNoteId === note.id ? 'var(--accent-color)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '20px' }}>
                  {note.title || 'Tanpa Judul'}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.content ? note.content.substring(0, 30) : 'Kosong...'}
                </p>
                
                {/* Delete button appears on hover/always if active */}
                <button 
                  onClick={(e) => deleteNote(note.id, e)}
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--danger-color)', 
                    cursor: 'pointer',
                    opacity: activeNoteId === note.id ? 1 : 0.4
                  }}
                  title="Hapus"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- MAIN EDITOR AREA --- */}
        <div style={{ display: 'grid', gridTemplateColumns: analysisResult ? '1fr 1fr' : '1fr', gap: '24px' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', padding: '0', overflow: 'hidden' }}>
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <input 
                type="text" 
                value={title}
                onChange={handleTitleChange}
                placeholder="Judul Catatan..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '50%'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={handleSaveToPipeline} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {savedToPipeline ? <CheckCircle size={13} style={{ color: 'var(--success-color)' }} /> : <Send size={13} />} 
                  {savedToPipeline ? 'Tersimpan!' : 'Ke Pipeline'}
                </button>
                <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copied ? <CheckCircle size={13} style={{ color: 'var(--success-color)' }} /> : <Copy size={13} />} 
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || !content.trim()} style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} className={analyzing ? 'spin-animation' : ''} /> 
                  {analyzing ? 'Menganalisis...' : 'Analisis AI'}
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Mulai ketik draft atau skrip video Anda di sini..."
              style={{
                flexGrow: 1,
                width: '100%',
                resize: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                padding: '20px',
                fontSize: '14.5px',
                lineHeight: '1.7',
                fontFamily: 'var(--font-sans)',
                outline: 'none'
              }}
            />
            
            {/* Editor Status Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '10px 20px', 
              borderTop: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-tertiary)',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlignLeft size={12} /> {wordCount} Kata
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileText size={12} /> {content.length} Karakter
                </span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Estimasi Video: {formatDuration(readingTimeSecs)}
              </span>
            </div>

            {/* Error Overlay */}
            {error && (
              <div style={{ position: 'absolute', bottom: '50px', left: '20px', right: '20px', padding: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {error}
                <button onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>

          {/* --- ANALYSIS RESULT AREA --- */}
          {(analysisResult || analyzing) && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', padding: '20px', position: 'relative' }}>
              {analyzing && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: 'var(--border-radius-xl)', opacity: 0.95 }}>
                  <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>AI Sedang Menganalisis...</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>Mohon tunggu sebentar, memproses naskah Anda.</p>
                </div>
              )}
              
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Note;
