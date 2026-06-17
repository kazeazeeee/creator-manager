import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Tag, AlertTriangle } from 'lucide-react';

const CalendarView = ({ calendarEvents = [], setCalendarEvents, googleConnected, addPipelineTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 16)); // Fixed start date matching system time: June 16, 2026 (Month index 5 is June)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '2026-06-16',
    type: 'personal', // personal, brand, deadline
    brand: ''
  });

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
                  <div className="calendar-day-number">
                    {cell.day}
                    {cell.isToday && <span style={{ marginLeft: '6px', fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>Hari Ini</span>}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flexGrow: 1, maxHeight: '80px' }}>
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className={`calendar-event ${
                          event.type === 'deadline' ? 'deadline' : 
                          event.type === 'brand' ? 'brand' : 'personal'
                        }`}
                        title={`${event.title} (${event.brand || 'Personal'})`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarView;
