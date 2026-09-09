// Web-Bluetooth-Anbindung fuer echte Pflanzensensoren.
//
// Die Web Bluetooth API kann echte BLE-Gerate in der Naehe auswaehlen lassen
// (funktioniert in Chrome/Edge auf Desktop & Android, nicht in Safari/iOS).
// Um tatsaechliche Messwerte (Erdfeuchte, Licht, Temperatur, Luftfeuchte)
// auszulesen, braucht es die GATT-Service-/Characteristic-UUIDs des
// jeweiligen Sensor-Modells (z. B. Xiaomi Mi Flora / Flower Care hat dafuer
// eine dokumentierte, aber proprietaere Characteristic). Sobald feststeht,
// welche Hardware zum Einsatz kommt, wird hier:
//   1. requestDevice() mit einem passenden `filters: [{ services: [...] }]`
//      aufgerufen statt acceptAllDevices,
//   2. die GATT-Characteristic abonniert (startNotifications) oder
//      periodisch gelesen (readValue),
//   3. der DataView in { soilMoisture, lightLux, temperature, humidity }
//      dekodiert und per api-Client an POST /api/sensors/:id/readings
//      geschickt - also exakt dieselbe Route, die auch der Server-seitige
//      Simulator (server/src/services/simulator.js) fuer applyReading()
//      nutzt. Backend, Datenbank und Benachrichtigungslogik bleiben dabei
//      unveraendert.
export const bluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

export async function requestBluetoothSensor() {
  if (!bluetoothSupported) {
    throw new Error('Web Bluetooth wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge (Desktop oder Android) verwenden.');
  }
  const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
  return { id: device.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase(), name: device.name || 'Sensor' };
}
