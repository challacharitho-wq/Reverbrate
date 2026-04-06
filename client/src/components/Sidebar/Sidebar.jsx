import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, Search, Library, Clock,
  Upload, Heart, PlusCircle, Music
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home,    label: 'Home',    path: '/dashboard' },
    { icon: Search,  label: 'Search',  path: '/search'    },
    { icon: Library, label: 'Library', path: '/library'   },
    { icon: Upload,  label: 'Upload',  path: '/upload'    },
    { icon: Clock,   label: 'History', path: '/history'   },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{ width: 'var(--sidebar-width)' }}
      className="bg-[var(--bg-secondary)] border-r border-[var(--border)]
                 flex flex-col fixed left-0 top-0
                 h-[calc(100vh-var(--player-height))]
                 overflow-y-auto z-30"
    >
      <div className="p-6 flex flex-col h-full">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-lg
                          flex items-center justify-center
                          shadow-[0_0_20px_var(--accent-glow)]">
            <Music className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight
                           text-white uppercase">
            Reverberate
          </span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg
                 transition-all duration-150 font-medium text-sm
                 ${isActive
                   ? 'bg-[var(--bg-card)] text-[var(--accent-light)] ' +
                     'border-l-2 border-[var(--accent)]'
                   : 'text-[var(--text-secondary)] ' +
                     'hover:bg-[var(--bg-hover)] hover:text-white'
                 }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-[var(--border)] my-6" />

        {/* Playlists Section */}
        <div className="flex-1">
          <p className="px-4 text-[10px] font-bold text-[var(--text-muted)]
                        uppercase tracking-widest mb-3">
            Playlists
          </p>

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5
                       rounded-lg text-[var(--text-secondary)]
                       hover:text-[var(--accent)] hover:bg-[var(--bg-hover)]
                       transition-all text-sm font-medium"
          >
            <PlusCircle size={16} />
            <span>New Playlist</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-2.5
                       rounded-lg text-[var(--text-secondary)]
                       hover:text-white hover:bg-[var(--bg-hover)]
                       transition-all text-sm font-medium"
          >
            <Heart size={16} />
            <span>Liked Songs</span>
          </button>

          {/* Mock playlists */}
          {['Chill Vibes', 'Workout Mix', 'Late Night'].map((name) => (
            <button
              key={name}
              className="w-full flex items-center gap-3 px-4 py-2.5
                         rounded-lg text-[var(--text-muted)]
                         hover:text-white hover:bg-[var(--bg-hover)]
                         transition-all text-sm truncate"
            >
              <Music size={14} />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>

        {/* User Block */}
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]
                            flex items-center justify-center
                            text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[var(--text-muted)] text-xs truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm
                       text-[var(--text-muted)] hover:text-red-400
                       hover:bg-red-400/10 transition-all text-left"
          >
            Sign out
          </button>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;
