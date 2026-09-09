import { useNavigate } from 'react-router-dom';
import { toneForStatus, timeAgo } from '../lib/tone.js';

export function NotificationsSheet({ notifications, onClose, onMarkAllRead, onOpenNotification }) {
  const navigate = useNavigate();

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Benachrichtigungen</h2>
          {notifications.some((n) => !n.read) && (
            <button className="ghost-btn" style={{ width: 'auto', padding: '6px 12px' }} onClick={onMarkAllRead}>
              Alle gelesen
            </button>
          )}
        </div>
        {notifications.length === 0 && <div className="empty-state">Noch nichts zu vermelden. Alles ruhig.</div>}
        {notifications.map((n) => (
          <div
            key={n.id}
            className="notif-item"
            style={{ cursor: 'pointer', opacity: n.read ? 0.6 : 1 }}
            onClick={() => { onOpenNotification(n); navigate(`/pflanze/${n.plantId}`); onClose(); }}
          >
            <div className="notif-dot" style={{ background: toneForStatus(n.status === 'ok' ? 'ok' : 'low') }} />
            <div>
              <div className="notif-text">{n.message}</div>
              <div className="notif-time">{timeAgo(n.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
