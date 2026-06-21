import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Tag, AlertTriangle, Sparkles } from 'lucide-react';

const CalendarView = ({ calendarEvents = [], setCalendarEvents, googleConnected, addPipelineTask, profile = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 16)); // Fixed start date matching system time: June 16, 2026 (Month index 5 is June)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-06-16',
    type: 'personal', // personal, brand, deadline
    brand: ''
  });

  // Calculate best posting times dynamically or via researched schedules
  const getBestPostingTimesForDate = (dateStr) => {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...
    const recs = [];
    
    if (dayOfWeek === 1) recs.push({ platform: 'Instagram', time: '19:00', reason: 'High active engagement rate' });
    if (dayOfWeek === 2) recs.push({ platform: 'YouTube', time: '17:00', reason: 'Optimal uploaded upload window' });
    if (dayOfWeek === 3) recs.push({ platform: 'TikTok', time: '18:00', reason: 'Peak commuting home traffic' });
    if (dayOfWeek === 4) {
      recs.push({ platform: 'Instagram', time: '18:00', reason: 'Pre-weekend social usage' });
      recs.push({ platform: 'YouTube', time: '16:00', reason: 'Post-school/work study time' });
    }
    if (dayOfWeek === 5) recs.push({ platform: 'TikTok', time: '19:30', reason: 'Friday prime night viewing' });
    if (dayOfWeek === 6) {
      recs.push({ platform: 'Instagram', time: '20:00', reason: 'Weekend lifestyle peak' });
      recs.push({ platform: 'YouTube', time: '10:00', reason: 'Saturday leisure browsing' });
    }
    if (dayOfWeek === 0) recs.push({ platform: 'TikTok', time: '12:00', reason: 'Sunday midday casual scroll' });
    
    return recs;
  };

  const getDynamicInsights = () => {
    const posts = profile.recentPosts || [];
    if (posts.length === 0) {
      return {
        bestDay: 'Jumat',
        bestPlatform: 'TikTok',
        reason: 'Berdasarkan statistik umum kreator niche ' + (profile.niche || 'konten') + ', audiens paling aktif pada hari Jumat malam.'
      };
    }
    
    const dayStats = {};
    const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    posts.forEach(p => {
      if (!p.uploadDate) return;
      const dayIdx = new Date(p.uploadDate).getDay();
      if (!dayStats[dayIdx]) {
        dayStats[dayIdx] = { count: 0, views: 0, platform: p.platform };
      }
      dayStats[dayIdx].count++;
      dayStats[dayIdx].views += (p.views || 0);
    });
    
    let bestDayIdx = 5; // Friday default
    let maxViews = -1;
    let bestPlatform = 'TikTok';
    
    Object.keys(dayStats).forEach(idx => {
      const avgViews = dayStats[idx].views / dayStats[idx].count;
      if (avgViews > maxViews) {
        maxViews = avgViews;
        bestDayIdx = parseInt(idx);
        bestPlatform = dayStats[idx].platform;
      }
    });
    
    return {
      bestDay: daysName[bestDayIdx],
      bestPlatform,
      reason: `Postingan ${bestPlatform} Anda pada hari ${daysName[bestDayIdx]} mencatat rata-rata performa penonton tertinggi (${(maxViews || 0).toLocaleString('id-ID')} views).`
    };
  };

  const handleSelectBestTime = (dateStr, rec) => {
    setNewEvent({
      title: `Upload ${rec.platform} Terjadwal (AI)`,
      date: dateStr,
      type: 'personal',
      brand: ''
    });
    setShowAddForm(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get month name in Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calendar logic
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  // Convert Sunday-indexed to Monday-indexed: Monday is 0, Sunday is 6
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title) return;

    const created = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      start: newEvent.date,
      type: newEvent.type,
      brand: newEvent.brand
    };

    setCalendarEvents([...calendarEvents, created]);

    if (addPipelineTask) {
      const displayDeliverables = newEvent.type === 'deadline' ? 'Deadline' : (newEvent.type === 'brand' ? 'Rapat/Meeting' : 'Produksi/Syuting');
      const newPipelineTask = {
        id: `task-${Date.now()}`,
        title: newEvent.title,
        brand: newEvent.brand || 'Jadwal Kalender',
        platform: 'Lainnya',
        dueDate: newEvent.date,
        deliverables: displayDeliverables,
        notes: `Agenda otomatis dari Kalender.\nJenis Kegiatan: ${displayDeliverables}`,
        status: 'calendar'
      };
      addPipelineTask(newPipelineTask);
    }
    
    // Reset form
    setNewEvent({
      title: '',
      date: `${year}-${String(month + 1).padStart(2, '0')}-16`,
      type: 'personal',
      brand: ''
    });
    setShowAddForm(false);
  };

  // Build grid of days
  const calendarCells = [];

  // 1. Prev month trailing days
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      isCurrentMonth: false,
      dateString: dateStr
    });
  }

  // 2. Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      isCurrentMonth: true,
      dateString: dateStr,
      isToday: i === 16 && month === 5 && year === 2026 // Today's date is June 16, 2026
    });
  }

  // 3. Next month leading days to complete grid (multiples of 7, let's say 42 cells)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      dateString: dateStr
    });
  }

  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <div className="content-header">
        <div className="content-title">
          <h1>Kalender Kreator</h1>
          <p>
            {googleConnected ? 'Sinkronisasi aktif dengan Google Calendar.' : 'Mode Kalender Lokal. Hubungkan Google di Setelan untuk sinkronisasi cloud.'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Tambah Agenda
          </button>
        </div>
      </div>

      {/* Add Event Modal */}
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
          <div className="card" style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--bg-secondary)' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Tambah Agenda Kalender</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Judul Kegiatan / Agenda *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: Sesi Pengambilan Gambar Tokopedia"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jenis Kegiatan</label>
                  <select 
                    className="form-control"
                    value={newEvent.type}
                    onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                  >
                    <option value="personal">Produksi / Syuting (Hijau)</option>
                    <option value="brand">Rapat Brand / Meeting (Ungu)</option>
                    <option value="deadline">Tenggat Waktu / Deadline (Merah)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Brand / Sponsor (Opsional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Misal: Tokopedia"
                  value={newEvent.brand}
                  onChange={e => setNewEvent({ ...newEvent, brand: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
          {monthNames[month]} {year}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon-only" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setCurrentDate(new Date(2026, 5, 16))}>
            Hari Ini
          </button>
          <button className="btn-icon-only" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card" style={{ padding: '20px', flexGrow: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Days of Week Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-header-day">{day}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '8px', gridAutoRows: '1fr', flexGrow: 1 }}>
            {calendarCells.map((cell, idx) => {
              const dayEvents = calendarEvents.filter(e => e.start === cell.dateString);
              return (
                <div 
                  key={idx} 
                  className={`calendar-day-card ${!cell.isCurrentMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''}`}
                  style={{ minHeight: '110px' }}
                >
                  <div className="calendar-day-number" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{cell.day}</span>
                    {cell.isToday && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>Hari Ini</span>}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flexGrow: 1, maxHeight: '80px', marginTop: '4px' }}>
                    {/* Render AI Best Posting Times Recommendations */}
                    {cell.isCurrentMonth && getBestPostingTimesForDate(cell.dateString).map((rec, rIdx) => (
                      <button
                        key={`ai-rec-${rIdx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectBestTime(cell.dateString, rec);
                        }}
                        className="calendar-event-ai-rec"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '9.5px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1))',
                          border: '1px solid rgba(234, 179, 8, 0.25)',
                          color: '#eab308',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          transition: 'transform 0.1s'
                        }}
                        title={`Rekomendasi AI: Upload ${rec.platform} pada jam ${rec.time} (${rec.reason}). Klik untuk menjadwalkan.`}
                      >
                        <Sparkles size={8} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AI: {rec.platform} {rec.time}</span>
                      </button>
                    ))}

                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`calendar-event ${
                          event.type === 'deadline' ? 'deadline' : 
                          event.type === 'brand' ? 'brand' : 'personal'
                        }`}
                        title={`${event.title} (${event.brand || 'Personal'})`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '4px',
                          paddingRight: '6px'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                          {event.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Apakah Anda yakin ingin menghapus agenda "${event.title}"?`)) {
                              setCalendarEvents(calendarEvents.filter(evt => evt.id !== event.id));
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'inherit',
                            fontSize: '11px',
                            lineHeight: '1',
                            cursor: 'pointer',
                            padding: '0 2px',
                            fontWeight: 'bold',
                            opacity: 0.6,
                            transition: 'opacity 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          title="Hapus Agenda"
                          onMouseEnter={(e) => e.target.style.opacity = 1}
                          onMouseLeave={(e) => e.target.style.opacity = 0.6}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* AI Best Posting Time Insights Summary Card */}
      <div className="card" style={{
        marginTop: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(234, 179, 8, 0.03) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>AI Insights: Waktu Posting Terbaik Anda</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Dianalisis secara real-time berdasarkan performa penonton postingan media sosial Anda.</p>
          </div>
        </div>

        {(() => {
          const insights = getDynamicInsights();
          return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '16px', alignItems: 'center' }}>
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', tracking: '0.05em', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Hari Terbaik</span>
                <h4 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-color)', margin: '6px 0' }}>{insights.bestDay}</h4>
                <span style={{ fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: '500' }}>Platform Utama: {insights.bestPlatform}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308', marginTop: '6px', flexShrink: 0 }} />
                  <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                    {insights.reason}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', marginTop: '6px', flexShrink: 0 }} />
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                    Klik tombol rekomendasi <span style={{ color: '#eab308', fontWeight: '600' }}>AI: [Platform] [Jam]</span> di atas pada kalender untuk langsung menjadwalkan draf/brief konten Anda secara asisten-sentris.
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

    </div>
  );
};

export default CalendarView;
