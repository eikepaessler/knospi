import { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { api } from './lib/api.js';
import { useLiveEvents } from './lib/useLiveEvents.js';
import { BottomNav } from './components/BottomNav.jsx';
import { NotificationsSheet } from './components/NotificationsSheet.jsx';

import { Home } from './screens/Home.jsx';
import { Rooms } from './screens/Rooms.jsx';
import { RoomDetail } from './screens/RoomDetail.jsx';
import { PlantDetail } from './screens/PlantDetail.jsx';
import { Doctor } from './screens/Doctor.jsx';
import { Settings } from './screens/Settings.jsx';
import { AddPlant } from './screens/AddPlant.jsx';

function Layout({ store }) {
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const unread = store.notifications.filter((n) => !n.read).length;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 17 }}>
          <span role="img" aria-label="Knospe">🌱</span> Knospi
        </div>
        <button className="icon-btn" onClick={() => setSheetOpen(true)} aria-label="Benachrichtigungen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 10a6 6 0 0112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M10 20a2 2 0 004 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          {unread > 0 && <span className="badge-dot" />}
        </button>
      </div>

      <div className="app-content">
        <Outlet context={store} />
      </div>

      {store.toast && <div className="toast">{store.toast}</div>}
      {sheetOpen && (
        <NotificationsSheet
          notifications={store.notifications}
          onClose={() => setSheetOpen(false)}
          onMarkAllRead={store.markAllRead}
          onOpenNotification={(n) => store.markNotificationRead(n.id)}
        />
      )}
      <BottomNav />
    </div>
  );
}

export default function App() {
  const [plants, setPlants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ push: true, urgent: false, night: true });
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }, []);

  const refreshAll = useCallback(async () => {
    const [p, r, t, n, s] = await Promise.all([
      api.getPlants(), api.getRooms(), api.getPlantTypes(), api.getNotifications(), api.getSettings()
    ]);
    setPlants(p); setRooms(r); setPlantTypes(t); setNotifications(n); setSettings(s);
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  useLiveEvents({
    'plant-updated': (plant) => {
      setPlants((prev) => {
        const exists = prev.some((p) => p.id === plant.id);
        return exists ? prev.map((p) => (p.id === plant.id ? plant : p)) : [...prev, plant];
      });
    },
    'plant-removed': ({ id }) => setPlants((prev) => prev.filter((p) => p.id !== id)),
    notification: (n) => setNotifications((prev) => [n, ...prev].slice(0, 200))
  });

  const applyPlant = useCallback((plant) => {
    setPlants((prev) => prev.map((p) => (p.id === plant.id ? plant : p)));
  }, []);

  const fixPlant = useCallback(async (id) => {
    const plant = await api.fix(id);
    applyPlant(plant);
    showToast(plant.mood === 'happy' ? `${plant.name} ist wieder rundum wohl.` : `Notiert. ${plant.name} meldet sich, wenn noch was ist.`);
  }, [applyPlant, showToast]);

  const waterPlant = useCallback(async (id) => {
    const plant = await api.water(id);
    applyPlant(plant);
    showToast(`${plant.name} wurde gegossen.`);
  }, [applyPlant, showToast]);

  const fertilizePlant = useCallback(async (id) => {
    const plant = await api.fertilize(id);
    applyPlant(plant);
    showToast(`${plant.name} wurde gedüngt.`);
  }, [applyPlant, showToast]);

  const assignSensor = useCallback(async (id, sensorId) => {
    const plant = await api.assignSensor(id, sensorId);
    applyPlant(plant);
    showToast(`${plant.name} hat jetzt einen Sensor. Ab jetzt hörst du zu.`);
  }, [applyPlant, showToast]);

  const removeSensor = useCallback(async (id) => {
    const plant = await api.removeSensor(id);
    applyPlant(plant);
  }, [applyPlant]);

  const addPlant = useCallback(async (data) => {
    const plant = await api.createPlant(data);
    setPlants((prev) => [...prev, plant]);
    showToast(`${plant.name} ist eingezogen. Willkommen!`);
    return plant;
  }, [showToast]);

  const removePlant = useCallback(async (id) => {
    await api.deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addRoom = useCallback(async (name) => {
    const room = await api.createRoom(name);
    setRooms((prev) => [...prev, room]);
    return room;
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await api.markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await api.markAllRead();
  }, []);

  const updateSettings = useCallback(async (patch) => {
    const next = await api.updateSettings(patch);
    setSettings(next);
  }, []);

  const store = useMemo(() => ({
    plants, rooms, plantTypes, notifications, settings, toast,
    showToast, fixPlant, waterPlant, fertilizePlant, assignSensor, removeSensor,
    addPlant, removePlant, addRoom, markNotificationRead, markAllRead, updateSettings
  }), [plants, rooms, plantTypes, notifications, settings, toast, showToast, fixPlant, waterPlant,
      fertilizePlant, assignSensor, removeSensor, addPlant, removePlant, addRoom,
      markNotificationRead, markAllRead, updateSettings]);

  return (
    <Routes>
      <Route element={<Layout store={store} />}>
        <Route path="/" element={<Home />} />
        <Route path="/raeume" element={<Rooms />} />
        <Route path="/raum/:roomId" element={<RoomDetail />} />
        <Route path="/pflanze/:id" element={<PlantDetail />} />
        <Route path="/doktor" element={<Doctor />} />
        <Route path="/einstellungen" element={<Settings />} />
        <Route path="/neu" element={<AddPlant />} />
      </Route>
    </Routes>
  );
}
