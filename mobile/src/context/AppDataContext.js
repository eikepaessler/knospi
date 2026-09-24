import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api } from '../lib/api';

const AppDataContext = createContext(null);

const POLL_MS = 60_000; // "im Minutentakt", siehe Briefing

export function AppDataProvider({ children }) {
  const [plants, setPlants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ push: true, dryReminder: true, weeklyRecap: true, offerRead: false });
  const [stickers, setStickers] = useState([]);
  const [week, setWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  // Unterscheidet "wirklich noch keine Pflanze angelegt" von "Server gerade
  // nicht erreichbar" - beides sah bisher identisch aus (leere Liste), was
  // beim Nutzer den Eindruck erweckte, seine Pflanzen seien verschwunden.
  const [serverError, setServerError] = useState(false);
  const [toast, setToast] = useState('');
  const [reward, setReward] = useState(null); // Sticker-Freischalt-Overlay
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }, []);

  const showReward = useCallback((sticker) => {
    if (!sticker) return;
    setReward(sticker);
    setTimeout(() => setReward(null), 3000);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [p, r, t, n, s, st, w] = await Promise.all([
        api.getPlants(), api.getRooms(), api.getPlantTypes(), api.getNotifications(), api.getSettings(), api.getStickers(), api.getWeek()
      ]);
      setPlants(p); setRooms(r); setPlantTypes(t); setNotifications(n); setSettings(s); setStickers(st); setWeek(w);
      setServerError(false);
    } catch (err) {
      console.warn('Aktualisierung fehlgeschlagen:', err.message);
      setServerError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Zieht Daten beim Start, bei jedem Zurueckkehren in den Vordergrund und
  // danach im Minutentakt - exakt nach Briefing (kein Postfach/SSE noetig).
  useEffect(() => {
    refreshAll();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshAll();
    });
    const interval = setInterval(refreshAll, POLL_MS);
    return () => { sub.remove(); clearInterval(interval); };
  }, [refreshAll]);

  const applyPlant = useCallback((plant) => {
    setPlants((prev) => (prev.some((p) => p.id === plant.id) ? prev.map((p) => (p.id === plant.id ? plant : p)) : [...prev, plant]));
  }, []);

  const fixPlant = useCallback(async (id) => {
    const { plant, reward: r } = await api.fix(id);
    applyPlant(plant);
    showToast(plant.mood === 'happy' ? `${plant.name} ist wieder rundum wohl.` : `Notiert. ${plant.name} meldet sich, wenn noch was ist.`);
    showReward(r);
    return plant;
  }, [applyPlant, showToast, showReward]);

  const waterPlant = useCallback(async (id) => {
    const { plant, reward: r } = await api.water(id);
    applyPlant(plant);
    showToast(`${plant.name} wurde gegossen.`);
    showReward(r);
    return plant;
  }, [applyPlant, showToast, showReward]);

  const assignSensor = useCallback(async (id, sensorId) => {
    const plant = await api.assignSensor(id, sensorId);
    applyPlant(plant);
    showToast(`${plant.name} hat jetzt einen Sensor. Ab jetzt hört sie zu.`);
    return plant;
  }, [applyPlant, showToast]);

  const pairRealSensor = useCallback(async (id, input) => {
    const plant = await api.pairRealSensor(id, input);
    applyPlant(plant);
    showToast(`${plant.name} ist mit dem echten Sensor verbunden.`);
    return plant;
  }, [applyPlant, showToast]);

  const removeSensor = useCallback(async (id) => {
    const plant = await api.removeSensor(id);
    applyPlant(plant);
    return plant;
  }, [applyPlant]);

  const addPlant = useCallback(async (data) => {
    const plant = await api.createPlant(data);
    setPlants((prev) => [...prev, plant]);
    return plant;
  }, []);

  const removePlant = useCallback(async (id) => {
    await api.deletePlant(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePlant = useCallback(async (id, patch) => {
    const plant = await api.updatePlant(id, patch);
    applyPlant(plant);
    return plant;
  }, [applyPlant]);

  const addRoom = useCallback(async (name) => {
    const room = await api.createRoom(name);
    setRooms((prev) => [...prev, room]);
    return room;
  }, []);

  const renameRoom = useCallback(async (id, name) => {
    const room = await api.renameRoom(id, name);
    setRooms((prev) => prev.map((r) => (r.id === id ? room : r)));
    return room;
  }, []);

  const deleteRoom = useCallback(async (id) => {
    await api.deleteRoom(id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addPhoto = useCallback(async (id, uri, note) => {
    const plant = await api.addPhoto(id, uri, note);
    applyPlant(plant);
    return plant;
  }, [applyPlant]);

  const addDiagnosis = useCallback(async (id, data) => {
    const plant = await api.addDiagnosis(id, data);
    applyPlant(plant);
    return plant;
  }, [applyPlant]);

  const healDiagnosis = useCallback(async (id, diagId) => {
    const plant = await api.healDiagnosis(id, diagId);
    applyPlant(plant);
    return plant;
  }, [applyPlant]);

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

  const value = useMemo(() => ({
    plants, rooms, plantTypes, notifications, settings, stickers, week, loading, serverError, toast, reward,
    showToast, refreshAll, fixPlant, waterPlant, assignSensor, pairRealSensor, removeSensor,
    addPlant, removePlant, updatePlant, addRoom, renameRoom, deleteRoom, addPhoto, addDiagnosis, healDiagnosis,
    markNotificationRead, markAllRead, updateSettings
  }), [plants, rooms, plantTypes, notifications, settings, stickers, week, loading, serverError, toast, reward,
      showToast, refreshAll, fixPlant, waterPlant, assignSensor, pairRealSensor, removeSensor,
      addPlant, removePlant, updatePlant, addRoom, renameRoom, deleteRoom, addPhoto, addDiagnosis, healDiagnosis,
      markNotificationRead, markAllRead, updateSettings]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData muss innerhalb von AppDataProvider verwendet werden');
  return ctx;
}
