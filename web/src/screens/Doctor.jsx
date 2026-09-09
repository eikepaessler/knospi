import { useNavigate, useOutletContext } from 'react-router-dom';
import { PlantFace } from '../components/PlantFace.jsx';
import { toneForMood } from '../lib/tone.js';

export function Doctor() {
  const store = useOutletContext();
  const navigate = useNavigate();
  const { plants, fixPlant } = store;

  const sick = plants.filter((p) => p.hasSensor && p.mood !== 'happy');
  const noSensor = plants.filter((p) => !p.hasSensor);
  const healthy = plants.filter((p) => p.hasSensor && p.mood === 'happy');

  return (
    <>
      <h1 style={{ margin: '4px 0 2px' }}>Doktor</h1>
      <div className="sub" style={{ marginBottom: 18 }}>
        {sick.length === 0 ? 'Aktuell braucht niemand dringend Hilfe.' : `${sick.length} ${sick.length === 1 ? 'Pflanze braucht' : 'Pflanzen brauchen'} Aufmerksamkeit`}
      </div>

      {sick.map((p) => (
        <div key={p.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}
             onClick={() => navigate(`/pflanze/${p.id}`)}>
          <PlantFace face={p.moodFace} tone={toneForMood(p.mood)} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--k-mut)' }}>{p.room?.name} · {p.moodLabel}</div>
          </div>
          <button className="fix-btn" style={{ width: 'auto', padding: '9px 14px' }}
                  onClick={(e) => { e.stopPropagation(); fixPlant(p.id); }}>
            Kümmern
          </button>
        </div>
      ))}

      {noSensor.length > 0 && (
        <>
          <div className="section-title">Ohne Sensor — keine Diagnose möglich</div>
          {noSensor.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, cursor: 'pointer', opacity: 0.85 }}
                 onClick={() => navigate(`/pflanze/${p.id}`)}>
              <PlantFace face="pot" tone="var(--k-mut)" size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--k-mut)' }}>{p.room?.name} · kein Sensor</div>
              </div>
            </div>
          ))}
        </>
      )}

      {sick.length === 0 && (
        <div className="section-title">Alle mit Sensor wohlauf ({healthy.length})</div>
      )}
    </>
  );
}
