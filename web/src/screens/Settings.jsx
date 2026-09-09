import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { disablePush, enablePush, pushSupported } from '../lib/push.js';

export function Settings() {
  const store = useOutletContext();
  const { settings, updateSettings, showToast } = store;
  const [pushActive, setPushActive] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushActive(!!sub))
      .catch(() => {});
  }, []);

  async function togglePush() {
    setBusy(true);
    try {
      if (pushActive) {
        await disablePush();
        setPushActive(false);
        await updateSettings({ push: false });
      } else {
        await enablePush();
        setPushActive(true);
        await updateSettings({ push: true });
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 style={{ margin: '4px 0 2px' }}>Einstellungen</h1>
      <div className="sub" style={{ marginBottom: 18 }}>Benachrichtigungen und mehr</div>

      <div className="section-title">Push-Benachrichtigungen</div>
      <div className="card">
        <div className="settings-row">
          <div>
            <div className="settings-label">Push aktivieren</div>
            <div className="settings-sub">Benachrichtigung, auch wenn die App geschlossen ist</div>
          </div>
          <button className={'switch' + (pushActive ? ' on' : '')} disabled={busy} onClick={togglePush} />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Nur Dringendes</div>
            <div className="settings-sub">Nur bei akutem Wassermangel benachrichtigen</div>
          </div>
          <button
            className={'switch' + (settings.urgent ? ' on' : '')}
            onClick={() => updateSettings({ urgent: !settings.urgent })}
          />
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Nachtruhe</div>
            <div className="settings-sub">Keine Push-Nachrichten zwischen 22 und 7 Uhr</div>
          </div>
          <button
            className={'switch' + (settings.night ? ' on' : '')}
            onClick={() => updateSettings({ night: !settings.night })}
          />
        </div>
      </div>
      {!pushSupported && (
        <div style={{ fontSize: 11.5, color: 'var(--k-mut)', marginTop: 8 }}>
          Push wird von diesem Browser nicht unterstützt. In-App-Benachrichtigungen funktionieren trotzdem über die Glocke oben.
        </div>
      )}

      <div className="section-title">Über Knospi</div>
      <div className="card" style={{ fontSize: 13, color: 'var(--k-mut)', lineHeight: 1.5 }}>
        Knospi vergleicht die Messwerte deiner Bluetooth-Sensoren mit den Idealbereichen jeder Pflanzenart
        und meldet sich, sobald Erdfeuchte, Licht, Luftfeuchte oder Temperatur nicht mehr passen.
      </div>
    </>
  );
}
