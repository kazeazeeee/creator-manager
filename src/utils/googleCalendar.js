// Google Calendar Client-side OAuth2 Integration

export const getGoogleAuthUrl = (clientId) => {
  const redirectUri = window.location.origin;
  const scope = 'https://www.googleapis.com/auth/calendar.events';
  const responseType = 'token';
  
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;
};

export const parseAuthHash = () => {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const expiresIn = params.get('expires_in');

  if (accessToken) {
    // Clear hash from URL
    window.history.replaceState(null, null, window.location.pathname + window.location.search);
    return {
      token: accessToken,
      expiresAt: Date.now() + parseInt(expiresIn) * 1000
    };
  }

  return null;
};

// Fetch upcoming calendar events from Google Calendar
export const fetchGoogleEvents = async (accessToken) => {
  const timeMin = new Date().toISOString();
  const maxResults = 15;
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil kalender Google: ${response.status}`);
  }

  const data = await response.json();
  return (data.items || []).map(event => ({
    id: event.id,
    title: event.summary,
    start: event.start?.date || event.start?.dateTime?.substring(0, 10),
    type: event.summary.toLowerCase().includes('syuting') ? 'personal' : 
          event.summary.toLowerCase().includes('meeting') ? 'brand' : 'deadline',
    brand: event.description || ''
  }));
};

// Add new event to Google Calendar
export const createGoogleEvent = async (accessToken, eventData) => {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  const body = {
    summary: eventData.title,
    description: eventData.brand || '',
    start: {
      date: eventData.date // YYYY-MM-DD
    },
    end: {
      date: eventData.date // YYYY-MM-DD
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Gagal menambahkan event ke Google Calendar.');
  }

  return response.json();
};
