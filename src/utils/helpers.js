// Currency and Date Format Helpers
export const formatCurrency = (value, currency = 'IDR') => {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Seed Data for First Run
export const seedProfile = {
  name: ' Jessica Hartono',
  handle: '@jessicahartono',
  rates: 5000000,
  currency: 'IDR',
  niche: 'Beauty & Lifestyle Tech'
};

export const seedInvoices = [
  {
    id: 'INV-2026-001',
    clientName: 'Wardah Beauty',
    clientEmail: 'finance@wardah.com',
    projectName: 'Instagram Campaign - Light Cushion',
    amount: 7500000,
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    status: 'paid', // paid, pending, overdue
    items: [
      { description: '1x Instagram Carousel Post (Product Launch)', qty: 1, rate: 5000000 },
      { description: '3x Instagram Story Frames with Links', qty: 3, rate: 833333 }
    ]
  },
  {
    id: 'INV-2026-002',
    clientName: 'Tokopedia',
    clientEmail: 'sponsor@tokopedia.com',
    projectName: 'YouTube Integration - Promo Guncang',
    amount: 12000000,
    issueDate: '2026-06-10',
    dueDate: '2026-06-25',
    status: 'pending',
    items: [
      { description: '1x Dedicated Video integration (1.5 - 2 mins)', qty: 1, rate: 12000000 }
    ]
  },
  {
    id: 'INV-2026-003',
    clientName: 'Gojek Indonesia',
    clientEmail: 'billing@gojek.com',
    projectName: 'TikTok Sponsorship - GoFood Promo',
    amount: 4500000,
    issueDate: '2026-05-15',
    dueDate: '2026-05-30',
    status: 'overdue',
    items: [
      { description: '1x TikTok Video (Review GoFood hemat)', qty: 1, rate: 4500000 }
    ]
  }
];

export const seedPipelineTasks = [
  {
    id: 'task-1',
    title: 'Review Skincare Wardah Cushion',
    brand: 'Wardah Beauty',
    platform: 'Instagram',
    status: 'review', // idea, script, production, editing, review, published
    dueDate: '2026-06-18',
    deliverables: '1x Carousel, 3x Stories',
    notes: 'Tonjolkan transferproof & skin-like finish. Baju warna pastel.'
  },
  {
    id: 'task-2',
    title: 'Review GoFood Hemat Martabak',
    brand: 'Gojek Indonesia',
    platform: 'TikTok',
    status: 'published',
    dueDate: '2026-05-28',
    deliverables: '1x TikTok Video',
    notes: 'Hashtag wajib #GoFoodHemat #PastiAdaJalan.'
  },
  {
    id: 'task-3',
    title: 'Setup Meja Kerja Minimalis Baru',
    brand: 'Logitech',
    platform: 'YouTube',
    status: 'production',
    dueDate: '2026-06-22',
    deliverables: '1x Dedicated Video integration',
    notes: 'Review Mouse MX Master 3S & keyboard. Fokus ke kenyamanan produktivitas.'
  },
  {
    id: 'task-4',
    title: 'Unboxing HP Lipat Terbaru',
    brand: 'Samsung',
    platform: 'Instagram',
    status: 'script',
    dueDate: '2026-06-25',
    deliverables: '1x Reels Video',
    notes: 'Fokus ke fungsionalitas hands-free flex mode.'
  },
  {
    id: 'task-5',
    title: 'Tips Konsisten Konten Kreator',
    brand: 'Personal Brand',
    platform: 'YouTube',
    status: 'idea',
    dueDate: '2026-07-05',
    deliverables: '1x Video Panjang',
    notes: 'Bagiin time management spreadsheet. Ga ada sponsor.'
  }
];

export const seedCalendarEvents = [
  {
    id: 'event-1',
    title: 'Wardah Cushion Content Review Due',
    start: '2026-06-18',
    type: 'deadline',
    brand: 'Wardah Beauty'
  },
  {
    id: 'event-2',
    title: 'Syuting: Logitech Setup Meja',
    start: '2026-06-20',
    type: 'personal',
    brand: 'Logitech'
  },
  {
    id: 'event-3',
    title: 'Logitech Integration Draft Due',
    start: '2026-06-22',
    type: 'deadline',
    brand: 'Logitech'
  },
  {
    id: 'event-4',
    title: 'Meeting Brand Tokopedia Campaign',
    start: '2026-06-19',
    type: 'brand',
    brand: 'Tokopedia'
  }
];

export const getLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return defaultValue;
  }
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
