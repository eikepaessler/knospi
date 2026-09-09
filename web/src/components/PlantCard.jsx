import { useNavigate } from 'react-router-dom';
import { PlantFace } from './PlantFace.jsx';
import { toneForMood } from '../lib/tone.js';

export function PlantCard({ plant, onFix }) {
  const navigate = useNavigate();
  const tone = plant.hasSensor ? toneForMood(plant.mood) : 'var(--k-mut)';

  return (
    <div className="plant-card" onClick={() => navigate(`/pflanze/${plant.id}`)}>
      <div className="avatar-row">
        <PlantFace face={plant.moodFace} tone={tone} size={44} />
        <span
          className="mood-chip"
          style={{ color: tone, background: plant.hasSensor ? 'var(--k-soft2)' : 'var(--k-soft)' }}
        >
          {plant.moodLabel}
        </span>
      </div>
      <div>
        <div className="name">{plant.name}</div>
        <div className="species">{plant.type.name}</div>
      </div>
      <div className="says">{plant.says}</div>
      {plant.fixMetric && plant.hasSensor && (
        <button
          className="fix-btn"
          onClick={(e) => { e.stopPropagation(); onFix?.(plant.id); }}
        >
          Ich kümmere mich
        </button>
      )}
    </div>
  );
}
