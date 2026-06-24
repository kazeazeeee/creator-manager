import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageCircle,
  Sparkles, 
  KanbanSquare, 
  Settings,
  Image,
  BarChart3,
  Users,
  FileEdit,
  Shield,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const allMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, role: 'all' },
    { id: 'pipeline', label: 'Alur Konten', icon: KanbanSquare, role: 'all' },
    { id: 'ai-portal', label: 'Pusat Asisten', icon: Users, role: 'admin' },
    { id: 'conversation', label: 'Diskusi Manajer', icon: MessageCircle, role: 'admin' },
    { id: 'toolkit', label: 'Perangkat Kreator', icon: Sparkles, role: 'admin' },
    { id: 'mediakit', label: 'Media Kit PDF', icon: Image, role: 'admin' },
    { id: 'analytics', label: 'Analitik Performa', icon: BarChart3, role: 'admin' },
    { id: 'note', label: 'Note', icon: FileEdit, role: 'all' },
    { id: 'invoices', label: 'Invoice & Bayar', icon: FileText, role: 'admin' },
    { id: 'calendar', label: 'Kalender', icon: Calendar, role: 'all' },
    { id: 'settings', label: 'Setelan', icon: Settings, role: 'all' },
    { id: 'admin-dashboard', label: 'Kelola Pengguna', icon: Shield, role: 'admin' }
  ];

  // Filter menu items: Admin sees all, User sees role === 'all'
  const menuItems = allMenuItems.filter(item => {
    if (item.role === 'all') return true;
    return currentUser?.role === 'admin';
  });

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand">
        TEAM <span>urufachan</span>
      </div>
      
      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <li 
              key={item.id} 
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <button onClick={() => setActiveTab(item.id)}>
                <IconComponent size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ backgroundColor: 'var(--accent-color)', color: '#fff', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {currentUser?.username ? currentUser.username.trim().charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="user-name">{currentUser?.username || 'Creator'}</span>
              <span className="user-role" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {currentUser?.role === 'admin' ? 'Administrator' : 'Staf'}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '6px',
              borderRadius: 'var(--border-radius-sm)',
              transition: 'color var(--transition-speed), background-color var(--transition-speed)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger-color)'; e.currentTarget.style.backgroundColor = 'var(--danger-light)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

