import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { PlantFace } from '../components/PlantFace.jsx';
import { toneForMood, toneForStatus, timeAgo } from '../lib/tone.js';
import { bluetoothSupported, requestBluetoothSensor } from '../lib/bluetooth.js';

const METRIC_ORDER = ['soil', 'light', 'temp', 'humidity', 'fert'];
const UNIT = { soil: '%', light: ' lx', temp: '°C', humidity: '%' };

export function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useOutletContext();
  const { plants, fixPlant, waterPlant, fertilizePlant, assignSensor, removeSensor, removePlant, showToast } = store;
  const plant = plants.find((p) => p.id === id);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!plant) return <div className="empty-state">Pflanze wird geladen…</div>;

  const tone = plant.hasSensor ? toneForMood(plant.mood) : 'var(--k-mut)';

  async function withBusy(fn) {
    setBusy(true);
    try { await fn(); } catch (err) { showToast(err.message); } finally { setBusy(false); }
  }

  async function connectRealSensor() {
    await withBusy(async () => {
      const device = await requestBluetoothSensor();
      await assignSensor(plant.id, device.id);
    });
  }

  async function connectSimulatedSensor() {
    await withBusy(() => assignSensor(plant.id));
  }

  return (
    <>
      <div className="back-row">
        <button className="back-btn" onClick={() => navigate(-1)}>← Zurück</button>
      </div>

      <div className="plant-hero">
        <PlantFace face={plant.moodFace} tone={tone} size={92} />
        <div className="name" style={{ marginTop: 12 }}>{plant.name}</div>
        <div className="species">{plant.type.name} · {plant.type.latin}</div>
        <div className="says">{plant.says}</div>
      </div>

      {plant.fixMetric && plant.hasSensor && (
        <button className="fix-btn" style={{ marginBottom: 16 }} disabled={busy} onClick={() => withBusy(() => fixPlant(plant.id))}>
          Ich kümmere mich
        </button>
      )}

      <div className="section-title">Messwerte</div>
      {plant.hasSensor ? (
        <div className="metric-list">
          {METRIC_ORDER.map((key) => {
            const m = plant.metrics[key];
            return (
              <div className="metric-row" key={key}>
                <div>
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">
                    {m.value != null ? `${m.value}${UNIT[key] || ''}` : (key === 'fert' ? timeAgo(plant.fertilizedAt) + ' gedüngt' : '—')}
                  </div>
                </div>
                <span className="metric-chip" style={{ color: toneForStatus(m.status), background: 'var(--k-soft2)' }}>
                  {m.text}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: 10, fontSize: 13.5, color: 'var(--k-mut)' }}>
            Ohne Sensor kann ich dir nicht sagen, wie es {plant.name} geht.
          </div>
          <button className="primary-btn" disabled={busy} onClick={connectRealSensor} style={{ marginBottom: 8 }}>
            Bluetooth-Sensor koppeln
          </button>
          <button className="ghost-btn" disabled={busy} onClick={connectSimulatedSensor}>
            Sensor simulieren (Demo)
          </button>
          {!bluetoothSupported && (
            <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--k-mut)' }}>
              Web Bluetooth wird von diesem Browser nicht unterstützt — nutze Chrome/Edge oder die Demo-Simulation.
            </div>
          )}
        </div>
      )}

      <div className="section-title">Pflege-Aktionen</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <button className="ghost-btn" disabled={busy} onClick={() => withBusy(() => waterPlant(plant.id))}>
          💧 Gießen
        </button>
        <button className="ghost-btn" disabled={busy} onClick={() => withBusy(() => fertilizePlant(plant.id))}>
          🌿 Düngen
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--k-mut)', marginBottom: 6 }}>
        Zuletzt gegossen: {timeAgo(plant.wateredAt)} · zuletzt gedüngt: {timeAgo(plant.fertilizedAt)}
      </div>

      {plant.hasSensor && (
        <>
          <div className="section-title">Sensor</div>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{plant.sensor.id}</div>
              <div style={{ fontSize: 12, color: 'var(--k-mut)' }}>
                Akku {plant.sensor.battery}% · zuletzt gesehen {timeAgo(plant.sensor.lastSeen)}
              </div>
            </div>
            <button className="ghost-btn" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => withBusy(() => removeSensor(plant.id))}>
              Trennen
            </button>
          </div>
        </>
      )}

      <div className="section-title">Über {plant.name}</div>
      <div className="card" style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 14 }}>{plant.type.lore}</div>

      <div className="section-title">Pflegehinweise</div>
      <div className="card">
        <div className="care-item"><b>Licht</b>{plant.type.care.light}</div>
        <div className="care-item"><b>Standort</b>{plant.type.care.spot}</div>
        <div className="care-item"><b>Gießen</b>{plant.type.care.water}</div>
        <div className="care-item"><b>Temperatur</b>{plant.type.care.temp}</div>
        <div className="care-item"><b>Düngen</b>{plant.type.care.food}</div>
      </div>

      <div style={{ marginTop: 24 }}>
        {confirmDelete ? (
          <div className="card">
            <div style={{ marginBottom: 10, fontSize: 13.5 }}>{plant.name} wirklich entfernen?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ghost-btn" onClick={() => setConfirmDelete(false)}>Abbrechen</button>
              <button className="fix-btn" style={{ background: 'var(--k-bad)' }} onClick={() => removePlant(plant.id).then(() => navigate('/'))}>
                Entfernen
              </button>
            </div>
          </div>
        ) : (
          <button className="ghost-btn" onClick={() => setConfirmDelete(true)}>Pflanze entfernen</button>
        )}
      </div>
    </>
  );
}
