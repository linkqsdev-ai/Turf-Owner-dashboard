import { CalendarCheck, AlertTriangle, MessageSquare, Tag, CheckCircle2, Trash2, Bell, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'booking', title: 'Network Reservation', message: 'Alex Johnson initialized Premium 5v5 Arena for Oct 24, 18:00.', time: '10 mins ago', unread: true, icon: CalendarCheck, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  { id: 2, type: 'alert', title: 'Payment Integrity', message: 'Booking BK-7832 transaction checksum failed. Protocol active.', time: '1 hour ago', unread: true, icon: AlertTriangle, color: 'text-status-danger', bg: 'bg-status-danger/10' },
  { id: 3, type: 'message', title: 'Direct Transmission', message: 'Sarah Miller requested a temporal shift for her reservation.', time: '3 hours ago', unread: false, icon: MessageSquare, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
  { id: 4, type: 'promo', title: 'Offer Validation', message: 'Code ELITE_PULSE was authorized by Team Velocity.', time: 'Yesterday', unread: false, icon: Tag, color: 'text-brand-primary', bg: 'bg-brand-primary/5' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const deleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="w-full space-y-8 relative px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between md:items-end gap-5">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center">
            System <span className="text-brand-primary ml-2">Relays</span>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="ml-4 bg-status-danger text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm"
              >
                {unreadCount} Active
              </motion.span>
            )}
          </h1>
          <p className="text-text-secondary text-[13px] mt-0.5">Real-time signal feed from across your facility network.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="bg-white text-text-primary px-5 py-2 rounded-lg font-bold text-[13px] flex items-center justify-center hover:bg-bg-secondary transition-all border border-border-light active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-brand-primary" />
          Clear Relay
        </button>
      </div>

      <div className="bg-white border border-border-light rounded-xl shadow-premium overflow-hidden divide-y divide-border-light">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-bg-secondary rounded-xl flex items-center justify-center mb-6 border border-border-light shadow-inner">
                <Bell className="w-8 h-8 text-brand-primary/20" />
              </div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Signal Clear</h2>
              <p className="text-text-muted text-[13px] mt-1">No active relays in the current queue.</p>
            </motion.div>
          ) : notifications.map((notif, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: idx * 0.05 }}
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={`p-4.5 flex items-start transition-all hover:bg-bg-secondary/40 cursor-pointer relative group ${notif.unread ? 'bg-brand-primary/[0.02]' : ''}`}
            >
              <div className={`p-2.5 rounded-xl mr-4 transition-all border ${notif.unread ? 'border-brand-primary/20 shadow-sm' : 'border-border-light opacity-60'} ${notif.bg}`}>
                <notif.icon className={`w-4 h-4 ${notif.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className={`text-base font-bold tracking-tight transition-colors ${notif.unread ? 'text-text-primary' : 'text-text-muted'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{notif.time}</span>
                </div>
                <p className={`text-[13px] leading-relaxed transition-colors ${notif.unread ? 'text-text-primary' : 'text-text-muted'} font-medium`}>
                  {notif.message}
                </p>
              </div>
              
              <div className="flex items-center ml-6 space-x-4">
                {notif.unread && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/50" />
                )}
                <button 
                  onClick={(e) => deleteNotification(e, notif.id)}
                  className="p-2 text-text-muted hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent"
                  title="Purge Signal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <button className="flex items-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em] hover:text-brand-primary transition-colors py-4">
          <Zap className="w-3.5 h-3.5 mr-3" /> System Diagnostics
        </button>
      </div>
    </div>
  );
}
