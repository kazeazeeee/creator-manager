import React, { useState, useEffect } from 'react';
import { Sparkles, Eye, Heart, MessageSquare, RefreshCw, AlertTriangle, TrendingUp, Info, HelpCircle } from 'lucide-react';
import { apiPredictPerformance } from '../utils/api';

const PerformancePredictor = ({ hook, script, duration, creatorProfile }) => {
  const [platform, setPlatform] = useState('TikTok');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const parseCount = (str) => {
    if (!str) return 10000;
    let cleaned = str.trim().toUpperCase().replace(/,/g, '.');
    let multiplier = 1;
    if (cleaned.includes('K')) {
      multiplier = 1000;
      cleaned = cleaned.replace('K', '');
    } else if (cleaned.includes('M')) {
      multiplier = 1000000;
      cleaned = cleaned.replace('M', '');
    }
    return Math.round(parseFloat(cleaned) * multiplier) || 10000;
  };

  const fetchPrediction = async (targetPlatform) => {
    if (!hook && !script) {
      setError('Masukkan hook atau naskah terlebih dahulu untuk memprediksi performa.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiPredictPerformance(
        targetPlatform || platform,
        hook,
        script,
        duration || '30s',
        creatorProfile
      );
      setPrediction(result);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat prediksi performa dari server.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch prediction when component mounts or when platform changes
  useEffect(() => {
    if (hook || script) {
      fetchPrediction(platform);
    }
  }, [platform, hook]);

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Viral':
        return 'linear-gradient(135deg, #a855f7, #ec4899)'; // Violet-pink
      case 'Strong':
        return '#22c55e'; // Green
      case 'Average':
        return '#eab308'; // Yellow
      case 'Weak':
        return '#ef4444'; // Red
      default:
        return '#6b7280';
    }
  };

  const getViralityColor = (score) => {
    if (score >= 80) return 'var(--accent-color)';
    if (score >= 60) return 'var(--success-color)';
    if (score >= 40) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  const formatNum = (num) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString('id-ID');
  };

  return (
    <div style={{
      marginTop: '20px',
      padding: '20px',
      borderRadius: 'var(--border-radius-lg)',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      color: 'var(--text-primary)'
    }}>
      {/* Title / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
          <Sparkles size={16} style={{ color: 'var(--accent-color)' }} /> Prediktor Performa AI
        </h4>
        
        {/* Platform Selector Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '16px', padding: '2px', border: '1px solid var(--border-color)' }}>
          {['TikTok', 'Instagram', 'YouTube'].map(p => (
            <button
              key={p}
              onClick={() => handlePlatformChange(p)}
              disabled={loading}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: '500',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: platform === p ? 'var(--accent-color)' : 'transparent',
                color: platform === p ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {p === 'Instagram' ? 'Instagram' : p === 'YouTube' ? 'YouTube' : p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '11.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={13} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
          <RefreshCw size={24} className="spin-animation" style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Menganalisis skrip & menghitung algoritma jangkauan...</span>
        </div>
      ) : prediction ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top Score Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            
            {/* Virality Progress Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Skor Viralitas</span>
              <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="70" height="70" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="3.2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getViralityColor(prediction.viralityScore)}
                    strokeWidth="3.2"
                    strokeDasharray={`${prediction.viralityScore}, 100`}
                  />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{prediction.viralityScore}%</span>
                </div>
              </div>
            </div>

            {/* Hook rating & general ER info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kekuatan Hook:</span>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '10.5px',
                  fontWeight: 'bold',
                  background: getRatingColor(prediction.hookRating),
                  color: 'white'
                }}>
                  {prediction.hookRating}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                <TrendingUp size={13} style={{ color: 'var(--success-color)' }} />
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  Estimasi ER: <strong style={{ color: 'var(--text-primary)' }}>{prediction.engagementRate}%</strong>
                </span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                Dihitung dari basis pengikut {platform} Anda (~{formatNum(parseCount(platform === 'TikTok' ? creatorProfile?.tiktokFollowers : platform === 'YouTube' ? creatorProfile?.youtubeFollowers : creatorProfile?.instagramFollowers))}).
              </span>
            </div>

          </div>

          {/* Metrics Estimation Grid */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Rentang Estimasi Hasil Postingan:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Eye size={14} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Tayangan</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatNum(prediction.viewsRange?.min)} - {formatNum(prediction.viewsRange?.max)}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <Heart size={14} style={{ color: 'var(--danger-color)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Suka</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatNum(prediction.likesRange?.min)} - {formatNum(prediction.likesRange?.max)}
                </span>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={14} style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Komentar</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatNum(prediction.commentsRange?.min)} - {formatNum(prediction.commentsRange?.max)}
                </span>
              </div>
            </div>
          </div>

          {/* Written Analysis */}
          {prediction.analysis && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${getViralityColor(prediction.viralityScore)}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Info size={12} /> Analisis Performa:
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                {prediction.analysis}
              </p>
            </div>
          )}

          {/* Recommendations List */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                💡 Rekomendasi Peningkatan AI:
              </span>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => fetchPrediction(platform)}
            disabled={loading}
            style={{
              padding: '6px',
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '10.5px',
              fontWeight: '500',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              alignSelf: 'flex-end',
              marginTop: '4px',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={10} /> Hitung Ulang Prediksi
          </button>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
          <HelpCircle size={20} />
          <span style={{ fontSize: '12px' }}>Belum ada analisis performa. Tulis/generate naskah terlebih dahulu untuk memicu prediksi AI.</span>
        </div>
      )}
    </div>
  );
};

export default PerformancePredictor;
