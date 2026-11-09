import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraType,
  CameraView,
  FlashMode,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { router } from "expo-router";
import { theme } from "@/lib/theme";
import { ShutterButton } from "@/components/ShutterButton";
import { LensCarousel } from "@/components/LensCarousel";
import { BeautySliders } from "@/components/BeautySliders";
import { ModeSwitch } from "@/components/ModeSwitch";
import { IconToggle } from "@/components/IconToggle";
import { PermissionPrompt } from "@/components/PermissionPrompt";
import { LensTintOverlay } from "@/components/LensTintOverlay";
import { Button } from "@/components/Button";
import { getActiveBeautyPreset, getLenses, saveActiveBeautyPreset } from "@/lib/data/store";
import type { BeautyPreset, Lens } from "@/lib/data/types";
import { DEFAULT_BEAUTY } from "@/lib/data/types";

type Sheet = "none" | "lenses" | "beauty";

export default function CameraScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("front");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [recording, setRecording] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("none");
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null);
  const [beauty, setBeauty] = useState<BeautyPreset>({
    id: "pending",
    ...DEFAULT_BEAUTY,
    updatedAt: "",
  });
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  useEffect(() => {
    getLenses().then(setLenses);
    getActiveBeautyPreset().then(setBeauty);
  }, []);

  if (!cameraPermission || !micPermission) {
    return <View style={styles.root} role="main" />;
  }

  if (!cameraPermission.granted) {
    return (
      <PermissionPrompt
        title="Camera access"
        body="Frankframe needs your camera to show the live preview and take photos or videos."
        canAskAgain={cameraPermission.canAskAgain}
        onRequest={requestCameraPermission}
      />
    );
  }

  if (mode === "video" && !micPermission.granted) {
    return (
      <PermissionPrompt
        title="Microphone access"
        body="Video with sound needs microphone access — you can still take photos without it."
        canAskAgain={micPermission.canAskAgain}
        onRequest={requestMicPermission}
      />
    );
  }

  async function handleLensSelect(lens: Lens | null) {
    setSelectedLens(lens);
    if (lens?.category === "beauty_preset") {
      const next = await saveActiveBeautyPreset({ skinSmooth: 60, skinTone: 40 });
      setBeauty(next);
    }
  }

  async function handleBeautyChange(patch: Partial<BeautyPreset>) {
    const next = await saveActiveBeautyPreset(patch);
    setBeauty(next);
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (!photo) return;
    goToReview(photo.uri, "photo", null);
  }

  async function toggleVideo() {
    if (!cameraRef.current) return;
    if (recording) {
      cameraRef.current.stopRecording();
      return;
    }
    setRecording(true);
    const result = await cameraRef.current.recordAsync({ maxDuration: 30 });
    setRecording(false);
    if (result?.uri) goToReview(result.uri, "video", null);
  }

  function goToReview(uri: string, type: "photo" | "video", durationMs: number | null) {
    router.push({
      pathname: "/review",
      params: {
        uri,
        type,
        lensId: selectedLens?.id ?? "",
        durationMs: durationMs ? String(durationMs) : "",
      },
    });
  }

  return (
    <View style={styles.root} role="main">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode={mode === "photo" ? "picture" : "video"}
        mute={false}
      />
      <LensTintOverlay lens={selectedLens} beauty={beauty} />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.topBar}>
          <IconToggle
            glyph={flash === "off" ? "⚡︎" : "⚡"}
            label={`Flash: ${flash}`}
            active={flash !== "off"}
            onPress={() => setFlash(flash === "off" ? "on" : flash === "on" ? "auto" : "off")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Text style={styles.settingsGlyph}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.bottomArea}>
          <ModeSwitch value={mode} onChange={setMode} disabled={recording} />

          <Pressable onPress={() => setSheet("lenses")} accessibilityRole="button" accessibilityLabel="Choose a lens">
            <LensCarousel
              lenses={lenses}
              selectedId={selectedLens?.id ?? null}
              onSelect={handleLensSelect}
              onLockedPress={(lens) => setLockedNotice(`${lens.name} needs Frankframe Plus.`)}
            />
          </Pressable>

          <View style={styles.controlsRow}>
            <IconToggle
              glyph="🪄"
              label="Manual beauty sliders"
              onPress={() => setSheet("beauty")}
            />
            <ShutterButton
              mode={mode}
              recording={recording}
              onPress={mode === "photo" ? takePhoto : toggleVideo}
              onLongPress={mode === "photo" ? undefined : toggleVideo}
            />
            <IconToggle
              glyph="⟲"
              label="Flip camera"
              onPress={() => setFacing(facing === "back" ? "front" : "back")}
            />
          </View>
        </View>
      </SafeAreaView>

      <Modal visible={sheet === "lenses"} transparent animationType="slide" onRequestClose={() => setSheet("none")}>
        <Sheet title="Lenses" onClose={() => setSheet("none")}>
          <LensCarousel
            lenses={lenses}
            selectedId={selectedLens?.id ?? null}
            onSelect={(l) => {
              handleLensSelect(l);
              setSheet("none");
            }}
            onLockedPress={(lens) => setLockedNotice(`${lens.name} needs Frankframe Plus.`)}
          />
        </Sheet>
      </Modal>

      <Modal visible={sheet === "beauty"} transparent animationType="slide" onRequestClose={() => setSheet("none")}>
        <Sheet title="Beauty" onClose={() => setSheet("none")}>
          <BeautySliders value={beauty} onChange={handleBeautyChange} />
        </Sheet>
      </Modal>

      {lockedNotice ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setLockedNotice(null)}>
          <View style={styles.lockBackdrop}>
            <View style={styles.lockCard}>
              <Text style={styles.lockText}>{lockedNotice}</Text>
              <Button label="Got it" onPress={() => setLockedNotice(null)} />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <View style={styles.sheetBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Close" onPress={onClose} />
      <SafeAreaView style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
            <Text style={styles.sheetClose}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.sheetBody}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  overlay: { flex: 1, justifyContent: "space-between" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[2],
  },
  settingsButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  settingsGlyph: { fontSize: 20, color: theme.color.text },
  bottomArea: { gap: theme.space[3], paddingBottom: theme.space[5] },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: theme.space[6],
  },
  sheetBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: theme.overlay.sheetBackdrop },
  sheet: {
    backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    maxHeight: "60%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.space[4],
  },
  sheetTitle: { color: theme.color.text, fontSize: theme.type.lg.size, fontWeight: "700" },
  sheetClose: { color: theme.color.textMuted, fontSize: 18 },
  sheetBody: { paddingHorizontal: theme.space[4], paddingBottom: theme.space[6] },
  lockBackdrop: {
    flex: 1,
    backgroundColor: theme.overlay.sheetBackdrop,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.space[5],
  },
  lockCard: {
    width: "100%",
    maxWidth: 300,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    padding: theme.space[5],
    gap: theme.space[3],
  },
  lockText: { color: theme.color.text, fontSize: theme.type.base.size },
});
