import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, FileText, CheckCircle, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';
import { apiAnalyzeContract, apiAnalyzeClause } from '../utils/api';

const MOCK_CONTRACT_INPUT = `Sponsorship Agreement - Brand Z and Creator Jess
This Sponsorship Agreement ("Agreement") is made between Brand Z ("Sponsor") and Jessica Hartono ("Creator").
1. Services: Creator shall produce 1 TikTok Video showcasing Sponsor's new energy drink.
2. Exclusivity: Creator agrees that during the term of this Agreement and for a period of twelve (12) months following the publication of the Video, Creator will not perform services for, or promote, any other beverage brand, including but not limited to coffee, energy drinks, soda, or bottled water brands.
3. Intellectual Property: Creator hereby assigns to Sponsor all intellectual property rights, copyright, and ownership of the Video in perpetuity, throughout the universe. Sponsor shall have the right to modify, edit, distribute, and run paid advertisements using the Video on any platform without further compensation to Creator.
4. Payment: Sponsor shall pay Creator a fee of IDR 5,000,000. Payment shall be made within ninety (90) days after Creator submits a valid invoice following publication of the Video.
5. Delay Penalty: In the event of a delay in submitting deliverables, Creator shall be liable to pay Sponsor a penalty of 1% of the fee per day of delay.`;

const MOCK_CONTRACT_ANALYSIS = {
  hasExclusivity: true,
  exclusivityDetails: 'Dilarang bekerja sama dengan brand minuman apa pun (termasuk kopi, air mineral, soda, minuman energi) selama 12 bulan setelah konten tayang.',
  paymentTerms: 'Pembayaran IDR 5.000.000 dalam waktu 90 hari (NET 90) setelah penyerahan invoice pasca konten tayang.',
  paymentRisk: 'high',
  usageRights: 'Mengalihkan SELURUH hak cipta secara permanen (selamanya, di seluruh dunia) kepada Brand. Brand bebas mengedit dan menggunakannya untuk iklan berbayar tanpa royalti tambahan.',
  usageRightsRisk: 'high',
  otherRisks: [
    {
      title: 'Denda Keterlambatan Sangat Berat',
      description: 'Denda 1% dari total fee per hari keterlambatan penyerahan draf konten.'
    },
    {
      title: 'Lingkup Eksklusivitas Terlalu Luas',
      description: 'Larangan mencakup minuman umum seperti air mineral dan kopi, bukan hanya kategori minuman energi sejenis.'
    }
  ],
  negotiationSuggestions: `Kepada Tim Brand Z,

Terima kasih atas draf perjanjiannya. Kami ingin mengajukan beberapa penyesuaian agar kerja sama ini lebih berimbang bagi kedua belah pihak:

1. Pasal Eksklusivitas: Mengingat rate card standar kami, eksklusivitas selama 12 bulan sangat membatasi peluang kerja sama kami. Kami mengusulkan periode eksklusivitas dikurangi menjadi 1 (satu) bulan setelah konten tayang dan dibatasi khusus pada "Minuman Energi Kompetitor", bukan kategori minuman umum (seperti kopi/air mineral).
2. Kepemilikan Konten (Usage Rights): Kami mengusulkan hak penggunaan iklan berbayar dibatasi selama 3 (tiga) bulan sejak tayang. Penggunaan di luar itu atau secara permanen akan dikenakan biaya lisensi tambahan (usage fee).
3. Ketentuan Pembayaran: Kami mengusulkan batas waktu pembayaran diubah dari NET 90 hari menjadi maksimal NET 30 hari setelah invoice diterima.
4. Denda Keterlambatan: Kami mengusulkan klausul denda dihapus, atau diberikan masa tenggang (grace period) selama 3 hari kerja sebelum denda diberlakukan.`
};

const ContractFinder = ({ apiKey }) => {
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // States for Clause Clarifier
  const [clauseText, setClauseText] = useState('');
  const [clauseResult, setClauseResult] = useState(null);
  const [clauseLoading, setClauseLoading] = useState(false);
  const [copiedClauseProposal, setCopiedClauseProposal] = useState(false);
  const [clauseError, setClauseError] = useState('');

  const handleAnalyze = async (useDemo = false) => {
    setError('');
    
    const textToAnalyze = useDemo ? MOCK_CONTRACT_INPUT : contractText;
    if (useDemo) {
      setContractText(MOCK_CONTRACT_INPUT);
    }

    if (!textToAnalyze.trim()) {
      setError('Harap masukkan teks kontrak terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      if (useDemo || !apiKey) {
        // Mock response if using demo or no API key provided
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult(MOCK_CONTRACT_ANALYSIS);
        if (!apiKey && !useDemo) {
          setError('Catatan: Menampilkan hasil simulasi karena API Key SumoPod belum diatur di Setelan.');
        }
      } else {
        const analysis = await apiAnalyzeContract(textToAnalyze);
        setResult(analysis);
      }
    } catch (err) {
      console.error(err);
      setError(`Gagal menganalisis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySuggestions = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.negotiationSuggestions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeClause = async () => {
    setClauseError('');
    if (!clauseText.trim()) {
      setClauseError('Harap masukkan klausul kontrak terlebih dahulu.');
      return;
    }

    setClauseLoading(true);
    try {
      const res = await apiAnalyzeClause(clauseText);
      setClauseResult(res);
    } catch (err) {
      console.error(err);
      setClauseError(`Gagal menganalisis klausul: ${err.message}`);
    } finally {
      setClauseLoading(false);
    }
  };

  const handleCopyClauseProposal = () => {
    if (!clauseResult) return;
    navigator.clipboard.writeText(clauseResult.counterProposal);
    setCopiedClauseProposal(true);
    setTimeout(() => setCopiedClauseProposal(false), 2000);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'var(--danger-color)';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--success-color)';
      default: return 'var(--success-color)';
    }
  };

  const getExclusivityPillar = (res) => {
    if (!res.hasExclusivity) {
      return { status: 'safe', label: 'Bebas Eksklusivitas', desc: 'Aman: Tidak ada batasan kerja sama dengan brand lain.', color: 'var(--success-color)' };
    }
    const details = (res.exclusivityDetails || '').toLowerCase();
    if (details.includes('12 bulan') || details.includes('1 tahun') || details.includes('luas') || details.includes('semua brand')) {
      return { status: 'danger', label: 'Eksklusivitas Luas', desc: 'Bahaya: Batasan terlalu lama atau cakupan terlalu luas.', color: 'var(--danger-color)' };
    }
    return { status: 'warning', label: 'Eksklusivitas Terbatas', desc: 'Waspada: Batasan kerja sama dengan kompetitor sejenis.', color: 'var(--warning-color)' };
  };

  const getPaymentPillar = (res) => {
    const risk = (res.paymentRisk || '').toLowerCase();
    if (risk === 'high') {
      return { status: 'danger', label: 'Termin Sangat Lambat', desc: 'Bahaya: Pembayaran di atas 60-90 hari (NET 60+).', color: 'var(--danger-color)' };
    }
    if (risk === 'medium') {
      return { status: 'warning', label: 'Termin Sedang', desc: 'Waspada: Pembayaran antara 30-60 hari (NET 45/60).', color: 'var(--warning-color)' };
    }
    return { status: 'safe', label: 'Termin Adil', desc: 'Aman: Pembayaran NET 30 hari atau kurang.', color: 'var(--success-color)' };
  };

  const getIpPillar = (res) => {
    const risk = (res.usageRightsRisk || '').toLowerCase();
    if (risk === 'high') {
      return { status: 'danger', label: 'Pengalihan Hak Cipta', desc: 'Bahaya: Hak cipta dialihkan permanen & tanpa batas.', color: 'var(--danger-color)' };
    }
    if (risk === 'medium') {
      return { status: 'warning', label: 'Lisensi Tanpa Batas', desc: 'Waspada: Lisensi penggunaan iklan tanpa batas waktu.', color: 'var(--warning-color)' };
    }
    return { status: 'safe', label: 'Lisensi Terbatas', desc: 'Aman: Hak cipta tetap milik Anda, lisensi terbatas.', color: 'var(--success-color)' };
  };

  const getPenaltyPillar = (res) => {
    const hasHeavyPenalty = res.otherRisks?.some(r => {
      const title = (r.title || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return (title.includes('denda') || title.includes('keterlambatan') || title.includes('penalty')) && 
             (desc.includes('1%') || desc.includes('berat') || desc.includes('tinggi'));
    });
    const hasAnyPenalty = res.otherRisks?.some(r => {
      const title = (r.title || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      return title.includes('denda') || title.includes('keterlambatan') || title.includes('penalty') || desc.includes('denda');
    });

    if (hasHeavyPenalty) {
      return { status: 'danger', label: 'Denda Keterlambatan Berat', desc: 'Bahaya: Denda harian sangat tinggi (>1% per hari).', color: 'var(--danger-color)' };
    }
    if (hasAnyPenalty) {
      return { status: 'warning', label: 'Ada Denda Keterlambatan', desc: 'Waspada: Denda harian berlaku tanpa masa tenggang.', color: 'var(--warning-color)' };
    }
    return { status: 'safe', label: 'Bebas Denda Berat', desc: 'Aman: Tanpa denda harian atau ada masa tenggang wajar.', color: 'var(--success-color)' };
  };

  const exclPillar = result ? getExclusivityPillar(result) : null;
  const payPillar = result ? getPaymentPillar(result) : null;
  const ipPillar = result ? getIpPillar(result) : null;
  const penPillar = result ? getPenaltyPillar(result) : null;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Input Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Masukkan Teks Kontrak
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
            style={{ minHeight: '300px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'monospace' }}
            placeholder="Salin dan tempel pasal-pasal kontrak kerja sama di sini..."
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
          />

          {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleAnalyze(false)} 
              disabled={loading || !contractText.trim()}
              style={{ flexGrow: 1 }}
            >
              {loading ? <><RefreshCw className="animate-spin" size={14} /> Memindai...</> : 'Pindai Kontrak'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleAnalyze(true)}
              disabled={loading}
            >
              Gunakan Demo Kontrak
            </button>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--danger-color)' }} /> Potensi Risiko Terdeteksi
            </h3>

            {/* Checklist Guard (4 Pillars) Overview */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-lg)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                🛡️ Checklist Audit Kontrak (4 Pilar Utama)
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {/* Pilar 1: Eksklusivitas */}
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)',
                  border: `1px solid ${exclPillar.color}33`,
                  backgroundColor: `${exclPillar.color}05`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {exclPillar.status === 'safe' && <CheckCircle size={18} style={{ color: exclPillar.color }} />}
                    {exclPillar.status === 'warning' && <AlertTriangle size={18} style={{ color: exclPillar.color }} />}
                    {exclPillar.status === 'danger' && <ShieldAlert size={18} style={{ color: exclPillar.color }} />}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Eksklusivitas</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: exclPillar.color }}>{exclPillar.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{exclPillar.desc}</div>
                </div>

                {/* Pilar 2: Termin Pembayaran */}
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)',
                  border: `1px solid ${payPillar.color}33`,
                  backgroundColor: `${payPillar.color}05`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {payPillar.status === 'safe' && <CheckCircle size={18} style={{ color: payPillar.color }} />}
                    {payPillar.status === 'warning' && <AlertTriangle size={18} style={{ color: payPillar.color }} />}
                    {payPillar.status === 'danger' && <ShieldAlert size={18} style={{ color: payPillar.color }} />}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Pembayaran</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: payPillar.color }}>{payPillar.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{payPillar.desc}</div>
                </div>

                {/* Pilar 3: Hak Cipta */}
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)',
                  border: `1px solid ${ipPillar.color}33`,
                  backgroundColor: `${ipPillar.color}05`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ipPillar.status === 'safe' && <CheckCircle size={18} style={{ color: ipPillar.color }} />}
                    {ipPillar.status === 'warning' && <AlertTriangle size={18} style={{ color: ipPillar.color }} />}
                    {ipPillar.status === 'danger' && <ShieldAlert size={18} style={{ color: ipPillar.color }} />}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Hak Cipta (IP)</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: ipPillar.color }}>{ipPillar.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ipPillar.desc}</div>
                </div>

                {/* Pilar 4: Denda */}
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--border-radius-md)',
                  border: `1px solid ${penPillar.color}33`,
                  backgroundColor: `${penPillar.color}05`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {penPillar.status === 'safe' && <CheckCircle size={18} style={{ color: penPillar.color }} />}
                    {penPillar.status === 'warning' && <AlertTriangle size={18} style={{ color: penPillar.color }} />}
                    {penPillar.status === 'danger' && <ShieldAlert size={18} style={{ color: penPillar.color }} />}
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Denda & Sanksi</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: penPillar.color }}>{penPillar.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{penPillar.desc}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Exclusivity Section */}
              <div className="analysis-section" style={{ borderLeftColor: result.hasExclusivity ? 'var(--danger-color)' : 'var(--success-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>🔒 Klausul Eksklusivitas</h4>
                  <span className={`badge ${result.hasExclusivity ? 'badge-danger' : 'badge-success'}`}>
                    {result.hasExclusivity ? 'Ada Eksklusivitas' : 'Bebas Eksklusivitas'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {result.exclusivityDetails || 'Kontrak ini tidak membatasi Anda bekerja dengan brand lain.'}
                </p>
              </div>

              {/* Payment Terms Section */}
              <div className="analysis-section" style={{ borderLeftColor: getRiskColor(result.paymentRisk) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>💸 Termin Pembayaran (Payment Terms)</h4>
                  <span className="badge" style={{ backgroundColor: `${getRiskColor(result.paymentRisk)}1a`, color: getRiskColor(result.paymentRisk) }}>
                    Risiko {result.paymentRisk}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {result.paymentTerms}
                </p>
              </div>

              {/* Usage Rights Section */}
              <div className="analysis-section" style={{ borderLeftColor: getRiskColor(result.usageRightsRisk) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600' }}>📂 Hak Penggunaan & Hak Cipta Konten</h4>
                  <span className="badge" style={{ backgroundColor: `${getRiskColor(result.usageRightsRisk)}1a`, color: getRiskColor(result.usageRightsRisk) }}>
                    Risiko {result.usageRightsRisk}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  {result.usageRights}
                </p>
              </div>

              {/* Other Risks */}
              {result.otherRisks && result.otherRisks.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--danger-color)', marginBottom: '8px' }}>⚠️ Risiko Tambahan Lainnya:</h4>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.otherRisks.map((risk, idx) => (
                      <li key={idx} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{risk.title}:</strong> {risk.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negotiation Draft Box */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '600' }}>✍️ Rekomendasi Balasan Negosiasi:</h4>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleCopySuggestions}>
                    {copied ? <><Check size={12} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={12} /> Salin Saran Balasan</>}
                  </button>
                </div>
                <textarea 
                  className="form-control" 
                  style={{ minHeight: '180px', fontSize: '12px', fontFamily: 'sans-serif', lineHeight: '1.4', backgroundColor: 'var(--bg-tertiary)' }}
                  value={result.negotiationSuggestions}
                  readOnly
                />
              </div>

            </div>
          </div>
        )}

        {/* AI Clause Clarifier Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> AI Clause Clarifier (Pembedah Klausul Spesifik)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Tempelkan satu paragraf atau pasal kontrak yang membingungkan atau mencurigakan di bawah ini. AI kami akan membedah risiko hukumnya secara mendalam dan memberikan rekomendasi revisi tandingan yang adil.
          </p>

          <textarea 
            className="form-control" 
            style={{ minHeight: '100px', fontSize: '13px', lineHeight: '1.5', fontFamily: 'monospace', marginBottom: '12px' }}
            placeholder="Contoh: 'Pihak Kedua dilarang mempromosikan produk dari brand lain sejenis maupun tidak sejenis selama 6 bulan...'"
            value={clauseText}
            onChange={(e) => setClauseText(e.target.value)}
          />

          {clauseError && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginBottom: '12px' }}>{clauseError}</p>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyzeClause} 
              disabled={clauseLoading || !clauseText.trim()}
              style={{ flexGrow: 1 }}
            >
              {clauseLoading ? <><RefreshCw className="animate-spin" size={14} /> Menganalisis...</> : 'Mulai Bedah Klausul'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setClauseText('Creator hereby assigns to Sponsor all intellectual property rights, copyright, and ownership of the Video in perpetuity, throughout the universe.');
                setClauseError('');
              }}
              disabled={clauseLoading}
            >
              Gunakan Contoh Klausul
            </button>
          </div>

          {clauseResult && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              borderRadius: 'var(--border-radius-md)', 
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🔍 Hasil Bedah Klausul:
                </span>
                <span className="badge" style={{ 
                  backgroundColor: `${getRiskColor(clauseResult.riskLevel)}1a`, 
                  color: getRiskColor(clauseResult.riskLevel),
                  fontWeight: '600'
                }}>
                  Risiko {clauseResult.riskLevel}
                </span>
              </div>

              <div>
                <h5 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: 'var(--text-primary)' }}>💡 Arti Klausul (Bahasa Awam):</h5>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {clauseResult.explanation}
                </p>
              </div>

              {clauseResult.riskReason && (
                <div>
                  <h5 style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: 'var(--danger-color)' }}>⚠️ Mengapa Berisiko?</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {clauseResult.riskReason}
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-color)' }}>✍️ Rekomendasi Klausul Tandingan:</h5>
                  <button className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleCopyClauseProposal}>
                    {copiedClauseProposal ? <><Check size={10} style={{ color: 'var(--success-color)' }} /> Tersalin</> : <><Copy size={10} /> Salin</>}
                  </button>
                </div>
                <textarea 
                  className="form-control" 
                  style={{ minHeight: '80px', fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.4', backgroundColor: 'var(--bg-tertiary)' }}
                  value={clauseResult.counterProposal}
                  readOnly
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractFinder;
