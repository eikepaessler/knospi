const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
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

  getPlantTypes: () => request('/plant-types'),

  getPlants: () => request('/plants'),
  getPlant: (id) => request(`/plants/${id}`),
  getReadings: (id, limit = 100) => request(`/plants/${id}/readings?limit=${limit}`),
  createPlant: (data) => request('/plants', { method: 'POST', body: JSON.stringify(data) }),
  updatePlant: (id, patch) => request(`/plants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deletePlant: (id) => request(`/plants/${id}`, { method: 'DELETE' }),
  assignSensor: (id, sensorId) => request(`/plants/${id}/sensor`, { method: 'POST', body: JSON.stringify({ sensorId }) }),
  removeSensor: (id) => request(`/plants/${id}/sensor`, { method: 'DELETE' }),
  water: (id) => request(`/plants/${id}/water`, { method: 'POST' }),
  fertilize: (id) => request(`/plants/${id}/fertilize`, { method: 'POST' }),
  fix: (id) => request(`/plants/${id}/fix`, { method: 'POST' }),

  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  getSettings: () => request('/settings'),
  updateSettings: (patch) => request('/settings', { method: 'PATCH', body: JSON.stringify(patch) }),

  getPushPublicKey: () => request('/push/public-key'),
  subscribePush: (sub) => request('/push/subscribe', { method: 'POST', body: JSON.stringify(sub) }),
  unsubscribePush: (endpoint) => request('/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) })
};
