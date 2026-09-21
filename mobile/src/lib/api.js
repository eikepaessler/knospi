import { API_BASE_URL } from './config';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Anfrage fehlgeschlagen (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getRooms: () => request('/rooms'),
  createRoom: (name) => request('/rooms', { method: 'POST', body: JSON.stringify({ name }) }),
  renameRoom: (id, name) => request(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),

  getPlantTypes: () => request('/plant-types'),

  getPlants: () => request('/plants'),
  getPlant: (id) => request(`/plants/${id}`),
  getReadings: (id, limit = 60) => request(`/plants/${id}/readings?limit=${limit}`),
  createPlant: (data) => request('/plants', { method: 'POST', body: JSON.stringify(data) }),
  updatePlant: (id, patch) => request(`/plants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deletePlant: (id) => request(`/plants/${id}`, { method: 'DELETE' }),
  assignSensor: (id, sensorId) => request(`/plants/${id}/sensor`, { method: 'POST', body: JSON.stringify({ sensorId }) }),
  pairRealSensor: (id, input) => request(`/plants/${id}/sensor/real`, { method: 'POST', body: JSON.stringify({ input }) }),
  removeSensor: (id) => request(`/plants/${id}/sensor`, { method: 'DELETE' }),
  water: (id) => request(`/plants/${id}/water`, { method: 'POST' }),
  fix: (id) => request(`/plants/${id}/fix`, { method: 'POST' }),
  addPhoto: (id, uri, note) => request(`/plants/${id}/photos`, { method: 'POST', body: JSON.stringify({ uri, note }) }),
  addDiagnosis: (id, data) => request(`/plants/${id}/diagnoses`, { method: 'POST', body: JSON.stringify(data) }),
  healDiagnosis: (id, diagId) => request(`/plants/${id}/diagnoses/${diagId}/heal`, { method: 'PATCH' }),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getSettings: () => request('/settings'),
  updateSettings: (patch) => request('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),

  getStickers: () => request('/stickers'),
  getWeek: () => request('/week'),

  registerPush: (token) => request('/push/register', { method: 'POST', body: JSON.stringify({ token }) }),
  unregisterPush: (token) => request('/push/unregister', { method: 'POST', body: JSON.stringify({ token }) })
};
