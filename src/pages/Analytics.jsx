import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageSquare, Eye, Save, DollarSign, RefreshCw, Sparkles, Plus, Trash2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { apiGetTasks, apiUpdateTask, apiSyncRecentPosts, apiGetAnalytics, apiSaveAnalytics, apiSaveProfile } from '../utils/api';

const MOCK_ANALYTICS_TREND = [
  { brand: 'Wardah Beauty', title: 'Cushion Review', views: 125000, earnings: 4500000 },
  { brand: 'Gojek Indonesia', title: 'Voucher Hemat', views: 68000, earnings: 3000000 },
  { brand: 'Tokopedia', title: 'Waktu Indonesia Belanja', views: 210000, earnings: 12000000 },
  { brand: 'Kopi Kenangan', title: 'Menu Baru Espresso', views: 45000, earnings: 2500000 },
  { brand: 'Shopee ID', title: 'Gratis Ongkir Super', views: 185000, earnings: 8500000 }
];

// Seed initial analytics metrics mapping task-2
const seedAnalyticsData = {
  'task-2': {
    views: 125000,
    likes: 12400,
    comments: 480,
    shares: 1200,
    clicks: 3400,
    earnings: 4500000
  }
};

const Analytics = ({ pipelineTasks = [], setPipelineTasks, profile = {}, setProfile }) => {
  const [syncingPosts, setSyncingPosts] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState('Semua');

  // Manual post management states and handlers
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: 'TikTok',
    title: '',
    url: '',
    uploadDate: new Date().toISOString().split('T')[0],
    views: 0,
    likes: 0,
    comments: 0,
    thumbnail: ''
  });

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus postingan ini dari media kit?")) return;
    const updatedPosts = (profile.recentPosts || []).filter(p => p.id !== postId);
    const updatedProfile = { ...profile, recentPosts: updatedPosts };
    setProfile(updatedProfile);
    try {
      await apiSaveProfile(updatedProfile);
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Gagal menyimpan perubahan ke server.");
    }
  };

  const handleAddPostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) {
      alert("Judul konten wajib diisi!");
      return;
    }
    const createdPost = {
      ...newPost,
      id: `${newPost.platform.toLowerCase()}-manual-${Date.now()}`,
      views: parseInt(newPost.views) || 0,
      likes: parseInt(newPost.likes) || 0,
      comments: parseInt(newPost.comments) || 0
    };
    const updatedPosts = [createdPost, ...(profile.recentPosts || [])];
    const updatedProfile = { ...profile, recentPosts: updatedPosts };
    setProfile(updatedProfile);
    setShowAddPostModal(false);
    // reset form
    setNewPost({
      platform: 'TikTok',
      title: '',
      url: '',
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0,
      comments: 0,
      thumbnail: ''
    });
    try {
      await apiSaveProfile(updatedProfile);
    } catch (err) {
      console.error("Failed to save new post:", err);
      alert("Gagal menyimpan postingan baru ke server.");
    }
  };

  // SVG Chart States
  const publishedTasks = pipelineTasks.filter(t => t.status === 'published');
  const [showDemoChart, setShowDemoChart] = useState(publishedTasks.length === 0);
  const [chartMetric, setChartMetric] = useState('views'); // 'views' or 'earnings'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Sync demo mode if published tasks list changes
  useEffect(() => {
    if (publishedTasks.length > 0) {
      setShowDemoChart(false);
    } else {
      setShowDemoChart(true);
    }
  }, [pipelineTasks]);

  const handleSyncPosts = async () => {
    setSyncingPosts(true);
    setSyncError(null);
    try {
      const res = await apiSyncRecentPosts();
      if (res && res.success) {
        setProfile(prev => ({
          ...prev,
          recentPosts: res.recentPosts,
          postsLastSynced: res.postsLastSynced
        }));
      } else {
        throw new Error("Gagal menyinkronkan feed postingan.");
      }
    } catch (err) {
      console.error(err);
      setSyncError(err.message || "Gagal menyinkronkan data.");
    } finally {
      setSyncingPosts(false);
    }
  };

  const [analyticsMap, setAnalyticsMap] = useState(() => {
    const stored = localStorage.getItem('creator_analytics_metrics');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { return seedAnalyticsData; }
    }
    return seedAnalyticsData;
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [metricsForm, setMetricsForm] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    earnings: 0
  });

  // Sync analytics from backend database on mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await apiGetAnalytics();
        if (data && Object.keys(data).length > 0) {
          setAnalyticsMap(data);
        }
      } catch (err) {
        console.error('Failed to load analytics from backend:', err);
      }
    };
    loadAnalytics();
  }, []);

  useEffect(() => {
    localStorage.setItem('creator_analytics_metrics', JSON.stringify(analyticsMap));
  }, [analyticsMap]);

  const startEdit = (task) => {
    const current = analyticsMap[task.id] || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      earnings: task.brand === 'Wardah Beauty' ? 7500000 : 
                task.brand === 'Tokopedia' ? 12000000 : 
                task.brand === 'Gojek Indonesia' ? 4500000 : 3000000
    };
    setEditingTaskId(task.id);
    setMetricsForm(current);
  };

  const handleSaveMetrics = async (taskId) => {
    const newMap = {
      ...analyticsMap,
      [taskId]: metricsForm
    };
    setAnalyticsMap(newMap);
    setEditingTaskId(null);

    // Save to backend database
    try {
      await apiSaveAnalytics(newMap);
    } catch (err) {
      console.error('Failed to save analytics to backend:', err);
    }
  };

  // Calculations for Overview cards
  const totalViews = Object.values(analyticsMap).reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = Object.values(analyticsMap).reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalEngagements = Object.values(analyticsMap).reduce((sum, item) => sum + (item.likes || 0) + (item.comments || 0) + (item.shares || 0), 0);
  
  const avgEngagementRate = totalViews > 0 
    ? ((totalEngagements / totalViews) * 100).toFixed(2) 
    : '0.00';

  const totalEarningsVal = Object.values(analyticsMap).reduce((sum, item) => sum + (item.earnings || 0), 0);

  const calculateCampaignMetrics = (taskId, rateValue) => {
    const metrics = analyticsMap[taskId];
    if (!metrics || !metrics.views) return { er: '0.00', cpv: '0', cpe: '0' };

    const engagements = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
    const er = ((engagements / metrics.views) * 100).toFixed(2);
    
    const cpv = (metrics.earnings / metrics.views).toFixed(0);
    const cpe = engagements > 0 ? (metrics.earnings / engagements).toFixed(0) : '0';

    return { er, cpv, cpe };
  };

  // Map Data for Chart
  const chartData = showDemoChart 
    ? MOCK_ANALYTICS_TREND 
    : publishedTasks.map(t => {
        const metrics = analyticsMap[t.id] || { views: 0, earnings: 0 };
        return {
          brand: t.brand,
          title: t.title,
          views: metrics.views,
          earnings: metrics.earnings
        };
      });

  const maxVal = Math.max(...chartData.map(d => chartMetric === 'views' ? d.views : d.earnings), 1);

  const formatYLabel = (val) => {
    if (chartMetric === 'views') {
      if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
      return val;
    } else {
      if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'K';
      return 'Rp ' + val;
    }
  };

  const points = chartData.map((d, idx) => {
    const val = chartMetric === 'views' ? d.views : d.earnings;
    const x = chartData.length === 1 
      ? 70 + 350 
      : 70 + (idx / (chartData.length - 1)) * 700; // 700px width area
    const y = 20 + 175 - (val / maxVal) * 175; // 175px height area (Y: 20 to 195)
    return { x, y, val, label: d.brand };
  });

  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
    areaPath = `M ${points[0].x},195 ` + points.map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${points[points.length - 1].x},195 Z`;
  }

  return (
    <div>
      <div className="content-header">
        <div className="content-title">
          <h1>Kinerja Konten & Analitik</h1>
          <p>Masukkan statistik postingan Anda dan ukur efisiensi performa kampanye (CPV, CPE, Engagement Rate) untuk brand.</p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="dashboard-grid">
        <div className="card stats-card">
          <div className="stats-header">
            <span>Total Tayangan (Views)</span>
            <Eye size={16} style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="stats-value">{totalViews.toLocaleString('id-ID')}</div>
          <div className="stats-change up" style={{ color: 'var(--accent-color)' }}>
            <span>Akumulasi semua kampanye</span>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-header">
            <span>Rata-rata Engagement Rate</span>
            <TrendingUp size={16} style={{ color: 'var(--success-color)' }} />
          </div>
          <div className="stats-value">{avgEngagementRate}%</div>
          <div className="stats-change up" style={{ color: 'var(--success-color)' }}>
            <span>Rasio interaksi per view</span>
          </div>
        </div>

        <div className="card stats-card">
          <div className="stats-header">
            <span>Efektivitas Biaya (CPV)</span>
            <DollarSign size={16} style={{ color: 'var(--warning-color)' }} />
          </div>
          <div className="stats-value">
            {totalViews > 0 ? `Rp ${(totalEarningsVal / totalViews).toFixed(0)}` : 'Rp 0'}
          </div>
          <div className="stats-change up" style={{ color: 'var(--warning-color)' }}>
            <span>Rata-rata biaya per 1 tayangan</span>
          </div>
        </div>
      </div>

      {/* Campaign Trend Chart Card */}
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-color)' }} /> Tren Kinerja Kampanye
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Visualisasi tren pertumbuhan tayangan dan pendapatan dari postingan Anda.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Metric Selector Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button
                className="btn"
                style={{
                  padding: '4px 12px',
                  fontSize: '11.5px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: chartMetric === 'views' ? 'var(--accent-light)' : 'transparent',
                  color: chartMetric === 'views' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onClick={() => setChartMetric('views')}
              >
                Tayangan (Views)
              </button>
              <button
                className="btn"
                style={{
                  padding: '4px 12px',
                  fontSize: '11.5px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: chartMetric === 'earnings' ? 'var(--accent-light)' : 'transparent',
                  color: chartMetric === 'earnings' ? 'var(--accent-color)' : 'var(--text-secondary)',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onClick={() => setChartMetric('earnings')}
              >
                Pendapatan
              </button>
            </div>

            {/* Demo Mode Toggle */}
            {publishedTasks.length > 0 && (
              <button
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setShowDemoChart(!showDemoChart)}
              >
                <Sparkles size={12} />
                {showDemoChart ? 'Lihat Data Riil' : 'Lihat Data Demo'}
              </button>
            )}
          </div>
        </div>

        {/* Recharts Rendering */}
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', padding: '20px 10px 10px 0', border: '1px solid var(--border-color)', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="brand" 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val.length > 12 ? val.substring(0, 10) + '..' : val}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatYLabel(val)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: 'var(--accent-color)', fontWeight: 'bold' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}
                  formatter={(value) => [chartMetric === 'views' ? value.toLocaleString('id-ID') : formatCurrency(value), chartMetric === 'views' ? 'Tayangan' : 'Pendapatan']}
                />
                <Area 
                  type="monotone" 
                  dataKey={chartMetric} 
                  stroke="var(--accent-color)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMetric)" 
                  activeDot={{ r: 6, fill: 'var(--accent-color)', stroke: 'var(--bg-secondary)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
            Belum ada data visualisasi tersedia.
          </div>
        )}
      </div>

      {/* Campaign List Card */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-color)' }} /> Statistik Kampanye Terpublikasi
        </h3>

        <div className="invoice-table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Kampanye / Konten</th>
                <th>Brand</th>
                <th>Mata Uang / Rate</th>
                <th>Views (Tayangan)</th>
                <th>Engagement Rate</th>
                <th>CPV (Cost Per View)</th>
                <th>CPE (Cost Per Engagement)</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {publishedTasks.map(task => {
                const metrics = analyticsMap[task.id];
                const calculated = calculateCampaignMetrics(task.id);
                const isEditing = editingTaskId === task.id;

                return (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{task.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{task.platform} | {task.deliverables}</div>
                    </td>
                    <td>{task.brand}</td>
                    
                    {isEditing ? (
                      <td colSpan="5" style={{ padding: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', alignItems: 'center' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Pendapatan"
                              value={metricsForm.earnings} 
                              onChange={e => setMetricsForm({ ...metricsForm, earnings: parseInt(e.target.value) || 0 })}
                              title="Pendapatan/Harga"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Views"
                              value={metricsForm.views} 
                              onChange={e => setMetricsForm({ ...metricsForm, views: parseInt(e.target.value) || 0 })}
                              title="Views"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Likes"
                              value={metricsForm.likes} 
                              onChange={e => setMetricsForm({ ...metricsForm, likes: parseInt(e.target.value) || 0 })}
                              title="Likes"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Comments"
                              value={metricsForm.comments} 
                              onChange={e => setMetricsForm({ ...metricsForm, comments: parseInt(e.target.value) || 0 })}
                              title="Comments"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Shares"
                              value={metricsForm.shares} 
                              onChange={e => setMetricsForm({ ...metricsForm, shares: parseInt(e.target.value) || 0 })}
                              title="Shares"
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder="Clicks"
                              value={metricsForm.clicks} 
                              onChange={e => setMetricsForm({ ...metricsForm, clicks: parseInt(e.target.value) || 0 })}
                              title="Clicks"
                            />
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td style={{ fontWeight: '500' }}>
                          {metrics ? formatCurrency(metrics.earnings) : 'Belum diisi'}
                        </td>
                        <td>{metrics ? metrics.views.toLocaleString('id-ID') : '0'}</td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-color)' }}>
                          {calculated.er}%
                        </td>
                        <td>Rp {calculated.cpv}</td>
                        <td>Rp {calculated.cpe}</td>
                      </>
                    )}

                    <td style={{ textAlign: 'right' }}>
                      {isEditing ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleSaveMetrics(task.id)}
                        >
                          <Save size={12} /> Simpan
                        </button>
                      ) : (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                          onClick={() => startEdit(task)}
                        >
                          Log Metrik
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {publishedTasks.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Belum ada konten dengan status "Tayang (Published)" di Alur Konten. Selesaikan proyek di Kanban untuk melihat analitiknya di sini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Posts Feed Card */}
      <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-primary)' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-color)' }} /> Feed Konten Terakhir & Analitik Media Kit
            </h3>
            {profile.postsLastSynced ? (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Feed diperbarui: {new Date(profile.postsLastSynced).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Belum disinkronkan</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12.5px', border: '1px solid var(--border-color)' }}
              onClick={() => setShowAddPostModal(true)}
            >
              <Plus size={13} style={{ color: 'var(--accent-color)' }} />
              Tambah Konten Manual
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12.5px', border: '1px solid var(--border-color)' }}
              onClick={handleSyncPosts}
              disabled={syncingPosts}
            >
              <RefreshCw size={13} className={syncingPosts ? 'spin-animation' : ''} />
              {syncingPosts ? 'Menyinkronkan...' : 'Perbarui Feed'}
            </button>
          </div>
        </div>

        {syncError && (
          <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>
            {syncError}
          </div>
        )}

        {/* Platform Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          {['Semua', 'Instagram', 'TikTok', 'YouTube'].map(platform => (
            <button
              key={platform}
              onClick={() => setActivePlatformFilter(platform)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: activePlatformFilter === platform ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: activePlatformFilter === platform ? 'white' : 'var(--text-primary)',
                fontSize: '12.5px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {platform}
            </button>
          ))}
        </div>

        {/* Posts List Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {(profile.recentPosts || [])
            .filter(post => activePlatformFilter === 'Semua' || post.platform === activePlatformFilter)
            .map((post, idx) => {
              const platformColors = {
                Instagram: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                TikTok: '#000000',
                YouTube: '#FF0000'
              };

              const viewsFormatted = post.views >= 1000000 
                ? (post.views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' 
                : post.views >= 1000 
                  ? (post.views / 1000).toFixed(1).replace(/\.0$/, '') + 'K' 
                  : post.views;

              const likesFormatted = post.likes >= 1000000 
                ? (post.likes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' 
                : post.likes >= 1000 
                  ? (post.likes / 1000).toFixed(1).replace(/\.0$/, '') + 'K' 
                  : post.likes;

              const commentsFormatted = post.comments >= 1000000 
                ? (post.comments / 1000000).toFixed(1).replace(/\.0$/, '') + 'M' 
                : post.comments >= 1000 
                  ? (post.comments / 1000).toFixed(1).replace(/\.0$/, '') + 'K' 
                  : (post.comments !== undefined ? post.comments : 0);

              return (
                <div 
                  key={post.id || idx} 
                  style={{ 
                    borderRadius: 'var(--border-radius-md)', 
                    border: '1px solid var(--border-color)', 
                    background: 'var(--bg-tertiary)', 
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.2s'
                  }}
                >
                  {/* Thumbnail / Header */}
                  <div style={{ position: 'relative', height: '150px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    {post.thumbnail ? (
                      <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        No Image
                      </div>
                    )}
                    {/* Platform Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      background: platformColors[post.platform] || '#333', 
                      color: 'white', 
                      fontSize: '10px', 
                      fontWeight: 'bold', 
                      padding: '3px 8px', 
                      borderRadius: '12px' 
                    }}>
                      {post.platform}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 
                        style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', height: '38px' }}
                        title={post.title}
                      >
                        {post.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Diposting: {post.uploadDate}</span>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`${post.views || 0} tayangan`}>
                        <Eye size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{viewsFormatted}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Views</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`${post.likes || 0} suka`}>
                        <Heart size={13} style={{ color: 'var(--danger-color)', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{likesFormatted}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Suka</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`${post.comments || 0} komentar`}>
                        <MessageSquare size={13} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{commentsFormatted}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Komentar</span>
                      </div>
                    </div>

                     {/* Actions */}
                     <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                       <a 
                         href={post.url} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="btn btn-secondary" 
                         style={{ padding: '6px 12px', fontSize: '12px', flexGrow: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border-color)' }}
                       >
                         Buka Postingan &rarr;
                       </a>
                       <button
                         onClick={() => handleDeletePost(post.id)}
                         className="btn btn-secondary"
                         style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', color: 'var(--danger-color)', cursor: 'pointer' }}
                         title="Hapus Postingan"
                       >
                         <Trash2 size={13} />
                       </button>
                     </div>
                   </div>
                 </div>
               );
             })}
 
           {(!profile.recentPosts || profile.recentPosts.length === 0) && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
               Belum ada postingan disinkronkan. Tekan tombol "Perbarui Feed" atau "Tambah Konten Manual" untuk menyelaraskan konten terbaru Anda.
             </div>
           )}
         </div>
       </div>
 
       {/* Manual Post Modal */}
       {showAddPostModal && (
         <div style={{
           position: 'fixed',
           top: 0, left: 0, right: 0, bottom: 0,
           backgroundColor: 'rgba(0,0,0,0.75)',
           display: 'flex', justifyContent: 'center', alignItems: 'center',
           zIndex: 2000, padding: '20px'
         }}>
           <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', padding: '24px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', marginTop: 0 }}>
               <Plus size={18} style={{ color: 'var(--accent-color)' }} /> Tambah Konten Manual
             </h2>
             <form onSubmit={handleAddPostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
               <div className="form-group">
                 <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Platform *</label>
                 <select 
                   className="form-control"
                   value={newPost.platform}
                   onChange={e => setNewPost({ ...newPost, platform: e.target.value })}
                   style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                 >
                   <option value="TikTok">TikTok</option>
                   <option value="Instagram">Instagram</option>
                   <option value="YouTube">YouTube</option>
                 </select>
               </div>
 
               <div className="form-group">
                 <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Judul Konten *</label>
                 <input 
                   type="text"
                   required
                   placeholder="Masukkan judul konten terbaru..."
                   className="form-control"
                   value={newPost.title}
                   onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                   style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                 />
               </div>
 
               <div className="form-group">
                 <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Tautan/URL Video</label>
                 <input 
                   type="url"
                   placeholder="https://www.tiktok.com/@user/video/..."
                   className="form-control"
                   value={newPost.url}
                   onChange={e => setNewPost({ ...newPost, url: e.target.value })}
                   style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                 />
               </div>
 
               <div className="form-group">
                 <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>URL Gambar Thumbnail (Opsional)</label>
                 <input 
                   type="text"
                   placeholder="https://..."
                   className="form-control"
                   value={newPost.thumbnail}
                   onChange={e => setNewPost({ ...newPost, thumbnail: e.target.value })}
                   style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                 />
               </div>
 
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <div className="form-group">
                   <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Tanggal Upload</label>
                   <input 
                     type="date"
                     className="form-control"
                     value={newPost.uploadDate}
                     onChange={e => setNewPost({ ...newPost, uploadDate: e.target.value })}
                     style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                   />
                 </div>
                 <div className="form-group">
                   <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Views/Tayangan</label>
                   <input 
                     type="number"
                     min="0"
                     className="form-control"
                     value={newPost.views}
                     onChange={e => setNewPost({ ...newPost, views: e.target.value })}
                     style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                   />
                 </div>
               </div>
 
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                 <div className="form-group">
                   <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Likes/Suka</label>
                   <input 
                     type="number"
                     min="0"
                     className="form-control"
                     value={newPost.likes}
                     onChange={e => setNewPost({ ...newPost, likes: e.target.value })}
                     style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                   />
                 </div>
                 <div className="form-group">
                   <label style={{ fontSize: '12.5px', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Komentar</label>
                   <input 
                     type="number"
                     min="0"
                     className="form-control"
                     value={newPost.comments}
                     onChange={e => setNewPost({ ...newPost, comments: e.target.value })}
                     style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                   />
                 </div>
               </div>
 
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                 <button 
                   type="button" 
                   className="btn btn-secondary" 
                   onClick={() => setShowAddPostModal(false)}
                   style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                 >
                   Batal
                 </button>
                 <button 
                   type="submit" 
                   className="btn btn-primary" 
                   style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: 'var(--accent-color)', border: 'none', color: 'white', cursor: 'pointer' }}
                 >
                   Simpan Konten
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
 
     </div>
   );
 };
 
 export default Analytics;
