import { useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';

export function AddPlant() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const store = useOutletContext();
  const { rooms, plantTypes, addPlant } = store;
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState(plantTypes[0]?.id || '');
  const [roomId, setRoomId] = useState(params.get('raum') || rooms[0]?.id || '');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || !typeId || !roomId) return;
    setBusy(true);
    try {
      const plant = await addPlant({ name: name.trim(), typeId, roomId });
      navigate(`/pflanze/${plant.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate(-1)}>← Zurück</button>
      </div>
      <h1 style={{ margin: '4px 0 18px' }}>Neue Pflanze</h1>

      <form onSubmit={submit}>
        <div className="form-field">
          <label>Name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Fritz" />
        </div>
        <div className="form-field">
          <label>Art</label>
          <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            {plantTypes.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.latin})</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Raum</label>
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button className="primary-btn" type="submit" disabled={busy}>Pflanze anlegen</button>
      </form>
    </>
  );
}
