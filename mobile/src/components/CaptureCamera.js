import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors } from '../theme/colors';
import { radius, shadows } from '../theme/layout';
import { sans } from '../theme/typography';
import { CloseButton } from './Header';

// Gemeinsame Kamera-Ansicht fuer Scan- und Doktor-Flow: dunkle Vorschau mit
// vier Eckwinkeln und grossem Ausloeser, exakt wie im Briefing beschrieben.
// Faellt ohne Kamera-Berechtigung (oder auf Plattformen ohne Kamera, z. B.
// im Browser-Preview ohne Geraetezugriff) auf einen Demo-Ausloeser zurueck,
// damit der Flow trotzdem durchgetestet werden kann.
export function CaptureCamera({ title, subtitle, onCapture, onCancel }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const cameraRef = useRef(null);

  // Kamera soll sich sofort oeffnen, nicht erst nach einem Tap auf einen
  // Platzhalter-Button - also die Berechtigung direkt beim Betreten
  // dieses Screens anfragen, solange sie noch nicht (endgueltig) verweigert ist.
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission?.granted, permission?.canAskAgain]);

  async function shoot() {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
      onCapture(photo?.uri || null);
    } catch {
      onCapture(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <CloseButton onPress={onCancel} />
      </View>

      <View style={styles.frame}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" onCameraReady={() => setReady(true)} />
        ) : (
          <View style={styles.noPermission}>
            <Text style={styles.noPermissionText}>Kamera-Vorschau</Text>
            <Pressable onPress={requestPermission} style={styles.permBtn}>
              <Text style={styles.permBtnText}>Kamera erlauben</Text>
            </Pressable>
          </View>
        )}
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      <View style={styles.shutterRow}>
        <Pressable onPress={permission?.granted && ready ? shoot : () => onCapture(null)} style={[styles.shutter, shadows.shutter]}>
          <View style={styles.shutterInner} />
        </Pressable>
        {!permission?.granted && <Text style={styles.demoHint}>Ohne Kamera-Zugriff: Foto wird simuliert.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  title: { ...sans(800, 26, { color: colors.ink, letterSpacing: -0.6 }) },
  subtitle: { ...sans(600, 14, { color: colors.mut, marginTop: 3 }) },
  frame: { flex: 1, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: '#3A342E' },
  noPermission: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  noPermissionText: { ...sans(600, 12, { color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }) },
  permBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10 },
  permBtnText: { ...sans(700, 13, { color: '#fff' }) },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#fff' },
  tl: { top: 18, left: 18, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 18, right: 18, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 18, left: 18, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 18, right: 18, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  shutterRow: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  shutter: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.btn, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)' },
  demoHint: { ...sans(600, 11.5, { color: colors.mut }) }
});
