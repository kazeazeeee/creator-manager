import React, { useState, useEffect, useRef } from 'react';
import { Copy, Sparkles, CheckCircle, FileEdit, Trash2, RefreshCw, Plus, FileText, Send, Clock, AlignLeft, ChevronRight, Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';
import { apiAnalyzeScript } from '../utils/api';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const isTyping = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isTyping.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isTyping.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => { isTyping.current = false; }, 100);
    }
  };

  const executeCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current.focus();
    handleInput();
  };

  const btnStyle = {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
        <button onClick={() => executeCommand('bold')} style={btnStyle} title="Bold" className="editor-btn"><Bold size={16} /></button>
        <button onClick={() => executeCommand('italic')} style={btnStyle} title="Italic" className="editor-btn"><Italic size={16} /></button>
        <button onClick={() => executeCommand('underline')} style={btnStyle} title="Underline" className="editor-btn"><Underline size={16} /></button>
        <button onClick={() => executeCommand('strikeThrough')} style={btnStyle} title="Strikethrough" className="editor-btn"><Strikethrough size={16} /></button>
        <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}></div>
        <button onClick={() => executeCommand('insertOrderedList')} style={btnStyle} title="Numbered List" className="editor-btn"><ListOrdered size={16} /></button>
        <button onClick={() => executeCommand('insertUnorderedList')} style={btnStyle} title="Bullet List" className="editor-btn"><List size={16} /></button>
        <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}></div>
        <button onClick={() => executeCommand('formatBlock', 'H1')} style={btnStyle} title="Heading 1" className="editor-btn"><strong style={{fontSize:'14px'}}>H1</strong></button>
        <button onClick={() => executeCommand('formatBlock', 'H2')} style={btnStyle} title="Heading 2" className="editor-btn"><strong style={{fontSize:'14px'}}>H2</strong></button>
        <button onClick={() => executeCommand('removeFormat')} style={btnStyle} title="Clear Formatting" className="editor-btn">Clear</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        placeholder={placeholder}
        className="custom-rich-text-editor"
        style={{
          flexGrow: 1, padding: '24px', outline: 'none', overflowY: 'auto', 
          fontSize: '16px', lineHeight: '1.8', color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)', minHeight: '300px'
        }}
      />
    </div>
  );
};

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
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content || "";
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };
  const wordCount = getWordCount();
  const getCharCount = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content || "";
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length;
  };
  const readingTimeSecs = Math.ceil((wordCount / 130) * 60); // Asumsi 130 kata per menit
  
  const formatDuration = (secs) => {
    if (secs < 60) return `${secs} dtk`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} mnt ${s} dtk`;
  };

  // --- TOOLS ACTIONS ---
  const handleCopy = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content || "";
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(plainText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for HTTP / non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = plainText;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error(error);
        alert("Gagal menyalin otomatis. Silakan salin manual.");
      } finally {
        textArea.remove();
      }
    }
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
    
    if (typeof addPipelineTask === 'function') {
      addPipelineTask({
        id: `task-${Date.now()}`,
        title: title || 'Draft Skrip',
        brand: 'Personal Content',
        platform: 'TikTok/Reels',
        status: 'idea',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
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
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', paddingLeft: '8px', alignItems: 'start' }}>
            <span style={{ color: 'var(--accent-color)', fontSize: '14px', marginTop: '2px' }}>•</span>
            <span style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{cleanedLine}</span>
          </div>
        );
      }
      
      const parts = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={idx} style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          {parts}
        </p>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="content-header" style={{ paddingBottom: '16px' }}>
        <div className="content-title">
          <h1>Note & Draft</h1>
          <p>Kelola ide skrip Anda dengan antarmuka yang bersih dan bebas gangguan.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 140px)', alignItems: 'stretch' }}>
        
        {/* --- SIDEBAR LIST CATATAN --- */}
        <div className="card" style={{ width: '280px', flexShrink: 0, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>Daftar Catatan</h3>
            <button onClick={createNewNote} className="btn btn-primary" style={{ padding: '6px', borderRadius: '6px' }} title="Catatan Baru">
              <Plus size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flexGrow: 1, padding: '12px' }}>
            {notes.map(note => (
              <div 
                key={note.id}
                onClick={() => switchNote(note.id)}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  backgroundColor: activeNoteId === note.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: activeNoteId === note.id ? '1px solid var(--accent-color)' : '1px solid transparent',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: activeNoteId === note.id ? 'var(--accent-color)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '24px' }}>
                    {note.title || 'Tanpa Judul'}
                  </h4>
                  {activeNoteId === note.id && (
                    <button 
                      onClick={(e) => deleteNote(note.id, e)}
                      style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.content ? note.content.substring(0, 40) : 'Kosong...'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- MAIN EDITOR AREA --- */}
        <div className="card" style={{ flexGrow: 1, padding: 0, display: 'flex', flexDirection: 'row', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: '400px' }}>
            {/* Editor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <input 
                type="text" 
                value={title}
                onChange={handleTitleChange}
                placeholder="Judul Catatan..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '50%'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={handleSaveToPipeline} style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {savedToPipeline ? <CheckCircle size={14} style={{ color: 'var(--success-color)' }} /> : <Send size={14} />} 
                  {savedToPipeline ? 'Tersimpan' : 'Ke Pipeline'}
                </button>
                <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copied ? <CheckCircle size={14} style={{ color: 'var(--success-color)' }} /> : <Copy size={14} />} 
                  {copied ? 'Tersalin' : 'Salin'}
                </button>
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || !content.trim()} style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} className={analyzing ? 'spin-animation' : ''} /> 
                  {analyzing ? 'Menganalisis...' : 'Analisis AI'}
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div style={{ flexGrow: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div className="editor-container" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <RichTextEditor 
                  value={content}
                  onChange={(val) => handleContentChange({ target: { value: val }})}
                  placeholder="Mulai ketik draf skrip, kerangka ide, atau cerita Anda di sini..."
                />
              </div>
              
              {/* Error Overlay */}
              {error && (
                <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', padding: '12px 16px', backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <span>{error}</span>
                  <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}>✕</button>
                </div>
              )}
            </div>
            
            {/* Editor Status Bar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px 24px', 
              borderTop: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-tertiary)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlignLeft size={14} /> <strong style={{ color: 'var(--text-secondary)' }}>{wordCount}</strong> Kata
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> <strong style={{ color: 'var(--text-secondary)' }}>{getCharCount()}</strong> Karakter
                </span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> Estimasi Durasi: <strong style={{ color: 'var(--text-secondary)' }}>{formatDuration(readingTimeSecs)}</strong>
              </span>
            </div>
          </div>

          {/* --- ANALYSIS RESULT AREA (Slide-in Panel) --- */}
          {(analysisResult || analyzing) && (
            <div style={{ 
              width: '450px', 
              flexShrink: 0,
              borderLeft: '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-tertiary)', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'relative',
              animation: 'slideIn 0.3s ease'
            }}>
              {analyzing && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, opacity: 0.95 }}>
                  <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px', fontWeight: '600' }}>Membedah Skrip Anda...</h3>
                  <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '13px', textAlign: 'center', padding: '0 20px' }}>AI sedang mencari celah untuk membuat skrip ini lebih viral dan menarik.</p>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--accent-color)' }}>
                  <Sparkles size={16} /> Analisis AI
                </h3>
                <button className="btn btn-secondary" onClick={() => setAnalysisResult(null)} style={{ padding: '6px 10px', fontSize: '12px' }} title="Tutup Analisis">
                  Tutup
                </button>
              </div>
              
              <div style={{ 
                padding: '24px 20px',
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
