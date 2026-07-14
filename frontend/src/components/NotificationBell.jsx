// components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    
    // Close on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement notifications');
    }
  };

  const unread = notifications.filter(n => !n.lu).length;

  const marquerLue = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/lu`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error('Erreur');
    }
  };

  const toutMarquerLue = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.lu).map(n => 
          api.put(`/notifications/${n.id}/lu`)
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error('Erreur');
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button 
        onClick={() => setShow(!show)} 
        className="relative bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 cursor-pointer transition-all duration-250 flex items-center justify-center"
      >
        <Bell size={16} className="text-gray-500 dark:text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-gray-950 shadow-sm animate-pulse">
            {unread}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-[360px] glass shadow-xl dark:shadow-none rounded-2xl z-50 overflow-hidden flex flex-col max-h-[460px] animate-in slide-in-from-top-3 duration-250">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-gray-900/50">
            <h3 className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={toutMarquerLue}
                  className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                >
                  Tout lu
                </button>
              )}
              <button
                onClick={() => setShow(false)}
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-200 cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">🔔</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  onClick={(e) => marquerLue(notif.id, e)}
                  className={`px-5 py-4 flex items-start gap-3 border-b border-gray-50 dark:border-white/2 cursor-pointer transition-all duration-200 ${
                    index === notifications.length - 1 ? 'border-b-0' : ''
                  } ${!notif.lu ? 'bg-primary/3 dark:bg-primary/2 border-l-3 border-l-primary pl-4' : 'border-l-3 border-l-transparent'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {notif.titre}
                      </h4>
                      {!notif.lu && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="inline-block text-[10px] text-gray-400 dark:text-gray-600 font-bold mt-2">
                      {new Date(notif.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}