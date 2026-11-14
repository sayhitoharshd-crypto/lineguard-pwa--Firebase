import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = ["Transport","Healthcare","Workplace","Shopping","Government","Education","Other"];
const PALETTE = ["#E63946","#8B5CF6","#1D8CF8","#2ECE7B","#F4A026","#E91E63","#16A085","#3498DB","#F97316","#9B59B6"];

export default function CreateCommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createCommunity } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [color, setColor] = useState(PALETTE[0]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = () => {
    if (!name.trim()) return;
    createCommunity(name.trim(), description.trim(), category, color);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[color + "EE", color + "88"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Community</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.previewBanner}>
          <View style={[styles.previewIcon, { backgroundColor: color + "22" }]}>
            <Feather name="users" size={28} color={color} />
          </View>
          <Text style={[styles.previewName, { color: colors.foreground }]}>
            {name || "Community Name"}
          </Text>
          <Text style={[styles.previewDesc, { color: colors.mutedForeground }]}>
            {description || "Your community description"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Community Name *</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="hash" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. Chennai Queue Watch"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
          <TextInput
            style={[styles.descInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            placeholder="What is this community about?"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{description.length}/200</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: category === cat ? color + "20" : colors.card,
                    borderColor: category === cat ? color : colors.border,
                  },
                ]}
              >
                <Text style={[styles.categoryText, { color: category === cat ? color : colors.mutedForeground }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Community Color</Text>
          <View style={styles.colorGrid}>
            {PALETTE.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderWidth: color === c ? 3 : 0, borderColor: "#FFF" },
                ]}
              >
                {color === c && <Feather name="check" size={14} color="#FFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleCreate}
          disabled={!name.trim()}
          style={{ borderRadius: 16, overflow: "hidden", opacity: !name.trim() ? 0.5 : 1 }}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createBtn}
          >
            <Feather name="users" size={18} color="#FFF" />
            <Text style={styles.createBtnText}>Create Community</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
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
  },
  closeBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  form: { padding: 16, gap: 20 },
  previewBanner: { alignItems: "center", gap: 8, paddingVertical: 8 },
  previewIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  previewName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  previewDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: { gap: 8 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  descInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80, lineHeight: 20 },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  categoryText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  colorDot: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  createBtn: { paddingVertical: 17, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 },
  createBtnText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
});
