import React, { useState } from 'react';
import { Plus, Trash, Check, Clock, AlertTriangle, Printer, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

const Invoices = ({ invoices = [], setInvoices, creatorProfile }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, paid, pending, overdue
  const [activeInvoice, setActiveInvoice] = useState(null); // for preview / printing
  
  const [newInvoice, setNewInvoice] = useState({
    id: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
    clientName: '',
    clientEmail: '',
    projectName: '',
    issueDate: new Date().toISOString().substring(0, 10),
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    items: [{ description: '', qty: 1, rate: 0 }]
  });

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', qty: 1, rate: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = newInvoice.items.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [field]: field === 'qty' ? parseInt(value) || 0 : field === 'rate' ? parseFloat(value) || 0 : value
        };
      }
      return item;
    });
    setNewInvoice({ ...newInvoice, items: updatedItems });
  };

  const handleStatusChange = (invoiceId, newStatus) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: newStatus };
      }
      return inv;
    }));
  };

  const handleDelete = (invoiceId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus invoice ini?')) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newInvoice.clientName || !newInvoice.projectName) return;

    // Calculate total amount
    const totalAmount = newInvoice.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);

    const created = {
      ...newInvoice,
      amount: totalAmount,
      status: 'pending'
    };

    setInvoices([created, ...invoices]);
    
    // Reset form
    setNewInvoice({
      id: `INV-2026-${String(invoices.length + 2).padStart(3, '0')}`,
      clientName: '',
      clientEmail: '',
      projectName: '',
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      items: [{ description: '', qty: 1, rate: 0 }]
    });
    
    setShowAddForm(false);
  };

  const handlePrint = (invoice) => {
    setActiveInvoice(invoice);
    // Let the component render then trigger window.print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  return (
    <div>
      {/* Printable Area - Hidden normally, visible during print */}
      {activeInvoice && (
        <div id="print-section" className="print-only">
          <div style={{ padding: '40px', color: '#111827', backgroundColor: '#fff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: '1.5' }}>
            {/* Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '0.05em' }}>INVOICE</h1>
                <p style={{ color: '#4b5563', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '500' }}>No: {activeInvoice.id}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', color: '#111827' }}>{creatorProfile.name}</h3>
                <p style={{ margin: '4px 0 0 0', color: '#4b5563', fontSize: '12px' }}>{creatorProfile.handle || '@username'}</p>
              </div>
            </div>

            {/* Billing Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', marginTop: '30px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ditagihkan Kepada:</h4>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#111827' }}>{activeInvoice.clientName}</h3>
                <p style={{ margin: '2px 0 0 0', color: '#4b5563', fontSize: '12px' }}>{activeInvoice.clientEmail || '-'}</p>
                <div style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#374151' }}>
                  Deskripsi Proyek: <strong style={{ color: '#111827' }}>{activeInvoice.projectName}</strong>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#374151' }}>
                <p style={{ margin: '0 0 6px 0' }}>Tanggal Terbit: <strong style={{ color: '#111827' }}>{formatDate(activeInvoice.issueDate)}</strong></p>
                <p style={{ margin: '0 0 6px 0' }}>Jatuh Tempo: <strong style={{ color: activeInvoice.status === 'overdue' ? '#ef4444' : '#111827' }}>{formatDate(activeInvoice.dueDate)}</strong></p>
                <p style={{ margin: 0 }}>Status Dokumen: <strong style={{ textTransform: 'uppercase', color: activeInvoice.status === 'paid' ? '#10b981' : '#f59e0b' }}>{activeInvoice.status === 'pending' ? 'Belum Bayar' : activeInvoice.status}</strong></p>
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '40px', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#111827', color: '#ffffff' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>Deskripsi Pekerjaan / Deliverables</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', width: '80px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>Jumlah</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '150px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>Tarif (Rate)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', width: '150px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {activeInvoice.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', color: '#374151' }}>{item.description}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>{item.qty}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>{formatCurrency(item.rate, creatorProfile.currency)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#111827' }}>{formatCurrency(item.qty * item.rate, creatorProfile.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Calculations */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <div style={{ width: '300px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(activeInvoice.amount, creatorProfile.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', fontSize: '14px', fontWeight: '700', color: '#111827', backgroundColor: '#f9fafb', borderRadius: '4px', marginTop: '6px' }}>
                  <span>Total Tagihan:</span>
                  <span>{formatCurrency(activeInvoice.amount, creatorProfile.currency)}</span>
                </div>
              </div>
            </div>

            {/* Payment Info & Signature Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginTop: '60px', borderTop: '2px solid #111827', paddingTop: '20px', fontSize: '12px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', color: '#111827', letterSpacing: '0.05em' }}>Detail Instruksi Pembayaran:</h4>
                <p style={{ margin: '2px 0', color: '#374151' }}>Bank Penerima: <strong>{creatorProfile.bankName || 'Bank Central Asia (BCA)'}</strong></p>
                <p style={{ margin: '2px 0', color: '#374151' }}>Nomor Rekening: <strong>{creatorProfile.bankAccount || '123-456-7890'}</strong></p>
                <p style={{ margin: '2px 0', color: '#374151' }}>Atas Nama: <strong>{creatorProfile.bankHolder || creatorProfile.name}</strong></p>
                <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', color: '#6b7280', fontSize: '11px', lineHeight: '1.4' }}>
                  Catatan: Mohon sertakan referensi invoice <strong>{activeInvoice.id}</strong> pada berita transfer Anda dan kirimkan bukti pembayaran ke email kami.
                  {creatorProfile.adminPhone && (
                    <>
                      <br />
                      Konfirmasi Transfer / Hubungi Admin: <strong>{creatorProfile.adminPhone}</strong>
                    </>
                  )}
                </p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '110px' }}>
                <span style={{ fontWeight: '500', color: '#374151' }}>Hormat Kami,</span>
                <div style={{ display: 'inline-block', width: '150px', borderBottom: '1px solid #111827', margin: '0 0 6px auto' }} />
                <span style={{ fontWeight: '700', textTransform: 'uppercase', color: '#111827', fontSize: '12px' }}>{creatorProfile.name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Screen (Hidden during print) */}
      <div className="no-print">
        <div className="content-header">
          <div className="content-title">
            <h1>Invoice & Pembayaran</h1>
            <p>Kelola pembayaran sponsorship Anda, buat invoice profesional, dan pantau status tagihan.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Buat Invoice
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['all', 'paid', 'pending', 'overdue'].map(type => (
            <button
              key={type}
              className={`btn ${filter === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', padding: '8px 16px', fontSize: '12px' }}
              onClick={() => setFilter(type)}
            >
              {type === 'all' ? 'Semua' : type === 'paid' ? 'Lunas' : type === 'pending' ? 'Pending' : 'Telat (Overdue)'}
            </button>
          ))}
        </div>

        {/* Add Invoice Form Drawer/Modal */}
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
            <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Buat Invoice Baru</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Nomor Invoice</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newInvoice.id} 
                    onChange={e => setNewInvoice({ ...newInvoice, id: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Brand / Klien *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Misal: Wardah Beauty"
                      value={newInvoice.clientName} 
                      onChange={e => setNewInvoice({ ...newInvoice, clientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Klien / Finance</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Misal: billing@brand.com"
                      value={newInvoice.clientEmail} 
                      onChange={e => setNewInvoice({ ...newInvoice, clientEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nama Kampanye / Proyek *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Misal: Instagram Campaign Cushion Launch"
                    value={newInvoice.projectName} 
                    onChange={e => setNewInvoice({ ...newInvoice, projectName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal Terbit</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={newInvoice.issueDate} 
                      onChange={e => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jatuh Tempo</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={newInvoice.dueDate} 
                      onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontWeight: '600', fontSize: '13px' }}>Item Rincian Biaya</label>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={handleAddItem}>
                      + Tambah Item
                    </button>
                  </div>

                  {newInvoice.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Deskripsi pekerjaan (misal: 1x Reels)"
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                        required
                        style={{ flexGrow: 2 }}
                      />
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Qty"
                        value={item.qty}
                        onChange={e => handleItemChange(index, 'qty', e.target.value)}
                        required
                        style={{ width: '70px' }}
                        min="1"
                      />
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Rate"
                        value={item.rate}
                        onChange={e => handleItemChange(index, 'rate', e.target.value)}
                        required
                        style={{ width: '130px' }}
                      />
                      {newInvoice.items.length > 1 && (
                        <button type="button" className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleRemoveItem(index)}>
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Buat Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice List Card */}
        <div className="card">
          <div className="invoice-table-container">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>No. Invoice</th>
                  <th>Brand / Klien</th>
                  <th>Proyek</th>
                  <th>Jumlah</th>
                  <th>Tanggal Jatuh Tempo</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td style={{ fontWeight: '600' }}>{invoice.id}</td>
                    <td>{invoice.clientName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{invoice.projectName}</td>
                    <td style={{ fontWeight: '500' }}>{formatCurrency(invoice.amount, creatorProfile.currency)}</td>
                    <td style={{ color: invoice.status === 'overdue' ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td>
                      <select
                        className={`badge ${
                          invoice.status === 'paid' ? 'badge-success' : 
                          invoice.status === 'pending' ? 'badge-warning' : 'badge-danger'
                        }`}
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none', padding: '4px 8px' }}
                      >
                        <option value="paid" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--success-color)' }}>Lunas</option>
                        <option value="pending" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--warning-color)' }}>Pending</option>
                        <option value="overdue" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--danger-color)' }}>Telat (Overdue)</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn-icon-only" style={{ padding: '6px' }} onClick={() => handlePrint(invoice)} title="Print PDF">
                          <Printer size={14} />
                        </button>
                        <button className="btn-icon-only" style={{ padding: '6px', color: 'var(--danger-color)' }} onClick={() => handleDelete(invoice.id)} title="Delete">
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      Tidak ada invoice yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
