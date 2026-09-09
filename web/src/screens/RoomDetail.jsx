import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PlantCard } from '../components/PlantCard.jsx';
import { roomColor } from '../lib/roomColors.js';

export function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const store = useOutletContext();
  const { rooms, plants, fixPlant } = store;
  const room = rooms.find((r) => r.id === roomId);
  const list = plants.filter((p) => p.room?.id === roomId);

  if (!room) return <div className="empty-state">Raum nicht gefunden.</div>;

  return (
    <>
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate('/raeume')}>← Räume</button>
      </div>
      <div className="room-title" style={{ fontSize: 22, marginBottom: 4 }}>
        <span className="room-dot" style={{ background: roomColor(room.id), width: 12, height: 12 }} />
        {room.name}
      </div>
      <div className="sub" style={{ marginBottom: 18 }}>{list.length} {list.length === 1 ? 'Pflanze' : 'Pflanzen'}</div>

      <div className="plant-grid">
        {list.map((p) => <PlantCard key={p.id} plant={p} onFix={fixPlant} />)}
      </div>
      {list.length === 0 && <div className="empty-state">Noch keine Pflanze in diesem Raum.</div>}
      <button className="fab" onClick={() => navigate(`/neu?raum=${room.id}`)} aria-label="Pflanze hinzufügen">+</button>
    </>
  );
}
