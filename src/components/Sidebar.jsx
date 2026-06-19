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
  FileEdit
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, profile }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Alur Konten', icon: KanbanSquare },
    { id: 'ai-portal', label: 'Pusat Asisten', icon: Users },
    { id: 'conversation', label: 'Diskusi Manajer', icon: MessageCircle },
    { id: 'toolkit', label: 'Perangkat Kreator', icon: Sparkles },
    { id: 'mediakit', label: 'Media Kit PDF', icon: Image },
    { id: 'analytics', label: 'Analitik Performa', icon: BarChart3 },
    { id: 'note', label: 'Note', icon: FileEdit },
    { id: 'invoices', label: 'Invoice & Bayar', icon: FileText },
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'settings', label: 'Setelan', icon: Settings },
  ];

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand">
        Creator<span>Manager</span>
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
        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ backgroundColor: 'var(--accent-color)', color: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.name ? profile.name.trim().charAt(0).toUpperCase() : 'C'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="user-name">{profile?.name || 'Creator'}</span>
            <span className="user-role">{profile?.handle || '@handle'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
