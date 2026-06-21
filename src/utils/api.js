// Frontend Client-Side API Helper to connect to Express Backend

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.port === '5173') {
      return 'http://localhost:5000/api';
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getApiUrl();

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `API Error! Status: ${response.status}`);
  }

  return response.json();
};

// Profile
export const apiGetProfile = () => request('/profile');
export const apiSaveProfile = (profile) => request('/profile', {
  method: 'POST',
  body: JSON.stringify(profile)
});

// Tasks (Pipeline)
export const apiGetTasks = () => request('/tasks');
export const apiAddTask = (task) => request('/tasks', {
  method: 'POST',
  body: JSON.stringify(task)
});
export const apiUpdateTask = (id, task) => request(`/tasks/${id}`, {
  method: 'PUT',
  body: JSON.stringify(task)
});
export const apiDeleteTask = (id) => request(`/tasks/${id}`, {
  method: 'DELETE'
});

// Invoices
export const apiGetInvoices = () => request('/invoices');
export const apiAddInvoice = (invoice) => request('/invoices', {
  method: 'POST',
  body: JSON.stringify(invoice)
});
export const apiUpdateInvoice = (id, invoice) => request(`/invoices/${id}`, {
  method: 'PUT',
  body: JSON.stringify(invoice)
});
export const apiDeleteInvoice = (id) => request(`/invoices/${id}`, {
  method: 'DELETE'
});

// Calendar
export const apiGetCalendar = () => request('/calendar');
export const apiAddCalendar = (event) => request('/calendar', {
  method: 'POST',
  body: JSON.stringify(event)
});
export const apiDeleteCalendar = (id) => request(`/calendar/${id}`, {
  method: 'DELETE'
});

// Settings
export const apiGetSettings = () => request('/settings');
export const apiSaveSettings = (settings) => request('/settings', {
  method: 'POST',
  body: JSON.stringify(settings)
});

// Analytics
export const apiGetAnalytics = () => request('/analytics');
export const apiSaveAnalytics = (analytics) => request('/analytics', {
  method: 'POST',
  body: JSON.stringify(analytics)
});


// --- AI / Gemini Endpoints ---
export const apiAnalyzeBrief = (briefText) => request('/ai/analyze-brief', {
  method: 'POST',
  body: JSON.stringify({ briefText })
});

export const apiAnalyzeContract = (contractText) => request('/ai/analyze-contract', {
  method: 'POST',
  body: JSON.stringify({ contractText })
});

export const apiGenerateDraft = (scenario, tone, details, creatorProfile) => request('/ai/generate-draft', {
  method: 'POST',
  body: JSON.stringify({ scenario, tone, details, creatorProfile })
});

export const apiChatWithManager = (messageHistory, agentRole = null, teamMeetingAgents = null) => request('/ai/chat', {
  method: 'POST',
  body: JSON.stringify({ messageHistory, agentRole, teamMeetingAgents })
});


export const apiGenerateScript = (brand, product, concept, duration) => request('/ai/generate-script', {
  method: 'POST',
  body: JSON.stringify({ brand, product, concept, duration })
});

export const apiAnalyzeScript = (scriptText) => request('/ai/analyze-script', {
  method: 'POST',
  body: JSON.stringify({ scriptText })
});

export const apiGenerateOutreachPitch = (brandName, productName, uniqueSellingPoint, creatorProfile) => request('/ai/outreach-pitch', {
  method: 'POST',
  body: JSON.stringify({ brandName, productName, uniqueSellingPoint, creatorProfile })
});

export const apiAnalyzeTrendSeo = (topicNiche) => request('/ai/trend-seo', {
  method: 'POST',
  body: JSON.stringify({ topicNiche })
});

export const apiGeneratePrOutput = (scenario, details, creatorProfile) => request('/ai/pr-brand', {
  method: 'POST',
  body: JSON.stringify({ scenario, details, creatorProfile })
});

export const apiGenerateCommunityReply = (commentsList) => request('/ai/community-reply', {
  method: 'POST',
  body: JSON.stringify({ commentsList })
});

export const apiGenerateCampaignReport = (brand, project, views, likes, comments, shares, clicks) => request('/ai/campaign-report', {
  method: 'POST',
  body: JSON.stringify({ brand, project, views, likes, comments, shares, clicks })
});

export const apiWellnessCheck = (stressLevel, feelings) => request('/ai/wellness-check', {
  method: 'POST',
  body: JSON.stringify({ stressLevel, feelings })
});

export const apiGetDailyIdea = () => request('/ai/daily-idea', {
  method: 'POST'
});

export const apiSyncSocialMetrics = () => request('/profile/sync-social', {
  method: 'POST'
});

export const apiSyncRecentPosts = () => request('/profile/sync-recent-posts', {
  method: 'POST'
});

export const apiPredictPerformance = (platform, hook, script, duration, creatorProfile) => request('/ai/predict-performance', {
  method: 'POST',
  body: JSON.stringify({ platform, hook, script, duration, creatorProfile })
});

export const apiAnalyzeImage = (base64Data, mimeType, prompt = '') => request('/ai/analyze-image', {
  method: 'POST',
  body: JSON.stringify({ base64Data, mimeType, prompt })
});

export const apiParsePdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/ai/parse-pdf`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Gagal memproses berkas PDF. Status: ${response.status}`);
  }
  
  return response.json();
};

export const apiParsePptx = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/ai/parse-pptx`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Gagal memproses berkas PPTX. Status: ${response.status}`);
  }
  
  return response.json();
};

export const apiExtractDraft = (chatText) => request('/ai/extract-draft', {
  method: 'POST',
  body: JSON.stringify({ chatText })
});

export const apiGeneratePitch = (brandName, objective, serviceName, serviceRate, tone, creatorProfile, displayFollowers) => request('/ai/generate-pitch', {
  method: 'POST',
  body: JSON.stringify({ brandName, objective, serviceName, serviceRate, tone, creatorProfile, displayFollowers })
});

export const apiAnalyzeClause = (clauseText) => request('/ai/analyze-clause', {
  method: 'POST',
  body: JSON.stringify({ clauseText })
});

export const apiGetBriefing = () => request('/ai/briefing');

export const apiOptimizeRates = (targetIncome) => request('/ai/optimize-rates', {
  method: 'POST',
  body: JSON.stringify({ targetIncome })
});




