import { useNavigate, useOutletContext } from 'react-router-dom';
import { PlantCard } from '../components/PlantCard.jsx';
import { roomColor } from '../lib/roomColors.js';

export function Home() {
  const store = useOutletContext();
  const navigate = useNavigate();
  const { plants, rooms, fixPlant } = store;

  const attention = plants.filter((p) => p.hasSensor && p.mood !== 'happy');
  const groups = rooms.map((r) => ({ room: r, plants: plants.filter((p) => p.room?.id === r.id) }))
    .filter((g) => g.plants.length > 0);

  return (
    <>
      <h1 style={{ margin: '4px 0 2px' }}>Zuhause</h1>
      <div className="sub" style={{ marginBottom: 18 }}>
        {plants.length} {plants.length === 1 ? 'Pflanze' : 'Pflanzen'} bei dir
        {attention.length > 0 ? ` · ${attention.length} ${attention.length === 1 ? 'braucht' : 'brauchen'} dich` : ' · alle wohlauf'}
      </div>

      {groups.map(({ room, plants: roomPlants }) => (
        <div className="room-section" key={room.id}>
          <div className="room-header" onClick={() => navigate(`/raum/${room.id}`)}>
            <div className="room-title">
              <span className="room-dot" style={{ background: roomColor(room.id) }} />
              {room.name}
            </div>
            <span className="room-count">{roomPlants.length} {roomPlants.length === 1 ? 'Pflanze' : 'Pflanzen'}</span>
          </div>
          <div className="plant-grid">
            {roomPlants.map((p) => <PlantCard key={p.id} plant={p} onFix={fixPlant} />)}
          </div>
        </div>
      ))}

      {plants.length === 0 && (
        <div className="empty-state">Noch keine Pflanzen. Leg unter „Räume“ deine erste an.</div>
      )}
      <button className="fab" onClick={() => navigate('/neu')} aria-label="Pflanze hinzufügen">+</button>
    </>
  );
}
