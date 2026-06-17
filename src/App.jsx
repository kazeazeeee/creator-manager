import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AIChatBubble from './components/AIChatBubble';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import CreatorToolkit from './pages/CreatorToolkit';
import Invoices from './pages/Invoices';
import CalendarView from './pages/CalendarView';
import Settings from './pages/Settings';

// V2 New Pages
import MediaKit from './pages/MediaKit';
import Analytics from './pages/Analytics';
import AIPortal from './pages/AIPortal';
import Conversation from './pages/Conversation';

import { 
  apiGetProfile, 
  apiSaveProfile, 
  apiGetTasks, 
  apiAddTask, 
  apiUpdateTask, 
  apiDeleteTask, 
  apiGetInvoices, 
  apiAddInvoice, 
  apiUpdateInvoice, 
  apiDeleteInvoice, 
  apiGetCalendar, 
  apiAddCalendar, 
  apiGetSettings, 
  apiSaveSettings,
  apiSyncRecentPosts
} from './utils/api';

import { parseAuthHash, fetchGoogleEvents } from './utils/googleCalendar';
import { applyTheme, applyFont } from './utils/themes';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState(localStorage.getItem('creator-theme') || 'dark');
  const [fontPreference, setFontPreference] = useState(localStorage.getItem('creator-font') || 'monospace');
  
  // States
  const [profile, setProfile] = useState({ name: '', handle: '', rates: 0, currency: 'IDR', niche: '', adminPhone: '', bankName: '', bankAccount: '', bankHolder: '', instagram: '', tiktok: '', youtube: '', instagramFollowers: '', tiktokFollowers: '', tiktokLikes: '', youtubeFollowers: '', youtubeVideos: '', socialsLastSynced: '', recentPosts: [], postsLastSynced: '' });
  const [sumopodApiKey, setSumopodApiKey] = useState('');
  const [modelBiasa, setModelBiasa] = useState('deepseek-v4-flash');
  const [modelOptimal, setModelOptimal] = useState('deepseek-v4-pro');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleToken, setGoogleToken] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [pipelineTasks, setPipelineTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  // 1. Fetch data on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const [profileData, tasksData, invoicesData, calendarData, settingsData] = await Promise.all([
          apiGetProfile(),
          apiGetTasks(),
          apiGetInvoices(),
          apiGetCalendar(),
          apiGetSettings()
        ]);

        setProfile(profileData);
        setPipelineTasks(tasksData);
        setInvoices(invoicesData);
        setCalendarEvents(calendarData);
        
        if (settingsData) {
          setSumopodApiKey(settingsData.sumopodApiKey || '');
          setModelBiasa(settingsData.modelBiasa || 'deepseek-v4-flash');
          setModelOptimal(settingsData.modelOptimal || 'deepseek-v4-pro');
          setGoogleClientId(settingsData.googleClientId || '');
          setGoogleToken(settingsData.googleToken || '');
          setGoogleConnected(settingsData.googleConnected || false);
          if (settingsData.fontPreference) {
            setFontPreference(settingsData.fontPreference);
          }
        }

        // Lazy Sync: Trigger auto-refresh in background if never synced or synced > 4 hours ago
        const lastSynced = profileData.postsLastSynced;
        const now = new Date();
        const shouldSync = !lastSynced || (now - new Date(lastSynced)) > (4 * 60 * 60 * 1000);
        if (shouldSync && (profileData.tiktok || profileData.youtube || profileData.instagram)) {
          console.log('Lazy Sync: Auto-refreshing feed in background...');
          apiSyncRecentPosts().then(res => {
            if (res && res.success) {
              setProfile(prev => ({
                ...prev,
                recentPosts: res.recentPosts,
                postsLastSynced: res.postsLastSynced
              }));
              console.log('Lazy Sync feed completed.');
            }
          }).catch(err => {
            console.error('Lazy Sync background failed:', err.message);
          });
        }
      } catch (err) {
        console.error('Failed to load data from backend server:', err);
      }
    };

    loadBackendData();
  }, []);

  // Theme Sync Effect
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('creator-theme', theme);
  }, [theme]);

  // Font Sync Effect
  useEffect(() => {
    applyFont(fontPreference);
    localStorage.setItem('creator-font', fontPreference);
  }, [fontPreference]);

  // 2. Handle Google OAuth redirect parsing
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const authData = parseAuthHash();
      if (authData) {
        setGoogleToken(authData.token);
        setGoogleConnected(true);
        
        // Save to backend settings
        try {
          await apiSaveSettings({
            googleToken: authData.token,
            googleConnected: true
          });
        } catch (e) {
          console.error(e);
        }
        
        setActiveTab('settings');
        loadGoogleCalendar(authData.token);
      }
    };
    handleAuthRedirect();
  }, []);

  // Fetch real Google Calendar events
  const loadGoogleCalendar = async (token) => {
    try {
      const events = await fetchGoogleEvents(token);
      if (events && events.length > 0) {
        setCalendarEvents(events);
        // Save events to backend too
        for (const evt of events) {
          await apiAddCalendar(evt);
        }
      }
    } catch (err) {
      console.error('Failed to load Google Calendar Events:', err);
    }
  };

  const handleDisconnectGoogle = async () => {
    setGoogleConnected(false);
    setGoogleToken('');
    try {
      await apiSaveSettings({
        googleToken: '',
        googleConnected: false
      });
      // Fetch mock/default calendar events from backend to reset
      const res = await apiGetCalendar();
      setCalendarEvents(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Wrapper handlers for Backend Sync
  const handleAddPipelineTask = async (task) => {
    try {
      const res = await apiAddTask(task);
      if (res.success) {
        setPipelineTasks(prev => [task, ...prev]);
      }
    } catch (e) {
      console.error('Failed to save task to backend:', e);
    }
  };

  const handleCreateInvoiceFromTask = async (task) => {
    let estimatedEarnings = 0;
    try {
      const stored = localStorage.getItem('creator_analytics_metrics');
      if (stored) {
        const analyticsMap = JSON.parse(stored);
        if (analyticsMap[task.id] && analyticsMap[task.id].earnings) {
          estimatedEarnings = analyticsMap[task.id].earnings;
        }
      }
    } catch (e) {
      console.error('Failed to parse analytics metrics for invoice:', e);
    }

    if (!estimatedEarnings) {
      estimatedEarnings = profile.rates || 3000000; // default 3 million IDR
    }

    const nextNumber = invoices.length + 1;
    const invoiceId = `INV-2026-${String(nextNumber).padStart(3, '0')}`;

    const newInvoice = {
      id: invoiceId,
      clientName: task.brand,
      clientEmail: '',
      projectName: task.title,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      items: [
        {
          description: task.deliverables || `Pekerjaan Konten: ${task.title}`,
          qty: 1,
          rate: estimatedEarnings
        }
      ],
      amount: estimatedEarnings,
      status: 'pending'
    };

    try {
      const res = await apiAddInvoice(newInvoice);
      if (res.success) {
        setInvoices(prev => [newInvoice, ...prev]);
        setActiveTab('invoices');
        alert(`Invoice ${invoiceId} berhasil dibuat untuk ${task.brand}!`);
      } else {
        throw new Error(res.error || "Gagal membuat invoice di server.");
      }
    } catch (e) {
      console.error(e);
      alert(`Gagal membuat invoice: ${e.message}`);
    }
  };

  const handleUpdatePipelineTasks = async (updatedList) => {
    // Determine which task changed and update it
    setPipelineTasks(updatedList);
    // Find different task to sync to database
    // In our Pipeline component, we modify status of a single task.
    // To make it simple, we sync the status change to backend:
    // Pipeline component calls setPipelineTasks, which updates parent.
    // Let's iterate and sync or let the Pipeline component handle it directly.
    // Actually, in Pipeline.jsx we can call apiUpdateTask directly, let's look at that!
    // Since we pass setPipelineTasks to Pipeline component, we can either sync here or in the component.
    // To keep it simple, we'll let Pipeline.jsx invoke the API directly or we can sync it inside App.jsx via useEffect.
    // Let's sync via useEffect! If pipelineTasks changes, we can write a sync block.
    // But wait, to avoid infinite loops and multiple calls, it is much cleaner to let the components handle their own API updates, 
    // or let App.jsx handle it. Let's do it cleanly: we will modify the handler props!
  };

  const handleAddCalendarEvent = async (event) => {
    try {
      const res = await apiAddCalendar(event);
      if (res.success) {
        setPipelineTasks(prev => {
          // Keep it to satisfy compiler
          return prev;
        });
        setCalendarEvents(prev => [...prev, event]);
      }
    } catch (e) {
      console.error('Failed to save calendar event to backend:', e);
    }
  };

  const handleSaveSumopodApiKey = async (key) => {
    setSumopodApiKey(key);
    try {
      await apiSaveSettings({ sumopodApiKey: key });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModelBiasa = async (model) => {
    setModelBiasa(model);
    try {
      await apiSaveSettings({ modelBiasa: model });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModelOptimal = async (model) => {
    setModelOptimal(model);
    try {
      await apiSaveSettings({ modelOptimal: model });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGoogleClientId = async (clientId) => {
    setGoogleClientId(clientId);
    try {
      await apiSaveSettings({ googleClientId: clientId });
    } catch (e) {
      console.error(e);
    }
  };

  // Render Page Component based on Active Tab
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Dashboard 
            invoices={invoices} 
            pipelineTasks={pipelineTasks} 
            calendarEvents={calendarEvents} 
            setActiveTab={setActiveTab} 
            addPipelineTask={handleAddPipelineTask}
            profile={profile}
            setProfile={setProfile}
          />
        );
      case 'pipeline':
        return (
          <Pipeline 
            pipelineTasks={pipelineTasks} 
            setPipelineTasks={async (newTasks) => {
              setPipelineTasks(newTasks);
              const oldTasks = await apiGetTasks();
              newTasks.forEach(async (task) => {
                const old = oldTasks.find(o => o.id === task.id);
                if (old) {
                  const isChanged = old.status !== task.status ||
                    old.title !== task.title ||
                    old.brand !== task.brand ||
                    old.platform !== task.platform ||
                    old.dueDate !== task.dueDate ||
                    old.deliverables !== task.deliverables ||
                    old.notes !== task.notes;
                  if (isChanged) {
                    await apiUpdateTask(task.id, task);
                  }
                } else if (!old) {
                  await apiAddTask(task);
                }
              });
              // Delete task sync
              oldTasks.forEach(async (old) => {
                const stillExists = newTasks.some(n => n.id === old.id);
                if (!stillExists) {
                  await apiDeleteTask(old.id);
                }
              });
            }} 
            addCalendarEvent={handleAddCalendarEvent} 
            onCreateInvoice={handleCreateInvoiceFromTask}
          />
        );
      case 'ai-portal':
        return (
          <AIPortal 
            apiKey={sumopodApiKey} 
            creatorProfile={profile} 
            addPipelineTask={handleAddPipelineTask} 
            addCalendarEvent={handleAddCalendarEvent} 
          />
        );
      case 'conversation':
        return (
          <Conversation 
            apiKey={sumopodApiKey} 
            creatorProfile={profile} 
            addPipelineTask={handleAddPipelineTask}
          />
        );
      case 'toolkit':
        return (
          <CreatorToolkit
            apiKey={sumopodApiKey}
            addPipelineTask={handleAddPipelineTask}
            addCalendarEvent={handleAddCalendarEvent}
            creatorProfile={profile}
          />
        );
      case 'invoices':
        return (
          <Invoices 
            invoices={invoices} 
            setInvoices={async (newInvoices) => {
              setInvoices(newInvoices);
              const oldInvoices = await apiGetInvoices();
              newInvoices.forEach(async (inv) => {
                const old = oldInvoices.find(o => o.id === inv.id);
                if (old && (old.status !== inv.status)) {
                  await apiUpdateInvoice(inv.id, { status: inv.status });
                } else if (!old) {
                  await apiAddInvoice(inv);
                }
              });
              oldInvoices.forEach(async (old) => {
                const stillExists = newInvoices.some(n => n.id === old.id);
                if (!stillExists) {
                  await apiDeleteInvoice(old.id);
                }
              });
            }} 
            creatorProfile={profile} 
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            calendarEvents={calendarEvents} 
            setCalendarEvents={async (newEvents) => {
              setCalendarEvents(newEvents);
              // Simple add calendar event sync
              const oldEvents = await apiGetCalendar();
              newEvents.forEach(async (evt) => {
                const old = oldEvents.some(o => o.id === evt.id);
                if (!old) {
                  await apiAddCalendar(evt);
                }
              });
            }} 
            googleConnected={googleConnected} 
            addPipelineTask={handleAddPipelineTask}
            profile={profile}
          />
        );
      case 'mediakit':
        return <MediaKit profile={profile} setProfile={setProfile} />;
      case 'analytics':
        return <Analytics pipelineTasks={pipelineTasks} setPipelineTasks={setPipelineTasks} profile={profile} setProfile={setProfile} />;
      case 'settings':
        return (
          <Settings 
            profile={profile} 
            setProfile={apiSaveProfile} // Directly save to backend
            sumopodApiKey={sumopodApiKey} 
            setSumopodApiKey={handleSaveSumopodApiKey} 
            modelBiasa={modelBiasa} 
            setModelBiasa={handleSaveModelBiasa} 
            modelOptimal={modelOptimal} 
            setModelOptimal={handleSaveModelOptimal} 
            googleClientId={googleClientId} 
            setGoogleClientId={handleSaveGoogleClientId} 
            googleConnected={googleConnected} 
            disconnectGoogle={handleDisconnectGoogle} 
            selectedTheme={theme}
            setSelectedTheme={setTheme}
            fontPreference={fontPreference}
            setFontPreference={async (font) => { 
              setFontPreference(font); 
              await apiSaveSettings({ fontPreference: font }); 
            }}
          />
        );
      default:
        return <Dashboard invoices={invoices} pipelineTasks={pipelineTasks} calendarEvents={calendarEvents} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

      {/* Main Content Area */}
      <main className={`main-content page-fade-in ${['pipeline', 'calendar', 'conversation', 'analytics', 'toolkit'].includes(activeTab) ? 'wide-layout' : ''}`} key={activeTab}>
        {renderPage()}
      </main>

      {/* Floating AI Chat Assistant Widget */}
      <AIChatBubble apiKey={sumopodApiKey} creatorProfile={profile} />
    </div>
  );
}

export default App;
