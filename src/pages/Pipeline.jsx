import React, { useState } from 'react';
import { Plus, Trash, ArrowLeft, ArrowRight, Video, Calendar, Tag, AlertTriangle, CheckSquare, Link as LinkIcon, UserCircle, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Pipeline = ({ pipelineTasks = [], setPipelineTasks, addCalendarEvent, onCreateInvoice, profile }) => {
  const teamMembers = profile?.teamMembers 
    ? profile.teamMembers.split(',').map(m => m.trim()).filter(m => m) 
    : ['Manager', 'Talent Utama', 'Kameramen', 'Editor'];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [addNotesTab, setAddNotesTab] = useState('edit');
  const [editNotesTab, setEditNotesTab] = useState('preview');
  
  const [activeDragCol, setActiveDragCol] = useState(null);

  const renderMarkdown = (text) => {
    if (!text) return <em style={{ color: 'var(--text-muted)' }}>Belum ada catatan.</em>;
    
    const lines = text.split('\n');
    
    const parseInline = (str) => {
      const boldRegex = /\*\*([\s\S]*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      const keywordRegex = /\b(brief|kampanye|campaign|sponsor|rate[ -]?card|rates|tarif|budget|anggaran|invoice|deadline|tenggat|revisi|kontrak|eksklusivitas|exclusivity|denda|pembayaran|negosiasi|nego|draf|draft|jadwal|agenda|kolaborasi|collaboration|agreement|brand)(nya|an|kan|i|mu|ku)?\b/gi;
      
      const highlight = (txt, prefix) => {
        if (!keywordRegex.test(txt)) return [txt];
        keywordRegex.lastIndex = 0;
        const subParts = [];
        let subLastIdx = 0;
        let subMatch;
        while ((subMatch = keywordRegex.exec(txt)) !== null) {
          const before = txt.substring(subLastIdx, subMatch.index);
          if (before) subParts.push(before);
          subParts.push(
            <span key={`${prefix}-${subMatch.index}`} className="highlight-keyword">
              {subMatch[0]}
            </span>
          );
          subLastIdx = keywordRegex.lastIndex;
        }
        const after = txt.substring(subLastIdx);
        if (after) subParts.push(after);
        return subParts;
      };

      while ((match = boldRegex.exec(str)) !== null) {
        const textBefore = str.substring(lastIndex, match.index);
        if (textBefore) parts.push(...highlight(textBefore, `tb-${match.index}`));
        parts.push(
          <strong key={match.index} style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
            {highlight(match[1], `str-${match.index}`)}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      const remaining = str.substring(lastIndex);
      if (remaining) parts.push(...highlight(remaining, 'rem'));
      
      return parts;
    };

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} style={{ fontSize: '14px', fontWeight: '600', margin: '12px 0 6px 0', color: 'var(--text-primary)', fontFamily: 'sans-serif' }}>{parseInline(trimmed.substring(4))}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} style={{ fontSize: '15px', fontWeight: '600', margin: '14px 0 8px 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', fontFamily: 'sans-serif' }}>{parseInline(trimmed.substring(3))}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} style={{ fontSize: '16px', fontWeight: '700', margin: '16px 0 10px 0', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '6px', fontFamily: 'sans-serif' }}>{parseInline(trimmed.substring(2))}</h2>;
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0 4px 12px', alignItems: 'flex-start', fontFamily: 'sans-serif' }}>
            <span style={{ color: 'var(--accent-color)' }}>•</span>
            <span style={{ fontSize: '13.5px', lineHeight: '1.6' }}>{parseInline(trimmed.substring(2))}</span>
          </div>
        );
      }
      
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0 4px 12px', alignItems: 'flex-start', fontFamily: 'sans-serif' }}>
            <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>{numMatch[1]}.</span>
            <span style={{ fontSize: '13.5px', lineHeight: '1.6' }}>{parseInline(numMatch[2])}</span>
          </div>
        );
      }
      
      if (trimmed === '') {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      
      return (
        <p key={idx} style={{ fontSize: '13.5px', lineHeight: '1.6', margin: '4px 0', fontFamily: 'sans-serif' }}>
          {parseInline(line)}
        </p>
      );
    });
  };

  const generateAutoChecklist = (deliverablesStr, currentSubtasks = []) => {
    if (!deliverablesStr) return currentSubtasks;
    const parts = deliverablesStr.split(',').map(s => s.trim()).filter(s => s);
    const newTasks = [];
    parts.forEach((part, index) => {
      newTasks.push({ id: `st-${Date.now()}-${index}-shoot`, text: `Take Video: ${part}`, completed: false });
      newTasks.push({ id: `st-${Date.now()}-${index}-edit`, text: `Editing: ${part}`, completed: false });
    });
    return [...currentSubtasks, ...newTasks];
  };

  const [newTask, setNewTask] = useState({
    title: '',
    brand: '',
    platform: 'Instagram',
    dueDate: '',
    deliverables: '',
    notes: '',
    contentType: 'brand',
    assignee: 'Manager',
    briefLink: '',
    draftLink: '',
    subtasks: [],
    isRevising: false
  });

  const columns = [
    { id: 'calendar', label: 'Jadwal & Agenda', color: '#06B6D4' },
    { id: 'idea', label: 'Ideasi', color: '#6b7280' },
    { id: 'script', label: 'Naskah', color: '#8b5cf6' },
    { id: 'production', label: 'Produksi', color: '#f59e0b' },
    { id: 'editing', label: 'Editing', color: '#3b82f6' },
    { id: 'review', label: 'Review Brand', color: '#ec4899' },
    { id: 'published', label: 'Tayang (Published)', color: '#10b981' }
  ];

  const getDeadlineClass = (dueDate) => {
    if (!dueDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffMs = due - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'deadline-overdue';
    if (diffDays === 0) return 'deadline-today';
    if (diffDays <= 3) return 'deadline-warning';
    return '';
  };

  const getDeadlineLabel = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate + 'T00:00:00');
    const diffMs = due - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`;
    if (diffDays === 0) return 'HARI INI!';
    if (diffDays === 1) return 'Besok!';
    if (diffDays <= 3) return `${diffDays} hari lagi`;
    return null;
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    updateTaskStatus(taskId, newStatus);
    setActiveDragCol(null);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updated = pipelineTasks.map(task => {
      if (task.id === taskId) {
        // If task is moved to published, maybe we want to log or notify.
        return { ...task, status: newStatus };
      }
      return task;
    });
    setPipelineTasks(updated);
  };

  const moveLeft = (taskId, currentStatus) => {
    const currentIndex = columns.findIndex(col => col.id === currentStatus);
    if (currentIndex > 0) {
      updateTaskStatus(taskId, columns[currentIndex - 1].id);
    }
  };

  const moveRight = (taskId, currentStatus) => {
    const currentIndex = columns.findIndex(col => col.id === currentStatus);
    if (currentIndex < columns.length - 1) {
      updateTaskStatus(taskId, columns[currentIndex + 1].id);
    }
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas konten ini?')) {
      setPipelineTasks(pipelineTasks.filter(t => t.id !== taskId));
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingTask.title || !editingTask.brand) return;

    const updated = pipelineTasks.map(task => {
      if (task.id === editingTask.id) {
        return editingTask;
      }
      return task;
    });

    setPipelineTasks(updated);
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.brand) return;

    const createdTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      status: 'idea'
    };

    setPipelineTasks([createdTask, ...pipelineTasks]);

    // Also add to calendar if due date is provided
    if (newTask.dueDate) {
      addCalendarEvent({
        id: `event-task-${Date.now()}`,
        title: `Tenggat: ${newTask.title}`,
        start: newTask.dueDate,
        type: 'deadline',
        brand: newTask.brand
      });
    }

    // Reset form
    setNewTask({
      title: '',
      brand: '',
      platform: 'Instagram',
      dueDate: '',
      deliverables: '',
      notes: '',
      contentType: 'brand',
      assignee: 'Manager',
      briefLink: '',
      draftLink: '',
      subtasks: [],
      isRevising: false
    });
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, width: '100%' }}>
      <div className="content-header" style={{ maxWidth: '1846px' }}>
        <div className="content-title">
          <h1>Alur Kerja Konten (Kanban)</h1>
          <p>Kelola tahapan produksi konten Anda dari ide hingga dipublikasikan.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Tambah Konten
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', backgroundColor: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Buat Tugas Konten Baru</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama/Judul Konten *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: Review Skincare Edisi Cushion"
                  value={newTask.title} 
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipe Konten</label>
                  <select className="form-control" value={newTask.contentType || 'brand'} onChange={e => setNewTask({...newTask, contentType: e.target.value})}>
                    <option value="brand">Konten Brand (Sponsor)</option>
                    <option value="regular">Konten Reguler (Organik)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tugaskan Ke (Assignee)</label>
                  <select className="form-control" value={newTask.assignee || (teamMembers[0] || 'Manager')} onChange={e => setNewTask({...newTask, assignee: e.target.value})}>
                    {teamMembers.map((member, i) => (
                      <option key={i} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nama Brand / Sponsor {newTask.contentType === 'regular' ? '(Opsional)' : '*'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: Wardah Beauty"
                  value={newTask.brand} 
                  onChange={e => setNewTask({ ...newTask, brand: e.target.value })}
                  required={newTask.contentType !== 'regular'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Platform</label>
                  <select 
                    className="form-control"
                    value={newTask.platform} 
                    onChange={e => setNewTask({ ...newTask, platform: e.target.value })}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tenggat Waktu (Deadline)</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Deliverables (Detail Pekerjaan)</label>
                  <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setNewTask({...newTask, subtasks: generateAutoChecklist(newTask.deliverables, newTask.subtasks || [])})}>
                    <CheckSquare size={12} /> AI Auto-Checklist
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: 1x Reels Video, 3x Stories"
                  value={newTask.deliverables} 
                  onChange={e => setNewTask({ ...newTask, deliverables: e.target.value })}
                />
                {newTask.subtasks && newTask.subtasks.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '11px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Checklist Otomatis:</div>
                    {newTask.subtasks.map(st => <div key={st.id}>- {st.text}</div>)}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Link Brief Brand</label>
                  <input type="text" className="form-control" placeholder="https://docs.google.com/..." value={newTask.briefLink || ''} onChange={e => setNewTask({...newTask, briefLink: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Link Draf Video</label>
                  <input type="text" className="form-control" placeholder="https://drive.google.com/..." value={newTask.draftLink || ''} onChange={e => setNewTask({...newTask, draftLink: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Catatan / Do's & Don'ts</label>
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setAddNotesTab('preview')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: addNotesTab === 'preview' ? 'var(--accent-light)' : 'transparent',
                        color: addNotesTab === 'preview' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Pratinjau Rapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddNotesTab('edit')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: addNotesTab === 'edit' ? 'var(--accent-light)' : 'transparent',
                        color: addNotesTab === 'edit' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Sunting Teks
                    </button>
                  </div>
                </div>

                {addNotesTab === 'preview' ? (
                  <div style={{
                    minHeight: '280px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '14px 18px',
                    color: 'var(--text-primary)'
                  }}>
                    {renderMarkdown(newTask.notes)}
                  </div>
                ) : (
                  <textarea 
                    className="form-control" 
                    placeholder="Instruksi khusus atau catatan tambahan dari brand..."
                    value={newTask.notes} 
                    onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                    style={{
                      minHeight: '280px',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      fontFamily: 'var(--font-sans)',
                      padding: '12px 14px'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '850px', backgroundColor: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Ubah Tugas Konten</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Nama/Judul Konten *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingTask.title} 
                  onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipe Konten</label>
                  <select className="form-control" value={editingTask.contentType || 'brand'} onChange={e => setEditingTask({...editingTask, contentType: e.target.value})}>
                    <option value="brand">Konten Brand (Sponsor)</option>
                    <option value="regular">Konten Reguler (Organik)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tugaskan Ke (Assignee)</label>
                  <select className="form-control" value={editingTask.assignee || (teamMembers[0] || 'Manager')} onChange={e => setEditingTask({...editingTask, assignee: e.target.value})}>
                    {teamMembers.map((member, i) => (
                      <option key={i} value={member}>{member}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nama Brand / Sponsor {editingTask.contentType === 'regular' ? '(Opsional)' : '*'}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingTask.brand || ''} 
                  onChange={e => setEditingTask({ ...editingTask, brand: e.target.value })}
                  required={editingTask.contentType !== 'regular'}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Platform</label>
                  <select 
                    className="form-control"
                    value={editingTask.platform} 
                    onChange={e => setEditingTask({ ...editingTask, platform: e.target.value })}
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tenggat Waktu (Deadline)</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={editingTask.dueDate || ''} 
                    onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Deliverables (Detail Pekerjaan)</label>
                  <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setEditingTask({...editingTask, subtasks: generateAutoChecklist(editingTask.deliverables, editingTask.subtasks || [])})}>
                    <CheckSquare size={12} /> AI Auto-Checklist
                  </button>
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editingTask.deliverables || ''} 
                  onChange={e => setEditingTask({ ...editingTask, deliverables: e.target.value })}
                />
                {editingTask.subtasks && editingTask.subtasks.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '11px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Checklist Otomatis:</div>
                    {editingTask.subtasks.map((st, i) => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <input 
                          type="checkbox" 
                          checked={st.completed} 
                          onChange={(e) => {
                            const newSt = [...editingTask.subtasks];
                            newSt[i].completed = e.target.checked;
                            setEditingTask({...editingTask, subtasks: newSt});
                          }} 
                        />
                        <span style={{ textDecoration: st.completed ? 'line-through' : 'none', opacity: st.completed ? 0.6 : 1 }}>{st.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Link Brief Brand</label>
                  <input type="text" className="form-control" value={editingTask.briefLink || ''} onChange={e => setEditingTask({...editingTask, briefLink: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Link Draf Video</label>
                  <input type="text" className="form-control" value={editingTask.draftLink || ''} onChange={e => setEditingTask({...editingTask, draftLink: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Catatan / Do's & Don'ts</label>
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '2px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => setEditNotesTab('preview')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: editNotesTab === 'preview' ? 'var(--accent-light)' : 'transparent',
                        color: editNotesTab === 'preview' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Pratinjau Rapi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditNotesTab('edit')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        background: editNotesTab === 'edit' ? 'var(--accent-light)' : 'transparent',
                        color: editNotesTab === 'edit' ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Sunting Teks
                    </button>
                  </div>
                </div>

                {editNotesTab === 'preview' ? (
                  <div style={{
                    minHeight: '280px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '14px 18px',
                    color: 'var(--text-primary)'
                  }}>
                    {renderMarkdown(editingTask.notes)}
                  </div>
                ) : (
                  <textarea 
                    className="form-control" 
                    value={editingTask.notes || ''} 
                    onChange={e => setEditingTask({ ...editingTask, notes: e.target.value })}
                    style={{
                      minHeight: '280px',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      fontFamily: 'var(--font-sans)',
                      padding: '12px 14px'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                {editingTask.status === 'published' && onCreateInvoice && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ marginRight: 'auto' }}
                    onClick={() => {
                      onCreateInvoice(editingTask);
                      setEditingTask(null);
                    }}
                  >
                    Buat Invoice
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTask(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Burnout Warning */}
      {(() => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const heavyTasksCount = pipelineTasks.filter(t => {
          if (t.status !== 'production' && t.status !== 'editing') return false;
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate + 'T00:00:00');
          const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        }).length;

        if (heavyTasksCount >= 5) {
          return (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: 'var(--border-radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <Flame size={18} /> ALERT: Awas Tumbang! Ada {heavyTasksCount} video sedang diproduksi/diedit minggu ini. Jangan lupa minum tolak angin!
            </div>
          );
        }
        return null;
      })()}

      {/* Kanban Board */}
      <div className="pipeline-container">
        {columns.map(col => {
          const tasksInCol = pipelineTasks.filter(t => t.status === col.id);
          const isDragOver = activeDragCol === col.id;
          return (
            <div 
              key={col.id} 
              className={`pipeline-column ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => { e.preventDefault(); setActiveDragCol(col.id); }}
              onDragLeave={() => setActiveDragCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                  {col.label}
                </div>
                <div className="column-count">{tasksInCol.length}</div>
              </div>

              <div className="column-cards">
                {tasksInCol.map(task => {
                  const dlClass = getDeadlineClass(task.dueDate);
                  const dlLabel = getDeadlineLabel(task.dueDate);
                  return (
                  <div 
                    key={task.id} 
                    className={`pipeline-card ${dlClass} ${task.status === 'published' ? 'status-published' : ''}`}
                    style={task.isRevising ? { border: '2px solid var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.03)' } : {}}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDoubleClick={() => { setEditingTask({...task}); setEditNotesTab('preview'); }}
                    title="Klik ganda untuk mengedit"
                  >
                    <div className="card-project-header" style={{ marginBottom: '4px' }}>
                      <span className="card-project-brand" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                        {task.contentType === 'regular' ? (
                          <span style={{ padding: '2px 6px', background: 'var(--accent-light)', color: 'var(--accent-color)', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>ORGANIK</span>
                        ) : (
                          <span style={{ padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>SPONSOR</span>
                        )}
                        {task.brand || 'Konten Personal'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {task.isRevising && (
                          <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <ShieldAlert size={10} /> REVISI!
                          </span>
                        )}
                        <button 
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                          onMouseDown={(e) => e.stopPropagation()}
                          title="Hapus Tugas"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="card-project-title" style={{ marginBottom: '4px' }}>{task.title}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <UserCircle size={12} /> {task.assignee || 'Manager'}
                    </div>
                    
                    {task.deliverables && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Video size={10} /> {task.deliverables}
                      </div>
                    )}

                    {task.dueDate && (
                      <div className="card-due-date" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <Calendar size={10} /> Tenggat: {task.dueDate}
                        </span>
                        {dlLabel && (
                          <span style={{
                            marginLeft: '4px',
                            fontSize: '9.5px',
                            fontWeight: '700',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            background: dlClass === 'deadline-warning' ? 'rgba(245,158,11,0.15)' :
                                         dlClass === 'deadline-today' ? 'rgba(239,68,68,0.15)' :
                                         dlClass === 'deadline-overdue' ? 'rgba(220,38,38,0.15)' : 'transparent',
                            color: dlClass === 'deadline-warning' ? '#d97706' : 'var(--danger-color)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}>
                            {(dlClass === 'deadline-today' || dlClass === 'deadline-overdue') && <AlertTriangle size={9} />}
                            {dlLabel}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="card-project-meta" style={{ flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Tag size={10} /> {task.platform}</span>
                      {task.briefLink && (
                        <a href={task.briefLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-color)', textDecoration: 'none', fontSize: '10px' }} onClick={e => e.stopPropagation()}>
                          <LinkIcon size={10} /> Brief
                        </a>
                      )}
                      {task.draftLink && (
                        <a href={task.draftLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#8b5cf6', textDecoration: 'none', fontSize: '10px' }} onClick={e => e.stopPropagation()}>
                          <CheckCircle2 size={10} /> Draf
                        </a>
                      )}
                    </div>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <div style={{ marginTop: '8px', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 'bold' }}>
                          <span>Checklist</span>
                          <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', backgroundColor: 'var(--accent-color)', width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`, transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    )}

                    <div className="card-actions" style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={(e) => { e.stopPropagation(); moveLeft(task.id, task.status); }} onMouseDown={(e) => e.stopPropagation()} disabled={col.id === 'calendar'} style={{ flex: 'none', cursor: col.id === 'calendar' ? 'not-allowed' : 'pointer' }}>
                        <ArrowLeft size={10} />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = pipelineTasks.map(t => t.id === task.id ? {...t, isRevising: !t.isRevising} : t);
                          setPipelineTasks(updated);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ padding: '3px 8px', fontSize: '9.5px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid', backgroundColor: task.isRevising ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: task.isRevising ? 'var(--danger-color)' : 'var(--text-secondary)', borderColor: task.isRevising ? 'var(--danger-color)' : 'var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {task.isRevising ? 'Batal Revisi' : 'Tandai Revisi'}
                      </button>

                      <button onClick={(e) => { e.stopPropagation(); moveRight(task.id, task.status); }} onMouseDown={(e) => e.stopPropagation()} disabled={col.id === 'published'} style={{ flex: 'none', cursor: col.id === 'published' ? 'not-allowed' : 'pointer' }}>
                        <ArrowRight size={10} />
                      </button>
                    </div>

                    {task.status === 'published' && onCreateInvoice && (
                      <button 
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateInvoice(task);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          fontSize: '11px',
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        Buat Invoice
                      </button>
                    )}
                  </div>
                  );
                })}
                {tasksInCol.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '24px 8px', 
                    color: 'var(--text-muted)', 
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: '11px'
                  }}>
                    Seret tugas ke sini
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
