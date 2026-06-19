export const THEMES = {
  dark:       { bg:'#282c34', fg:'#9cdef2', panel:'#181a1f', border:'#355a66', red:'#e06c75', label: 'Odysseus Dark' },
  light:      { bg:'#f8fafc', fg:'#0f172a', panel:'#ffffff', border:'#e2e8f0', red:'#3b82f6', label: 'Odysseus Light' },
  midnight:   { bg:'#0d1117', fg:'#c9d1d9', panel:'#161b22', border:'#30363d', red:'#f85149', label: 'Midnight Blue' },
  paper:      { bg:'#faf8f5', fg:'#3b3836', panel:'#ffffff', border:'#d5d0c8', red:'#c5ac4a', label: 'Vintage Paper' },
  cyberpunk:  { bg:'#0a0a0f', fg:'#0ff0fc', panel:'#12101a', border:'#9b30ff', red:'#e040fb', label: 'Neon Cyberpunk' },
  retrowave:  { bg:'#1a1a2e', fg:'#e94560', panel:'#16213e', border:'#533483', red:'#e94560', label: 'Retro Wave' },
  forest:     { bg:'#1b2a1b', fg:'#a8d5a2', panel:'#142414', border:'#3d6b3d', red:'#7cb871', label: 'Forest Green' },
  ocean:      { bg:'#0b1a2c', fg:'#64d2ff', panel:'#091422', border:'#1e5074', red:'#4facfe', label: 'Deep Ocean' },
  ume:        { bg:'#2b1b2e', fg:'#f5c2e7', panel:'#1e1420', border:'#6c4675', red:'#f5a0c0', label: 'Ume Blossom' },
  copper:     { bg:'#1c1410', fg:'#e8c39e', panel:'#140f0a', border:'#7a5533', red:'#d4764e', label: 'Copper Rust' },
  terminal:   { bg:'#000000', fg:'#00ff41', panel:'#0a0a0a', border:'#003b00', red:'#00ff41', label: 'Matrix Terminal' },
  cute:       { bg:'#fff0f5', fg:'#d4608a', panel:'#fff8fa', border:'#f0c0d0', red:'#ff6b9d', label: 'Cute Pink' }
};

export const applyTheme = (themeName) => {
  const activeTheme = THEMES[themeName] || THEMES.dark;
  const root = document.documentElement;
  
  root.style.setProperty('--bg-primary', activeTheme.bg);
  root.style.setProperty('--bg-secondary', activeTheme.panel);
  
  // Derive bg-tertiary
  let bgTertiary = activeTheme.panel;
  if (themeName === 'dark') {
    bgTertiary = '#111111';
  } else if (themeName === 'light') {
    bgTertiary = '#f1f5f9';
  } else if (themeName === 'paper') {
    bgTertiary = '#f4efe6';
  } else if (themeName === 'terminal') {
    bgTertiary = '#050505';
  } else if (activeTheme.bg === '#0d1117') {
    bgTertiary = '#090d13';
  } else if (activeTheme.bg === '#0a0a0f') {
    bgTertiary = '#050508';
  }
  root.style.setProperty('--bg-tertiary', bgTertiary);
  
  root.style.setProperty('--border-color', activeTheme.border);
  
  // Border hover calculation (shift brightness slightly)
  root.style.setProperty('--border-hover', activeTheme.border);
  
  root.style.setProperty('--text-primary', activeTheme.fg);
  
  // Determine light/dark mode for secondary texts
  const isDark = activeTheme.bg.startsWith('#0') || activeTheme.bg.startsWith('#1') || activeTheme.bg.startsWith('#2') || activeTheme.bg === '#2b1b2e' || activeTheme.bg === '#1c1410';
  root.style.setProperty('--text-secondary', isDark ? '#828997' : (themeName === 'light' ? '#475569' : '#5a5248'));
  root.style.setProperty('--text-muted', isDark ? '#5c6370' : (themeName === 'light' ? '#94a3b8' : '#8e867a'));
  
  root.style.setProperty('--accent-color', activeTheme.red);
  root.style.setProperty('--accent-hover', activeTheme.red);
  
  // Convert hex to rgba for accent-light
  const hex = activeTheme.red.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  root.style.setProperty('--accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
  
  // Set feedback state colors depending on light vs dark
  if (!isDark) {
    root.style.setProperty('--success-color', '#10b981');
    root.style.setProperty('--success-light', 'rgba(16, 185, 129, 0.05)');
    root.style.setProperty('--warning-color', '#d97706');
    root.style.setProperty('--warning-light', 'rgba(217, 119, 6, 0.05)');
    root.style.setProperty('--danger-color', '#ef4444');
    root.style.setProperty('--danger-light', 'rgba(239, 68, 68, 0.05)');
  } else {
    root.style.setProperty('--success-color', '#50fa7b');
    root.style.setProperty('--success-light', 'rgba(80, 250, 123, 0.05)');
    root.style.setProperty('--warning-color', '#f0ad4e');
    root.style.setProperty('--warning-light', 'rgba(240, 173, 78, 0.05)');
    root.style.setProperty('--danger-color', '#ff4444');
    root.style.setProperty('--danger-light', 'rgba(255, 68, 68, 0.05)');
  }
};

export const applyFont = (fontPreference) => {
  const root = document.documentElement;
  if (fontPreference === 'sans-serif') {
    root.style.setProperty('--font-sans', "'Outfit', 'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif");
  } else {
    root.style.setProperty('--font-sans', "'Fira Code', Consolas, Monaco, monospace");
  }
};
