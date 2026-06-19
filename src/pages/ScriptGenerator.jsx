import React, { useState } from 'react';
import { Sparkles, Copy, Check, Plus, RefreshCw, AlertTriangle, FileText, HelpCircle } from 'lucide-react';
import { apiGenerateScript } from '../utils/api';
import PerformancePredictor from '../components/PerformancePredictor';

const MOCK_SCRIPT_RESPONSE = {
  hooks: [
    "Stop buang-buang uang buat skincare yang ga cocok! Ini rahasianya...",
    "Kalian tahu ga kenapa cushion ini bisa sold out dalam 5 menit? Gini alasannya...",
    "Review jujur produk terheboh tahun ini. Beneran bagus atau cuma marketing?"
  ],
  script: `[Visual] Kamera closeup menyorot wajah lelah, lalu transisi memegang Cushion dari brand.
[Audio/Voiceover] Capek banget kan kalau makeup luntur terus setelah 2 jam? 

[Visual] Aplikasikan cushion ke setengah bagian wajah secara perlahan. Tunjukkan perbedaannya secara kontras.
[Audio/Voiceover] Nih, kalian bisa lihat sendiri perbedaannya. Sisi kanan langsung flawless, pori-pori tersamarkan, dan hasilnya super skin-like natural banget. Ga ada kesan dempul sama sekali!

[Visual] Tunjukkan struk belanja Watsons dengan diskon dilingkari merah.
[Audio/Voiceover] Kabar baiknya, cushion premium ini lagi diskon gede-gedean up to 50% khusus di Watsons Beauty Festival minggu ini!

[Visual] Kamera menghadap kreator memegang produk sambil tersenyum.
[Audio/Voiceover] Tunggu apa lagi? Buruan amankan cushion kalian di store Watsons terdekat atau belanja lewat Watsons Online sekarang sebelum kehabisan!`
};

const ScriptGenerator = ({ apiKey, addPipelineTask, creatorProfile }) => {
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [concept, setConcept] = useState('');
  const [duration, setDuration] = useState('30s');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedHookIdx, setCopiedHookIdx] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (useDemo = false) => {
    setError('');
    setSaved(false);
    setLoading(true);

    const targetBrand = useDemo ? 'Watsons Indonesia' : brand;
    const targetProduct = useDemo ? 'Cushion Flawless' : product;
    const targetConcept = useDemo ? 'Review instan cushion diskon up to 50% di Beauty Festival' : concept;
    const targetDuration = useDemo ? '30s' : duration;

    if (useDemo) {
      setBrand(targetBrand);
      setProduct(targetProduct);
      setConcept(targetConcept);
      setDuration(targetDuration);
    }

    if (!targetBrand || !targetProduct) {
      setError('Harap isi Nama Brand dan Nama Produk.');
      setLoading(false);
      return;
    }

    try {
      if (useDemo || !apiKey) {
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        setResult(MOCK_SCRIPT_RESPONSE);
        if (!apiKey && !useDemo) {
          setError('Catatan: Menampilkan hasil simulasi karena API Key SumoPod belum diatur di Setelan.');
        }
      } else {
        const scriptData = await apiGenerateScript(targetBrand, targetProduct, targetConcept, targetDuration);
        setResult(scriptData);
      }
    } catch (err) {
      console.error(err);
      setError(`Gagal membuat skrip: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHook = (hookText, index) => {
    navigator.clipboard.writeText(hookText);
    setCopiedHookIdx(index);
    setTimeout(() => setCopiedHookIdx(null), 2000);
  };

  const handleCopyScript = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleAddToPipeline = () => {
    if (!result) return;
    
    addPipelineTask({
      id: `task-${Date.now()}`,
      title: `Script: ${brand} - ${product}`,
      brand: brand,
      platform: 'TikTok', // Default
      status: 'idea',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // + 7 Days
      deliverables: `1x Video pendek (${duration})`,
      notes: `DRAFT NASKAH:\n\nHooks:\n- ${result.hooks.join('\n- ')}\n\nNaskah:\n${result.script}`
    });

    setSaved(true);
    alert('Naskah berhasil disimpan ke Alur Kerja Konten (status: Ideasi)!');
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Form Card */}
        <div className="card">
          <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} className="text-accent" style={{ color: 'var(--accent-color)' }} /> Parameter Naskah
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
              <span>API Key belum diatur di Setelan. Anda tetap bisa mencoba menggunakan data simulasi offline.</span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Nama Brand / Klien *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Misal: Wardah Beauty"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Nama Produk / Jasa *</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Misal: Cushion Flawless"
                value={product}
                onChange={e => setProduct(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Durasi Video</label>
              <select 
                className="form-control"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              >
                <option value="15s">15 Detik (Sangat Padat)</option>
                <option value="30s">30 Detik (Standar Reels/TikTok)</option>
                <option value="60s">60 Detik (Pembahasan Detail)</option>
                <option value="90s">90 Detik / Lebih</option>
              </select>
            </div>
            <div className="form-group">
              <label>Konsep / Topik Utama Konten</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="Misal: Bahas ketahanan air & diskon toko"
                value={concept}
                onChange={e => setConcept(e.target.value)}
              />
            </div>
          </div>

          {error && <p style={{ color: 'var(--danger-color)', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => handleGenerate(false)}
              disabled={loading || !brand || !product}
              style={{ flexGrow: 1 }}
            >
              {loading ? <><RefreshCw className="animate-spin" size={14} /> Menulis Skrip...</> : 'Mulai Tulis Skrip'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleGenerate(true)}
              disabled={loading}
            >
              Gunakan Demo
            </button>
          </div>
        </div>

        {/* Results Card */}
        {(result || loading) && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', minHeight: loading ? '300px' : 'auto' }}>
            {loading && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: 'var(--border-radius-xl)', opacity: 0.95 }}>
                <RefreshCw size={40} className="spin-animation" style={{ color: 'var(--accent-color)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px' }}>Menulis Skrip...</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '13px' }}>Mohon tunggu sebentar, AI sedang memproses.</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px' }}>Ide Pembuka & Naskah</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleCopyScript}
                >
                  {copiedScript ? <><Check size={12} style={{ color: 'var(--success-color)' }} /> Tersalin</> : 'Salin Naskah'}
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={handleAddToPipeline}
                  disabled={saved}
                >
                  {saved ? 'Tersimpan' : 'Simpan ke Pipeline'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Hooks section */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-color)', marginBottom: '8px' }}>💥 3 Alternatif Hook (3 Detik Pertama):</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.hooks.map((hook, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '10px 12px', 
                        borderRadius: 'var(--border-radius-md)', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <span style={{ fontStyle: 'italic' }}>"{hook}"</span>
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        onClick={() => handleCopyHook(hook, idx)}
                      >
                        {copiedHookIdx === idx ? <Check size={12} style={{ color: 'var(--success-color)' }} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>🎬 Draf Naskah Narasi:</h4>
                <textarea 
                  className="form-control"
                  style={{ 
                    minHeight: '220px', 
                    fontSize: '12px', 
                    fontFamily: 'sans-serif', 
                    lineHeight: '1.5',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}
                  value={result.script}
                  readOnly
                />
              </div>

              {/* Performance Predictor Widget */}
              <PerformancePredictor 
                hook={result.hooks && result.hooks[0] ? result.hooks[0] : ''}
                script={result.script}
                duration={duration}
                creatorProfile={creatorProfile}
              />

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;
