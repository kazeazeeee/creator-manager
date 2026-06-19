import React, { useState } from 'react';
import { MessageSquare, Copy, Check, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { apiGenerateDraft } from '../utils/api';

const MOCK_COMM_RESPONSES = {
  rate_card: `Kepada Yth. Tim Klien,

Terima kasih atas penawaran kerja sama yang diajukan untuk kampanye terbaru Anda. Kami sangat tertarik dengan konsep kolaborasi ini.

Mengenai penawaran rate card sebesar Rp3.000.000, mohon maaf saat ini tarif tersebut berada di bawah tarif standar penawaran kami. Namun, sebagai kompromi yang saling menguntungkan, kami dapat menawarkan alternatif penyesuaian sebagai berikut:

- Mengurangi deliverable menjadi 1x Reels Post saja (tanpa Instagram Story), dengan rate khusus sebesar Rp4.000.000.
- ATAU, mempertahankan semua deliverables (1x Reels + 3x Stories) dengan penyesuaian rate minimal di Rp4.500.000.

Langkah ini kami ambil untuk tetap menjaga kualitas produksi konten premium yang sesuai dengan standar audiens kami. Silakan beri tahu kami opsi mana yang sekiranya sesuai dengan alokasi anggaran tim Anda.

Salam hangat,
Manajemen Jessica Hartono`,
  overdue: `Halo Tim Brand,

Semoga pesan ini menemui Anda dalam keadaan baik.

Kami ingin menindaklanjuti pembayaran untuk Invoice #INV-2026-003 proyek TikTok Sponsorship - GoFood Promo yang telah jatuh tempo pada tanggal 30 Mei 2026. Sampai hari ini, kami belum menerima konfirmasi pembayaran atau transfer dana untuk invoice tersebut.

Mohon bantuannya untuk memeriksa status invoice ini ke bagian finance Anda. Kami lampirkan kembali salinan dokumen invoice untuk referensi Anda. Jika ada kendala administratif, mohon kabari kami secepatnya agar kami bisa berdiskusi lebih lanjut.

Terima kasih banyak atas perhatian dan kerja samanya.

Salam,
Manajemen Jessica Hartono`,
  reject: `Halo Tim Brand,

Terima kasih banyak atas ketertarikan Anda untuk berkolaborasi dengan Jessica Hartono dalam kampanye promosi Anda. Kami sangat mengapresiasi penawaran ini.

Setelah meninjau detail produk dan keselarasan dengan kalender konten kami saat ini, dengan sangat menyesal kami harus menginformasikan bahwa kami belum dapat mengambil proyek ini untuk sementara waktu. Kami sangat menjaga kesesuaian ceruk konten (niche) serta kenyamanan audiens kami dengan membatasi jumlah kerja sama brand sejenis dalam satu periode.

Semoga ada kesempatan lain di masa mendatang di mana kita dapat bekerja sama kembali. Sukses selalu untuk kampanyenya!

Salam hangat,
Manajemen Jessica Hartono`,
  revision: `Halo Tim Klien,

Terima kasih atas masukannya mengenai draf video yang kami kirimkan sebelumnya.

Mengenai permintaan revisi untuk merekam ulang produk di luar ruangan, mohon maaf saat ini hal tersebut sudah melewati cakupan kesepakatan awal (briefing awal menyebutkan pengambilan gambar produk di dalam ruangan/studio setup). 

Kami sangat bersedia melakukan penyesuaian penyuntingan (editing/warna/teks) secara gratis. Namun, untuk pengambilan gambar ulang (reshoot) di luar lokasi studio akan dikenakan biaya produksi tambahan sebesar Rp1.000.000 untuk menutupi biaya operasional sewa alat dan transportasi.

Mohon konfirmasinya apakah kami perlu menerbitkan invoice tambahan untuk reshoot ini, atau kita lanjut dengan penyesuaian editing draf yang sudah ada?

Salam hangat,
Manajemen Jessica Hartono`,
  pitch: `Halo Tim Brand,

Perkenalkan, kami dari manajemen Jessica Hartono, konten kreator di bidang Beauty & Lifestyle Tech. Kami telah lama mengikuti perkembangan produk-produk inovatif dari brand Anda dan melihat keselarasan yang sangat kuat dengan minat audiens Jessica.

Melalui pesan ini, kami ingin menawarkan draf konsep kolaborasi kreatif untuk peluncuran produk terbaru Anda. Audiens Jessica saat ini memiliki engagement rate sebesar 4.8% dengan demografi 75% wanita usia produktif (18-34 tahun) yang sangat aktif mencari rekomendasi skincare harian.

Kami melampirkan Media Kit dan Rate Card terbaru kami untuk bahan pertimbangan Anda. Kami sangat senang jika bisa menjadwalkan diskusi singkat selama 10 menit via Zoom minggu ini untuk mempresentasikan ide konten kami secara langsung.

Terima kasih atas waktu dan perhatiannya. Kami menantikan kabar baik dari Anda.

Salam hangat,
Manajemen Jessica Hartono`
};

const Communicator = ({ apiKey, creatorProfile }) => {
  const [scenario, setScenario] = useState('rate_card');
  const [tone, setTone] = useState('professional');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (useDemo = false) => {
    setError('');
    setLoading(true);

    const detailText = useDemo ? 'Brand mau nawar tapi kita mau negosiasi harga' : details;
    if (useDemo) {
      setDetails('Brand Z menawar rate dari 5 juta menjadi 3 juta. Kita ingin menawarkan harga net di 4.5 juta atau mengurangi postingan instastory.');
    }

    try {
      if (useDemo || !apiKey) {
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGeneratedDraft(MOCK_COMM_RESPONSES[scenario] || MOCK_COMM_RESPONSES.rate_card);
        if (!apiKey && !useDemo) {
          setError('Catatan: Menampilkan hasil simulasi karena API Key SumoPod belum diatur di Setelan.');
        }
      } else {
        const res = await apiGenerateDraft(scenario, tone, detailText, creatorProfile);
        const draft = res.draft;
        setGeneratedDraft(draft);
      }
    } catch (err) {
      console.error(err);
      setError(`Gagal membuat draf: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Settings Form Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Parameter Pesan
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
              <span>API Key belum diatur di Setelan. Anda tetap bisa mencoba menggunakan draf simulasi offline.</span>
            </div>
          )}

          <div className="form-group">
            <label>Pilih Skenario Percakapan</label>
            <select 
              className="form-control"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="rate_card">Negosiasi Rate Card / Biaya Jasa</option>
              <option value="overdue">Menagih Invoice Terlambat (Overdue Payment)</option>
              <option value="revision">Menanggapi Permintaan Revisi Berlebih</option>
              <option value="reject">Menolak Kerja Sama / Sponsorship secara Sopan</option>
              <option value="pitch">Mengajukan Penawaran Awal (Cold Pitching ke Brand)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nada Bicara (Tone of Voice)</label>
            <select 
              className="form-control"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Profesional & Tegas (Sangat direkomendasikan)</option>
              <option value="friendly">Ramah & Kolaboratif (Hangat)</option>
              <option value="casual">Santai & Ringkas (Kasual)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Detail Konteks Tambahan (Penting)</label>
            <textarea 
              className="form-control"
              placeholder="Tuliskan nama brand, nilai tawar, deliverables yang mau ditawar, atau kendala Anda secara singkat..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              style={{ minHeight: '120px' }}
            />
          </div>

          {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleGenerate(false)}
              disabled={loading || !details.trim()}
              style={{ flexGrow: 1 }}
            >
              {loading ? <><RefreshCw className="animate-spin" size={14} /> Membuat Draf...</> : 'Buat Draf Pesan'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleGenerate(true)}
              disabled={loading}
            >
              Simulasi Demo
            </button>
          </div>
        </div>

        {/* Output Draft Card */}
        {(generatedDraft || loading) && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', minHeight: loading ? '300px' : 'auto' }}>
            {loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: 'var(--border-radius-xl)', opacity: 0.95 }}>
                <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>Membuat Draf Pesan...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>Mohon tunggu sebentar, AI sedang memproses.</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px' }}>Draf Pesan Siap Pakai</h3>
              <button 
                className="btn btn-primary" 
                style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleCopy}
              >
                {copied ? <><Check size={14} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={14} /> Salin Draf</>}
              </button>
            </div>
            
            <textarea 
              className="form-control"
              style={{ 
                flexGrow: 1, 
                minHeight: '320px', 
                fontSize: '13px', 
                fontFamily: 'sans-serif', 
                lineHeight: '1.5',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '16px'
              }}
              value={generatedDraft}
              onChange={(e) => setGeneratedDraft(e.target.value)}
            />
            
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px' }}>
              <Send size={12} />
              <span>Tips: Anda dapat langsung menyunting teks draf di atas sebelum menyalinnya.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communicator;
