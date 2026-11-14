import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const MISSION_POINTS = [
  { icon: "shield", title: "Queue Justice", desc: "We believe every person deserves fair treatment in public queues. Line cutting is disrespectful and we're here to change that." },
  { icon: "eye", title: "Transparency", desc: "All reports are public. Guilty parties must issue a public apology — there's no hiding behind anonymity." },
  { icon: "users", title: "Community Power", desc: "Change happens when people stand together. Our community of reporters makes India's queues fairer for everyone." },
  { icon: "trending-up", title: "Justice = Accountability", desc: "We believe in restorative justice. Guilty parties pay compensation and apologise publicly, creating real accountability." },
  { icon: "map-pin", title: "Built for India", desc: "From railway stations to hospital queues, metro platforms to government offices — we cover the spaces that matter most." },
];

const STATS = [
  { value: "4,200+", label: "Reports Filed" },
  { value: "1,800+", label: "Cases Resolved" },
  { value: "₹9.4L+", label: "Justice Paid" },
];

export default function MissionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topPad + 16 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        <View style={styles.heroCenter}>
          <View style={styles.logoRing}>
            <Feather name="shield" size={40} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Our Mission</Text>
          <Text style={styles.heroSub}>
            Making India's public queues fair,{"\n"}one report at a time.
          </Text>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What We Stand For</Text>

        {MISSION_POINTS.map((point, i) => (
          <View key={i} style={[styles.pointCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.gradientStart + "25", colors.gradientEnd + "15"]}
              style={styles.pointIcon}
            >
              <Feather name={point.icon as any} size={20} color={colors.primary} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pointTitle, { color: colors.foreground }]}>{point.title}</Text>
              <Text style={[styles.pointDesc, { color: colors.mutedForeground }]}>{point.desc}</Text>
            </View>
          </View>
        ))}

        <LinearGradient
          colors={[colors.gradientStart + "18", colors.gradientEnd + "18"]}
          style={[styles.manifestoCard, { borderColor: colors.primary + "30" }]}
        >
          <Text style={[styles.manifestoTitle, { color: colors.foreground }]}>The LineGuard Manifesto</Text>
          <Text style={[styles.manifestoText, { color: colors.mutedForeground }]}>
            "A civil society is one where people wait their turn. Where rules are respected not out of fear, but out of shared dignity. LineGuard exists to restore that dignity — one report, one apology, one queue at a time."
          </Text>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  heroCenter: { alignItems: "center", gap: 10 },
  logoRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  heroTitle: { color: "#FFF", fontSize: 32, fontFamily: "Inter_700Bold" },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 },
  statItem: { alignItems: "center", gap: 3 },
  statValue: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Inter_500Medium" },
  scroll: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pointCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, borderRadius: 16, borderWidth: 1, padding: 14 },
  pointIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pointTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pointDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  manifestoCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 10, marginTop: 8 },
  manifestoTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  manifestoText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, fontStyle: "italic" },
});
