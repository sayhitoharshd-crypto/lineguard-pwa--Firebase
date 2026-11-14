import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface PickedMedia {
  uri: string;
  type: "image" | "video";
}

export default function ReportModal() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addReport } = useApp();

  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<PickedMedia[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLocationLoading(true);
    setLocationAddress("");
    try {
      if (Platform.OS === "web") {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            async pos => {
              const { latitude, longitude } = pos.coords;
              setLocationCoords({ latitude, longitude });
              setLocationAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              setLocationLoading(false);
            },
            () => {
              setLocationAddress("Unable to detect location");
              setLocationLoading(false);
            },
            { timeout: 10000 }
          );
        } else {
          setLocationAddress("Location not supported on this browser");
          setLocationLoading(false);
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission",
            "Location access helps add your incident location. Please allow it in settings.",
            [{ text: "OK" }]
          );
          setLocationAddress("Location permission denied");
          setLocationLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        setLocationCoords({ latitude, longitude });
        const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode) {
          const parts = [
            geocode.name,
            geocode.street,
            geocode.district,
            geocode.city,
            geocode.region,
          ].filter(Boolean);
          setLocationAddress(parts.join(", ") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          setLocationAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocationLoading(false);
      }
    } catch {
      setLocationAddress("Could not get location");
      setLocationLoading(false);
    }
  };

  const pickMedia = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access to add evidence.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const newMedia = result.assets.map(a => ({
        uri: a.uri,
        type: (a.type === "video" ? "video" : "image") as "image" | "video",
      }));
      setMedia(prev => [...prev, ...newMedia].slice(0, 5));
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Camera", "Camera capture is not available on web. Please use the gallery option.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access to capture evidence.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const a = result.assets[0];
      setMedia(prev =>
        [...prev, { uri: a.uri, type: (a.type === "video" ? "video" : "image") as "image" | "video" }].slice(0, 5)
      );
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Missing info", "Please describe what happened.");
      return;
    }
    if (!locationAddress || locationAddress.includes("Unable") || locationAddress.includes("denied")) {
      Alert.alert("Missing location", "Please wait for location to load or enter it manually.");
      return;
    }
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(r => setTimeout(r, 400));
    addReport({
      description: description.trim(),
      location: {
        latitude: locationCoords?.latitude ?? 0,
        longitude: locationCoords?.longitude ?? 0,
        address: locationAddress,
      },
      mediaUris: media.map(m => m.uri),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: "#FFF" }]}>Report Incident</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 40 + bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
          </View>
          {locationLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Detecting your location...</Text>
            </View>
          ) : (
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: colors.foreground }]} numberOfLines={2}>
                {locationAddress || "Tap to detect location"}
              </Text>
              <TouchableOpacity
                onPress={detectLocation}
                style={[styles.refreshBtn, { backgroundColor: colors.primary + "15" }]}
              >
                <Feather name="refresh-cw" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="camera" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Evidence</Text>
            <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>({media.length}/5)</Text>
          </View>

          <View style={styles.mediaGrid}>
            {media.map((m, i) => (
              <View key={i} style={[styles.mediaThumbnail, { backgroundColor: colors.muted }]}>
                <Image source={{ uri: m.uri }} style={styles.mediaImage} />
                {m.type === "video" && (
                  <View style={styles.videoOverlay}>
                    <Feather name="play" size={16} color="#FFF" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMedia}
                  onPress={() => removeMedia(i)}
                >
                  <Feather name="x" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}

            {media.length < 5 && (
              <View style={styles.addMediaRow}>
                {Platform.OS !== "web" && (
                  <TouchableOpacity
                    onPress={takePhoto}
                    style={[styles.addBtn, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}
                  >
                    <Feather name="camera" size={20} color={colors.primary} />
                    <Text style={[styles.addBtnText, { color: colors.primary }]}>Camera</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={pickMedia}
                  style={[styles.addBtn, { backgroundColor: colors.secondary + "15", borderColor: colors.secondary + "40" }]}
                >
                  <Feather name="image" size={20} color={colors.secondary} />
                  <Text style={[styles.addBtnText, { color: colors.secondary }]}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What happened?</Text>
          </View>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            multiline
            placeholder="Describe the incident — where you were, how many people were in the queue, what the line cutter did..."
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
            {description.length} / 500
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
          <Feather name="info" size={14} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Reports are public. The accused can view it and choose to pay a compensation with a public apology.
          </Text>
        </View>

        <Pressable onPress={handleSubmit} disabled={submitting} style={{ borderRadius: 14, overflow: "hidden" }}>
          <LinearGradient
            colors={submitting ? [colors.mutedForeground, colors.mutedForeground] : [colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Feather name="send" size={18} color="#FFF" />
                <Text style={styles.submitText}>Submit Report</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 16,
    gap: 14,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginLeft: 2,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaGrid: {
    gap: 10,
  },
  mediaThumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeMedia: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  addMediaRow: {
    flexDirection: "row",
    gap: 10,
  },
  addBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
    gap: 6,
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
