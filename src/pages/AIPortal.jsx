import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Mail,
  Video,
  Search,
  Award,
  FileText,
  MessageCircle,
  BarChart3,
  Heart,
  X,
  Send,
  RefreshCw,
  Copy,
  Check,
  Calendar,
  Plus,
  Play
} from 'lucide-react';
import {
  apiChatWithManager,
  apiAnalyzeBrief,
  apiAnalyzeContract,
  apiGenerateDraft,
  apiGenerateScript,
  apiGenerateOutreachPitch,
  apiAnalyzeTrendSeo,
  apiGeneratePrOutput,
  apiGenerateCommunityReply,
  apiGenerateCampaignReport,
  apiWellnessCheck
} from '../utils/api';

const AGENTS = [
  {
    id: 'coordinator',
    name: 'Front-Desk Coordinator',
    role: 'Agen Koordinator & Generalis',
    description: 'Manajer utama penjembatan seluruh perintah harian Anda.',
    icon: LayoutDashboard,
    color: 'var(--accent-color)',
    quickActionTab: false // Only chat is needed for general coordinator
  },
  {
    id: 'campaign',
    name: 'Team Kampanye',
    role: 'Agen Penganalisis Kampanye',
    description: 'Membedah brief brand menjadi checklist aksi & tenggat waktu.',
    icon: Sparkles,
    color: '#10B981',
    quickActionTab: true
  },
  {
    id: 'contract',
    name: 'Team Legal',
    role: 'Agen Pengawal Kontrak',
    description: 'Mendeteksi risiko hukum, eksklusivitas, & klausul menjebak.',
    icon: AlertTriangle,
    color: '#EF4444',
    quickActionTab: true
  },
  {
    id: 'negotiator',
    name: 'Team Negosiasi',
    role: 'Agen Komunikator & Negosiasi',
    description: 'Menulis draf email/chat negosiasi rate card & penyesuaian revisi.',
    icon: MessageSquare,
    color: '#3B82F6',
    quickActionTab: true
  },
  {
    id: 'outreach',
    name: 'Team Sponsor',
    role: 'Agen Pemburu Sponsor / Cold Pitch',
    description: 'Membuat email penawaran kerja sama (cold pitch) persuasif ke brand.',
    icon: Mail,
    color: '#F59E0B',
    quickActionTab: true
  },
  {
    id: 'creative',
    name: 'Team Creative',
    role: 'Agen Penulis Naskah & Ide Hook',
    description: 'Merancang naskah video pendek kreatif per detik & ide hook 3 detik.',
    icon: Video,
    color: '#8B5CF6',
    quickActionTab: true
  },
  {
    id: 'trend',
    name: 'Team Riset',
    role: 'Agen Riset Tren & SEO Konten',
    description: 'Riset audio populer & kata kunci pencarian teratas di algoritma.',
    icon: Search,
    color: '#EC4899',
    quickActionTab: true
  },
  {
    id: 'pr',
    name: 'Team PR',
    role: 'Agen Branding & PR Krisis',
    description: 'Menyusun draf biodata, rilis pers, & respons krisis reputasi.',
    icon: Award,
    color: '#06B6D4',
    quickActionTab: true
  },
  {
    id: 'finance',
    name: 'Team Finansial',
    role: 'Agen Keuangan & Administrasi',
    description: 'Membuat draf invoice tagihan & pesan pengingat jatuh tempo.',
    icon: FileText,
    color: '#14B8A6',
    quickActionTab: true
  },
  {
    id: 'community',
    name: 'Team Komunitas',
    role: 'Agen Manajemen Komunitas',
    description: 'Menyusun draf balasan ramah & interaktif untuk komentar netizen.',
    icon: MessageCircle,
    color: '#EAB308',
    quickActionTab: true
  },
  {
    id: 'analytics',
    name: 'Team Reporter',
    role: 'Agen Analisis Kinerja Kampanye',
    description: 'Menghitung ER/CTR & menyusun draf laporan bukti performa.',
    icon: BarChart3,
    color: '#F97316',
    quickActionTab: true
  },
  {
    id: 'wellness',
    name: 'Team Kesehatan',
    role: 'Agen Wellness & Anti-Burnout',
    description: 'Audit beban pikiran & rekomendasi jadwal detoks media sosial.',
    icon: Heart,
    color: '#6366F1',
    quickActionTab: true
  }
];

const AIPortal = ({ apiKey, creatorProfile, addPipelineTask, addCalendarEvent }) => {
  const [activeAgent, setActiveAgent] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('quick'); // 'quick' or 'chat'
  
  // Quick Action Form States
  const [formData, setFormData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedToPipeline, setSavedToPipeline] = useState(false);

  // Chat Workspace States
  const [chatHistories, setChatHistories] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Team Meeting States
  const [isMeeting, setIsMeeting] = useState(false);
  const [teamChatHistory, setTeamChatHistory] = useState([]);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, activeAgent, workspaceTab, teamChatHistory]);

  const getAgentPosition = (index, total, meeting) => {
    if (meeting) {
      // Circle around conference table (x: 50, y: 50)
      const angle = (index / total) * Math.PI * 2;
      return {
        left: `${50 + Math.cos(angle) * 18}%`,
        top: `${50 + Math.sin(angle) * 22}%`
      };
    } else {
      // 12 Desks layout
      const positions = [
        {x: 10, y: 15}, {x: 36, y: 15}, {x: 63, y: 15}, {x: 90, y: 15},
        {x: 10, y: 40}, {x: 90, y: 40},
        {x: 10, y: 65}, {x: 90, y: 65},
        {x: 10, y: 90}, {x: 36, y: 90}, {x: 63, y: 90}, {x: 90, y: 90}
      ];
      return { left: `${positions[index].x}%`, top: `${positions[index].y}%` };
    }
  };

  const handleStartMeeting = () => {
    setIsMeeting(true);
    setActiveAgent(null); // Close individual agent sidebar
    if (teamChatHistory.length === 0) {
      setTeamChatHistory([{ sender: 'team', text: 'Rapat Tim dimulai! Tanyakan masalah apa saja, dan 2-3 agen relevan akan berdiskusi memberikan 1 jawaban final untuk Anda.' }]);
    }
  };

  const handleSendTeamMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setTeamChatHistory(prev => [...prev, { sender: 'user', text: msg }]);
    setChatLoading(true);

    try {
      // Prompt khusus untuk Rapat Tim (meminta gabungan pemikiran 2-3 agent)
      const res = await apiChatWithManager(msg, apiKey, creatorProfile?.name || 'Kreator', 'Team Meeting (Semua Agen)');
      setTeamChatHistory(prev => [...prev, { sender: 'team', text: res.reply }]);
    } catch (err) {
      setTeamChatHistory(prev => [...prev, { sender: 'team', text: "Maaf, diskusi tim terganggu (koneksi/API error)." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenAgent = (agent) => {
    setActiveAgent(agent);
    setWorkspaceTab(agent.quickActionTab ? 'quick' : 'chat');
    setFormData({});
    setActionResult(null);
    setActionError('');
    setSavedToPipeline(false);
    setCopied(false);
    
    // Initialize chat history for this agent if not exists
    if (!chatHistories[agent.id]) {
      setChatHistories(prev => ({
        ...prev,
        [agent.id]: [
          {
            sender: 'assistant',
            text: `Halo! Saya adalah ${agent.name} (${agent.role}). Ada yang bisa saya bantu secara khusus hari ini?`
          }
        ]
      }));
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === 'object' ? JSON.stringify(text, null, 2) : text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCampaignToPipeline = () => {
    if (!actionResult || activeAgent.id !== 'campaign') return;
    
    addPipelineTask({
      id: `task-${Date.now()}`,
      title: actionResult.projectName || 'Proyek Kolaborasi Baru',
      brand: actionResult.brand || 'Klien Baru',
      platform: 'Instagram',
      status: 'brief',
      dueDate: actionResult.dueDate || new Date().toISOString().split('T')[0],
      deliverables: actionResult.deliverables || '',
      notes: `Do's: ${actionResult.doList?.join(', ') || ''}. Don'ts: ${actionResult.dontList?.join(', ') || ''}`
    });

    if (actionResult.dueDate) {
      addCalendarEvent({
        id: `event-${Date.now()}`,
        title: `Draft Due: ${actionResult.projectName || 'Proyek Baru'}`,
        start: actionResult.dueDate,
        type: 'deadline',
        brand: actionResult.brand || 'Klien Baru'
      });
    }

    setSavedToPipeline(true);
  };

  // Run Quick Action Handlers
  const handleRunQuickAction = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionResult(null);
    setSavedToPipeline(false);

    try {
      if (!apiKey) {
        // Fallback simulated response
        await new Promise(resolve => setTimeout(resolve, 1500));
        setActionError('Catatan: Menampilkan data simulasi karena API Key SumoPod belum diatur di Setelan.');
        
        switch (activeAgent.id) {
          case 'campaign':
            setActionResult({
              brand: formData.brandName || 'Brand Demo',
              projectName: 'Skincare Launch Campaign',
              deliverables: '1x Reels, 3x Stories',
              doList: ['Tunjukkan tekstur produk', 'Mention akun brand', 'Gunakan pakaian terang'],
              dontList: ['Jangan bandingkan dengan kompetitor', 'Jangan sebut e-commerce lain'],
              hashtags: ['#SkincareLaunch', '#GlowingFace'],
              mentions: ['@brandbeauty'],
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            break;
          case 'contract':
            setActionResult({
              hasExclusivity: true,
              exclusivityDetails: 'Dilarang bekerja sama dengan brand makeup sejenis selama 3 bulan.',
              paymentTerms: 'Pembayaran net 45 hari setelah tayang.',
              paymentRisk: 'medium',
              usageRights: 'Hak penggunaan aset selama 6 bulan di media sosial brand.',
              usageRightsRisk: 'low',
              otherRisks: [{ title: 'Denda Keterlambatan', description: 'Potongan fee 5% per hari jika terlambat posting.' }],
              negotiationSuggestions: 'Minta pengurangan eksklusivitas menjadi 1 bulan atau hilangkan denda keterlambatan sepihak.'
            });
            break;
          case 'negotiator':
            setActionResult({
              draft: `Halo Tim Brand,\n\nTerima kasih atas tawarannya. Terkait negosiasi rate card, kami ingin mengajukan penawaran terbaik. Mengingat deliverables yang diminta cukup padat, kami mengajukan rate sebesar ${creatorProfile?.rates || 5000000} ${creatorProfile?.currency || 'IDR'}. Alternatifnya, jika anggaran tetap, kami bisa menyesuaikan deliverables menjadi 1x Reels saja. Bagaimana menurut Anda?\n\nSalam,\nManajemen ${creatorProfile?.name || 'Kreator'}`
            });
            break;
          case 'outreach':
            setActionResult({
              pitch: `Subject: Pitch Kolaborasi Kreatif: ${creatorProfile?.name || 'Kreator'} x ${formData.brandName || 'Brand'}\n\nHalo Tim PR ${formData.brandName || 'Brand'},\n\nPerkenalkan saya Jessica, manajer dari ${creatorProfile?.name || 'Kreator'} (@jessicahartono). Kami mengagumi produk baru Anda, ${formData.productName || 'Serum'}.\n\nKami tertarik untuk membantu mempromosikan produk tersebut dengan sudut pandang unik: "${formData.usp || 'Review detail berbobot'}". Niche kami sangat pas dengan target pasar Anda. Terlampir media kit kami.\n\nApakah kami bisa menjadwalkan panggilan singkat minggu ini?\n\nSalam,\nManajemen Jessica`
            });
            break;
          case 'creative':
            setActionResult({
              hooks: [
                'Udah nyobain 5 cara ini tapi jerawat masih bandel?',
                'Jangan beli mouse ini sebelum kalian lihat video ini sampai habis!',
                'Kesalahan fatal desk setup yang bikin kalian gampang pegel'
              ],
              script: '[0-5 Detik] Hook & Visual: Tunjukkan closeup mouse MX Master. Audio: Mouse ini beneran bisa bikin produktif?\n[6-25 Detik] Body: Tunjukkan scroll rodanya. Audio: Scroll super cepat 1000 baris per detik.\n[26-30 Detik] CTA. Audio: Link beli di bio!'
            });
            break;
          case 'trend':
            setActionResult({
              trendingAudio: 'Instrumental Lo-Fi Chill Beats & Synth-wave (sedang naik daun untuk video transisi).',
              keywords: ['desk setup minimalis', 'aesthetic work space', 'produktivitas kerja'],
              titles: [
                'Bongkar Desk Setup Minimalis ala Kreator Tech',
                'Aksesoris Meja Kerja Murah tapi Bikin Betah Kerja',
                'Cara Rapikan Kabel Meja Biar Aesthetic'
              ]
            });
            break;
          case 'pr':
            setActionResult({
              prOutput: `Halo teman-teman semua,\n\nMenanggapi ulasan yang beredar belakangan ini mengenai akurasi produk review kami, kami ingin menegaskan bahwa transparansi adalah nilai utama kami. Kami selalu menguji produk secara objektif selama minimal 7 hari sebelum memberikan ulasan. Umpan balik Anda sangat berharga bagi kami untuk terus berkembang.\n\nTerima kasih atas dukungannya,\nTim PR ${creatorProfile?.name || 'Kreator'}`
            });
            break;
          case 'finance':
            if (formData.financeMode === 'invoice') {
              setActionResult({
                invoiceId: `INV-${Date.now().toString().slice(-4)}`,
                invoiceText: `INVOICE BILLING\n\nNomor: INV-2026-${Date.now().toString().slice(-3)}\nKepada Klien: ${formData.clientName}\nProyek: ${formData.projectName}\nJumlah Tagihan: ${formData.amount} IDR\n\nJatuh Tempo: 14 hari dari sekarang.\nTransfer ke Bank BCA 12345678 a/n Jessica Hartono.`
              });
            } else {
              setActionResult({
                reminderText: `Halo Tim ${formData.clientName || 'Brand'},\n\nSemoga dalam keadaan sehat. Kami ingin mengonfirmasi mengenai tagihan proyek ${formData.projectName || 'Kampanye'} yang telah melewati jatuh tempo pembayaran selama ${formData.overdueDays || 5} hari. Mohon bantuannya untuk memproses pembayaran ini agar kerja sama kita berjalan lancar. Terima kasih banyak!\n\nSalam,\nKeuangan ${creatorProfile?.name || 'Kreator'}`
              });
            }
            break;
          case 'community':
            setActionResult({
              replies: [
                { comment: 'Spill lampu mejanya dong kak!', reply: 'Halo! Itu lampu meja aesthetic aku beli di link bio nomor 12 ya! Hehe.' },
                { comment: 'Bikin betah kerjanya klo meja serapi ini', reply: 'Makasih banyak! Kunci utamanya di manajemen kabel sih, dicobain yuk!' }
              ]
            });
            break;
          case 'analytics':
            const v = parseInt(formData.views) || 100000;
            const l = parseInt(formData.likes) || 8000;
            const c = parseInt(formData.comments) || 300;
            const s = parseInt(formData.shares) || 500;
            const cl = parseInt(formData.clicks) || 1200;
            const erVal = (((l + c + s) / v) * 100).toFixed(2);
            const ctrVal = ((cl / v) * 100).toFixed(2);

            setActionResult({
              er: `${erVal}%`,
              ctr: `${ctrVal}%`,
              performanceGrade: parseFloat(erVal) > 6 ? 'Excellent' : 'Good',
              summary: `Kampanye video berjalan sangat baik dengan mengumpulkan ${v.toLocaleString()} tayangan. Respon audiens cukup interaktif dengan total interaksi ${l + c + s} kali.`,
              keyInsights: 'Penonton paling banyak menanyakan link produk (CTR klik link cukup memuaskan). Konten transisi visual terbukti menaikkan retensi penonton.'
            });
            break;
          case 'wellness':
            setActionResult({
              burnoutRisk: parseInt(formData.stressLevel) > 7 ? 'High' : 'Medium',
              auditReport: `Berdasarkan tingkat stres Anda yang berada di skala ${formData.stressLevel}/10 dengan perasaan "${formData.feelings || 'lelah'}", Anda menunjukkan tanda-tanda kecemasan operasional konten.`,
              recommendations: [
                'Matikan notifikasi media sosial selama 12 jam ke depan.',
                'Mintalah asisten Anda untuk membalas email masuk yang tidak mendesak.',
                'Lakukan peregangan leher dan minum air mineral 2 liter hari ini.'
              ],
              detoxPlan: 'Rencana Istirahat: Matikan layar mulai jam 20.00 malam ini sampai jam 08.00 besok pagi. Luangkan waktu jalan pagi tanpa membawa HP.'
            });
            break;
          default:
            setActionError('Agen tidak dikenal.');
        }
      } else {
        // Call Real API endpoints
        let res;
        switch (activeAgent.id) {
          case 'campaign':
            res = await apiAnalyzeBrief(formData.briefText);
            setActionResult(res);
            break;
          case 'contract':
            res = await apiAnalyzeContract(formData.contractText);
            setActionResult(res);
            break;
          case 'negotiator':
            res = await apiGenerateDraft(formData.scenario, formData.tone, formData.details, creatorProfile);
            setActionResult(res);
            break;
          case 'outreach':
            res = await apiGenerateOutreachPitch(formData.brandName, formData.productName, formData.usp, creatorProfile);
            setActionResult(res);
            break;
          case 'creative':
            res = await apiGenerateScript(formData.brandName, formData.productName, formData.concept, formData.duration);
            setActionResult(res);
            break;
          case 'trend':
            res = await apiAnalyzeTrendSeo(formData.topicNiche);
            setActionResult(res);
            break;
          case 'pr':
            res = await apiGeneratePrOutput(formData.prScenario, formData.details, creatorProfile);
            setActionResult(res);
            break;
          case 'finance':
            if (formData.financeMode === 'invoice') {
              res = await apiGenerateDraft(
                'Pembuatan Invoice',
                'Profesional',
                `Buat rincian tagihan invoice untuk Klien: ${formData.clientName}, Proyek: ${formData.projectName}, Senilai: ${formData.amount}`,
                creatorProfile
              );
              setActionResult({
                invoiceId: `INV-${Date.now().toString().slice(-4)}`,
                invoiceText: res.draft
              });
            } else {
              res = await apiGenerateDraft(
                'Reminder Pembayaran',
                'Profesional & Asertif',
                `Tolong ingatkan brand ${formData.clientName} bahwa pembayaran proyek ${formData.projectName} telah terlambat ${formData.overdueDays} hari. Tagih secara formal.`,
                creatorProfile
              );
              setActionResult({
                reminderText: res.draft
              });
            }
            break;
          case 'community':
            const commentsArray = formData.commentsText.split('\n').filter(c => c.trim().length > 0);
            res = await apiGenerateCommunityReply(commentsArray);
            setActionResult(res);
            break;
          case 'analytics':
            res = await apiGenerateCampaignReport(
              formData.brandName,
              formData.projectName,
              parseInt(formData.views),
              parseInt(formData.likes),
              parseInt(formData.comments),
              parseInt(formData.shares),
              parseInt(formData.clicks)
            );
            setActionResult(res);
            break;
          case 'wellness':
            res = await apiWellnessCheck(parseInt(formData.stressLevel), formData.feelings);
            setActionResult(res);
            break;
          default:
            throw new Error('Agen tidak dikenal.');
        }
      }
    } catch (err) {
      console.error(err);
      setActionError(`Gagal menjalankan agen: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Chat Form Handlers
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text: chatInput };
    const currentHistory = chatHistories[activeAgent.id] || [];
    const updatedHistory = [...currentHistory, userMsg];

    setChatHistories(prev => ({ ...prev, [activeAgent.id]: updatedHistory }));
    setChatInput('');
    setChatLoading(true);

    try {
      if (!apiKey) {
        // Fallback simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setChatHistories(prev => ({
          ...prev,
          [activeAgent.id]: [
            ...updatedHistory,
            {
              sender: 'assistant',
              text: `[SIMULASI] Halo! Saya adalah ${activeAgent.name}. Untuk respon dinamis, atur kunci API Anda. Teks masukan Anda: "${userMsg.text}".`
            }
          ]
        }));
      } else {
        const res = await apiChatWithManager(updatedHistory, activeAgent.name);
        setChatHistories(prev => ({
          ...prev,
          [activeAgent.id]: [
            ...updatedHistory,
            { sender: 'assistant', text: res.reply }
          ]
        }));
      }
    } catch (err) {
      console.error(err);
      setChatHistories(prev => ({
        ...prev,
        [activeAgent.id]: [
          ...updatedHistory,
          { sender: 'assistant', text: `Terjadi galat menghubungi pusat kendali AI: ${err.message}` }
        ]
      }));
    } finally {
      setChatLoading(false);
    }
  };

  // Render Dynamic Input Form based on Active Agent
  const renderAgentFormFields = () => {
    if (!activeAgent) return null;

    switch (activeAgent.id) {
      case 'campaign':
        return (
          <div className="form-group">
            <label>Salin Teks Brief Kampanye Kasar</label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Salin teks briefing dari brand atau email ke sini..."
              value={formData.briefText || ''}
              onChange={e => setFormData({ ...formData, briefText: e.target.value })}
              required
            />
          </div>
        );
      case 'contract':
        return (
          <div className="form-group">
            <label>Salin Pasal Kontrak (SPK)</label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Salin pasal atau seluruh teks kontrak untuk diperiksa..."
              value={formData.contractText || ''}
              onChange={e => setFormData({ ...formData, contractText: e.target.value })}
              required
            />
          </div>
        );
      case 'negotiator':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Skenario Negosiasi</label>
                <select
                  className="form-control"
                  value={formData.scenario || 'rate_card'}
                  onChange={e => setFormData({ ...formData, scenario: e.target.value })}
                >
                  <option value="rate_card">Negosiasi Rate Card</option>
                  <option value="revisi">Negosiasi Batas Revisi</option>
                  <option value="timeline">Minta Extend Deadline</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nada Bicara (Tone)</label>
                <select
                  className="form-control"
                  value={formData.tone || 'Profesional'}
                  onChange={e => setFormData({ ...formData, tone: e.target.value })}
                >
                  <option value="Profesional">Profesional & Sopan</option>
                  <option value="Tegas">Tegas & Asertif</option>
                  <option value="Santai">Friendly & Casual</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Detail Spesifik Permintaan</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Misal: Brand minta harga turun 20% tapi kita mau kurangi postingan Instastory..."
                value={formData.details || ''}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'outreach':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Brand Target</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Misal: Somethinc"
                  value={formData.brandName || ''}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nama Produk / Jasa</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Misal: Serum Vitamin C"
                  value={formData.productName || ''}
                  onChange={e => setFormData({ ...formData, productName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Nilai Jual Unik Anda (USP)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Misal: Review berbasis sains dengan visual aesthetic desk setup..."
                value={formData.usp || ''}
                onChange={e => setFormData({ ...formData, usp: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'creative':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Brand & Produk</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Logitech MX Master Mouse"
                  value={formData.brandName || ''}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Durasi Target</label>
                <select
                  className="form-control"
                  value={formData.duration || '30 detik'}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="15 detik">15 Detik (Instan)</option>
                  <option value="30 detik">30 Detik (Standard)</option>
                  <option value="60 detik">60 Detik (Detail)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Konsep / Topik Utama Video</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Misal: Review kenyamanan multitasking mouse Logitech MX Master untuk pekerja WFH..."
                value={formData.concept || ''}
                onChange={e => setFormData({ ...formData, concept: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'trend':
        return (
          <div className="form-group">
            <label>Ketik Ceruk Konten (Niche) Anda</label>
            <input
              type="text"
              className="form-control"
              placeholder="Misal: Desk Setup, Beauty & Skincare, Tech Gadgets..."
              value={formData.topicNiche || ''}
              onChange={e => setFormData({ ...formData, topicNiche: e.target.value })}
              required
            />
          </div>
        );
      case 'pr':
        return (
          <>
            <div className="form-group">
              <label>Skenario Hubungan Masyarakat (PR)</label>
              <select
                className="form-control"
                value={formData.prScenario || 'crisis'}
                onChange={e => setFormData({ ...formData, prScenario: e.target.value })}
              >
                <option value="crisis">Klarifikasi Krisis / Ulasan Negatif</option>
                <option value="press_release">Draf Siaran Pers (Launching Proyek Baru)</option>
                <option value="bio">Pembaruan Bio Medsos Personal Brand</option>
              </select>
            </div>
            <div className="form-group">
              <label>Detail Kejadian / Poin Utama</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Salin kronologi kejadian krisis atau detail pengumuman yang ingin disampaikan..."
                value={formData.details || ''}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'finance':
        return (
          <>
            <div className="form-group">
              <label>Jenis Tindakan Keuangan</label>
              <select
                className="form-control"
                value={formData.financeMode || 'invoice'}
                onChange={e => setFormData({ ...formData, financeMode: e.target.value })}
              >
                <option value="invoice">Buat Draf Invoice</option>
                <option value="reminder">Tulis Pengingat Jatuh Tempo (Overdue Reminder)</option>
              </select>
            </div>
            
            {formData.financeMode === 'reminder' ? (
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Brand / Klien</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tokopedia"
                    value={formData.clientName || ''}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hari Terlambat (Overdue Days)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="5"
                    value={formData.overdueDays || ''}
                    onChange={e => setFormData({ ...formData, overdueDays: e.target.value })}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>Nama Klien</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Wardah Beauty"
                    value={formData.clientName || ''}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jumlah Tagihan (Nominal)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="7500000"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label>Nama Proyek / Konten</label>
              <input
                type="text"
                className="form-control"
                placeholder="1x Youtube Video Dedicated Logitech"
                value={formData.projectName || ''}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 'community':
        return (
          <div className="form-group">
            <label>Salin Komentar Netizen (Satu baris per komentar)</label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Spill link lampu mejanya dong kak!&#10;Keren banget dekorasi mejanya!&#10;Beli keyboardnya di mana?"
              value={formData.commentsText || ''}
              onChange={e => setFormData({ ...formData, commentsText: e.target.value })}
              required
            />
          </div>
        );
      case 'analytics':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Nama Brand</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Gojek Indonesia"
                  value={formData.brandName || ''}
                  onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nama Kampanye</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="TikTok Review GoFood Hemat"
                  value={formData.projectName || ''}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Views (Penayangan)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="150000"
                  value={formData.views || ''}
                  onChange={e => setFormData({ ...formData, views: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Likes (Suka)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="8500"
                  value={formData.likes || ''}
                  onChange={e => setFormData({ ...formData, likes: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Comments (Komentar)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="300"
                  value={formData.comments || ''}
                  onChange={e => setFormData({ ...formData, comments: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Shares (Bagikan)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="400"
                  value={formData.shares || ''}
                  onChange={e => setFormData({ ...formData, shares: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Link Clicks (Klik)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="1200"
                  value={formData.clicks || ''}
                  onChange={e => setFormData({ ...formData, clicks: e.target.value })}
                  required
                />
              </div>
            </div>
          </>
        );
      case 'wellness':
        return (
          <>
            <div className="form-group">
              <label>Tingkat Stres Saat Ini (Skala 1 - 10)</label>
              <select
                className="form-control"
                value={formData.stressLevel || '5'}
                onChange={e => setFormData({ ...formData, stressLevel: e.target.value })}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} - {i + 1 < 4 ? 'Santai' : i + 1 < 8 ? 'Sedang' : 'Stres Berat'}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Jelaskan Apa yang Anda Rasakan</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Ceritakan perasaan lelah Anda, tumpukan revisi, atau jadwal syuting yang padat..."
                value={formData.feelings || ''}
                onChange={e => setFormData({ ...formData, feelings: e.target.value })}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Render Result Box based on Active Agent Output
  const renderActionResultBox = () => {
    if (!actionResult) return null;

    switch (activeAgent.id) {
      case 'campaign':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Hasil Analisis Kampanye</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult)}>
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Salin' : 'Salin JSON'}
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={handleSaveCampaignToPipeline}
                  disabled={savedToPipeline}
                >
                  <Plus size={14} /> {savedToPipeline ? 'Disimpan' : 'Ke Alur Konten'}
                </button>
              </div>
            </div>
            
            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ marginBottom: '8px' }}><strong>Brand:</strong> {actionResult.brand}</div>
              <div style={{ marginBottom: '8px' }}><strong>Proyek:</strong> {actionResult.projectName}</div>
              <div style={{ marginBottom: '8px' }}><strong>Deliverables:</strong> {actionResult.deliverables}</div>
              <div style={{ marginBottom: '8px' }}><strong>Tenggat Draf:</strong> {actionResult.dueDate}</div>
              
              <div style={{ marginTop: '12px' }}>
                <strong>Do's:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {actionResult.doList?.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div style={{ marginTop: '8px' }}>
                <strong>Don'ts:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {actionResult.dontList?.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {actionResult.hashtags?.map((h, i) => <span key={i} className="badge badge-accent" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-color)' }}>{h}</span>)}
                {actionResult.mentions?.map((m, i) => <span key={i} className="badge badge-secondary">{m}</span>)}
              </div>
            </div>
          </div>
        );
      case 'contract':
        const rColor = actionResult.paymentRisk === 'high' || actionResult.usageRightsRisk === 'high' ? '#EF4444' : '#F59E0B';
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Hasil Pemeriksaan Risiko Kontrak</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.negotiationSuggestions)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Saran Negosiasi
              </button>
            </div>

            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Risiko Eksklusivitas:</strong> 
                <span style={{ color: actionResult.hasExclusivity ? '#EF4444' : '#10B981', fontWeight: '600' }}>
                  {actionResult.hasExclusivity ? 'Terdeteksi Eksklusif' : 'Aman (Non-Eksklusif)'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{actionResult.exclusivityDetails}</p>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Termin Pembayaran:</strong> {actionResult.paymentTerms} (Risiko: <span style={{ color: rColor, fontWeight: '600' }}>{actionResult.paymentRisk}</span>)
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Hak Penggunaan Konten:</strong> {actionResult.usageRights}
              </div>

              {actionResult.otherRisks?.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ color: '#EF4444' }}>Pasal Risiko Lain:</strong>
                  {actionResult.otherRisks.map((r, i) => (
                    <div key={i} style={{ marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #EF4444' }}>
                      <div style={{ fontWeight: '600' }}>{r.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.description}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                <strong>Saran Negosiasi Ulang:</strong>
                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-primary)' }}>{actionResult.negotiationSuggestions}</p>
              </div>
            </div>
          </div>
        );
      case 'negotiator':
      case 'pr':
        const textOut = actionResult.draft || actionResult.prOutput;
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Draf Tulisan Dihasilkan</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(textOut)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Draf
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={textOut}
              readOnly
              style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', fontFamily: 'monospace' }}
            />
          </div>
        );
      case 'outreach':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Draf Surat Penawaran (Cold Pitch)</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.pitch)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Pitch
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={actionResult.pitch}
              readOnly
              style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', fontFamily: 'monospace' }}
            />
          </div>
        );
      case 'creative':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Ide & Naskah Konten</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.script)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Naskah
              </button>
            </div>

            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <strong>Ide Hook Pembuka:</strong>
              <ul style={{ paddingLeft: '16px', marginTop: '4px', marginBottom: '12px' }}>
                {actionResult.hooks?.map((h, i) => <li key={i}>"{h}"</li>)}
              </ul>
              <strong>Naskah Skrip Video:</strong>
              <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>{actionResult.script}</p>
            </div>
          </div>
        );
      case 'trend':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Riset SEO & Lagu Tren</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.keywords.join(', '))}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Kata Kunci
              </button>
            </div>

            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Tren Musik/Audio:</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{actionResult.trendingAudio}</p>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Kata Kunci Tagging SEO:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {actionResult.keywords?.map((k, i) => <span key={i} className="badge badge-secondary">{k}</span>)}
                </div>
              </div>

              <div>
                <strong>3 Rekomendasi Judul Konten FYP:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {actionResult.titles?.map((t, i) => <li key={i}><strong>{t}</strong></li>)}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'finance':
        const finText = actionResult.invoiceText || actionResult.reminderText;
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{actionResult.invoiceText ? `Draft Invoice ${actionResult.invoiceId}` : 'Draf Pesan Reminder'}</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(finText)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Teks
              </button>
            </div>
            <textarea
              className="form-control"
              rows="8"
              value={finText}
              readOnly
              style={{ fontSize: '13px', backgroundColor: 'var(--bg-tertiary)', fontFamily: 'monospace' }}
            />
          </div>
        );
      case 'community':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Draf Balasan Komentar Masal</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.replies.map(r => `Comment: ${r.comment}\nReply: ${r.reply}`).join('\n\n'))}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Semua
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actionResult.replies?.map((r, i) => (
                <div key={i} className="card" style={{ padding: '10px', fontSize: '12px', backgroundColor: 'var(--bg-tertiary)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>💬 "{r.comment}"</div>
                  <div style={{ color: 'var(--accent-color)', fontWeight: '500', marginTop: '4px' }}>➡️ {r.reply}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Laporan Evaluasi Kampanye</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.summary)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Ringkasan
              </button>
            </div>

            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Engagement Rate</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{actionResult.er}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CTR (Klik Link)</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>{actionResult.ctr}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '8px', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Kategori Performa</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#F59E0B', marginTop: '2px' }}>{actionResult.performanceGrade}</div>
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <strong>Analisis Ringkasan:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{actionResult.summary}</p>
              </div>

              <div>
                <strong>Insight Utama Klien:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{actionResult.keyInsights}</p>
              </div>
            </div>
          </div>
        );
      case 'wellness':
        const wColor = actionResult.burnoutRisk === 'High' ? '#EF4444' : '#F59E0B';
        return (
          <div className="result-container" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>Hasil Audit Mental & Burnout</h4>
              <button className="btn btn-secondary btn-sm" onClick={() => handleCopy(actionResult.detoxPlan)}>
                {copied ? <Check size={14} /> : <Copy size={14} />} Salin Rencana Detoks
              </button>
            </div>

            <div className="card" style={{ padding: '12px', fontSize: '13px', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Risiko Burnout:</strong> <span style={{ color: wColor, fontWeight: 'bold' }}>{actionResult.burnoutRisk}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{actionResult.auditReport}</p>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Rekomendasi Pemulihan Kesehatan:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {actionResult.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <strong>Rencana Detoks Taktis 24-48 Jam:</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>{actionResult.detoxPlan}</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="hq-container" style={{ alignItems: 'flex-start', padding: '40px', overflowY: 'auto' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', margin: activeAgent || isMeeting ? '0' : '0 auto', transition: 'all 0.3s' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Pusat Asisten AI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Pilih agen spesialis untuk membantu pekerjaan Anda hari ini.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {AGENTS.map((agent) => {
            const AgentIcon = agent.icon;
            const isActive = activeAgent?.id === agent.id;
            return (
              <div 
                key={agent.id}
                onClick={() => {
                  if (isMeeting) setIsMeeting(false);
                  handleOpenAgent(agent);
                }}
                className="card"
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '20px',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: isActive ? `1px solid ${agent.color}` : '1px solid var(--border-color)',
                  boxShadow: isActive ? `0 0 0 1px ${agent.color}33` : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: agent.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <AgentIcon size={24} />
                  </div>
                  {/* Online Status Indicator */}
                  <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', backgroundColor: '#10B981', border: '3px solid var(--bg-secondary)', borderRadius: '50%' }} title="Online"></div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{agent.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {agent.role}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting Controls (Bottom Center) */}
      <div className="meeting-control" style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <button 
          type="button"
          className={`meeting-btn ${!isMeeting ? 'active' : ''}`} 
          onClick={() => setIsMeeting(false)}
        >
          <div className="meeting-dot"></div> Mode Bekerja
        </button>
        <button 
          type="button"
          className={`meeting-btn ${isMeeting ? 'active' : ''}`} 
          onClick={handleStartMeeting}
        >
          <div className="meeting-dot"></div> Rapat Tim
        </button>
      </div>

      {/* Right Sidebar (Headquarters / Active Agent / Meeting) */}
      {(activeAgent || isMeeting) && (
        <div className="hq-sidebar" style={{ position: 'fixed', right: '20px', top: '20px', bottom: '20px', zIndex: 1000, boxShadow: '-10px 0 40px rgba(0,0,0,0.1)' }}>
          <div className="hq-sidebar-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="hq-sidebar-title">
                  {isMeeting ? 'RUANG RAPAT TIM' : 'TERMINAL AGEN'}
                </div>
                <div className="hq-sidebar-subtitle">
                  {isMeeting ? 'Diskusi Kolektif 2-3 Agen' : activeAgent.name}
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveAgent(null);
                  setIsMeeting(false);
                }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            {!isMeeting && activeAgent.quickActionTab && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '15px' }}>
                <button 
                  type="button"
                  style={{
                    flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: workspaceTab === 'quick' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                    color: workspaceTab === 'quick' ? '#fff' : 'var(--text-secondary)'
                  }}
                  onClick={() => setWorkspaceTab('quick')}
                >
                  Playbook
                </button>
                <button 
                  type="button"
                  style={{
                    flex: 1, padding: '6px', fontSize: '11px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                    background: workspaceTab === 'chat' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                    color: workspaceTab === 'chat' ? '#fff' : 'var(--text-secondary)'
                  }}
                  onClick={() => setWorkspaceTab('chat')}
                >
                  Chat Ops
                </button>
              </div>
            )}
          </div>
          
          <div className="hq-sidebar-content">
            {/* Rapat Tim Chat */}
            {isMeeting ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                  {teamChatHistory.map((msg, idx) => (
                    <div key={idx} className={`hq-chat-msg ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '10px' }}>
                      Agen sedang berdiskusi merumuskan jawaban...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendTeamMessage} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Apa yang ingin dibahas tim?"
                    disabled={chatLoading}
                    style={{ flexGrow: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                  <button type="submit" disabled={chatLoading} style={{ background: '#3182ce', border: 'none', borderRadius: '6px', padding: '0 15px', color: '#fff', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : workspaceTab === 'chat' ? (
              /* Agent Chat Room */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                  {(chatHistories[activeAgent.id] || []).map((msg, idx) => (
                    <div key={idx} className={`hq-chat-msg ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '10px' }}>
                      {activeAgent.name} mengetik...
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendChatMessage} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Instruksi untuk ${activeAgent.name}...`}
                    disabled={chatLoading}
                    style={{ flexGrow: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)', fontSize: '12px' }}
                  />
                  <button type="submit" disabled={chatLoading} style={{ background: '#3182ce', border: 'none', borderRadius: '6px', padding: '0 15px', color: '#fff', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : (
              /* Playbook Form */
              <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {renderActionFields(activeAgent.id)}
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: activeAgent.color, border: 'none', borderRadius: '6px', padding: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <Play size={14} />}
                  <span>{actionLoading ? 'Menjalankan...' : 'Jalankan Playbook'}</span>
                </button>
                {renderActionResultBox()}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPortal;
