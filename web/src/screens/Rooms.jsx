import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { roomColor } from '../lib/roomColors.js';

export function Rooms() {
  const store = useOutletContext();
  const navigate = useNavigate();
  const { rooms, plants, addRoom } = store;
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const room = await addRoom(name.trim());
    setName(''); setAdding(false);
    navigate(`/raum/${room.id}`);
  }

  return (
    <>
      <h1 style={{ margin: '4px 0 2px' }}>Räume</h1>
      <div className="sub" style={{ marginBottom: 18 }}>{rooms.length} Räume</div>

      {rooms.map((room) => {
        const list = plants.filter((p) => p.room?.id === room.id);
        const attention = list.filter((p) => p.hasSensor && p.mood !== 'happy').length;
        return (
          <div key={room.id} className="card" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => navigate(`/raum/${room.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="room-title">
                <span className="room-dot" style={{ background: roomColor(room.id) }} />
                {room.name}
              </div>
              <span className="room-count">{list.length} {list.length === 1 ? 'Freund' : 'Freunde'}</span>
            </div>
            {attention > 0 && (
              <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--k-warn)', fontWeight: 600 }}>
                {attention} {attention === 1 ? 'braucht' : 'brauchen'} Aufmerksamkeit
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={submit} className="card" style={{ marginTop: 6 }}>
          <div className="form-field">
            <label>Neuer Raum</label>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Flur" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="ghost-btn" onClick={() => setAdding(false)}>Abbrechen</button>
            <button type="submit" className="primary-btn">Anlegen</button>
          </div>
        </form>
      ) : (
        <button className="ghost-btn" style={{ marginTop: 6 }} onClick={() => setAdding(true)}>+ Raum hinzufügen</button>
      )}
    </>
  );
}
