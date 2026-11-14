import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Pending", "Guilty", "Dismissed"] as const;
type Filter = (typeof FILTERS)[number];

function FABButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animStyle, styles.fabWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={styles.fabInner}
      >
        <LinearGradient
          colors={["#8B5CF6", "#EC4899", "#F97316"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={28} color="#FFF" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, authUser: user } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = reports.filter(r => {
    const matchesSearch =
      !search ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.location.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || r.status === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleFAB = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/report-modal");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  if (!user) return null;
  const initials = user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Feather name="shield" size={16} color="#FFF" />
            </View>
            <Text style={styles.brandName}>LINEGUARD</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={[styles.avatarBtn, { backgroundColor: user.color }]}
          >
            <Text style={styles.avatarBtnText}>{initials}</Text>
          </Pressable>
        </View>

        <Text style={styles.heroTitle}>Stop line{"\n"}cutters. 🚫</Text>
        <Text style={styles.heroSub}>Report. Shame. Get justice.</Text>

        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{reports.length}</Text>
            <Text style={styles.statSmall}>Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statBig}>{reports.filter(r => r.status === "guilty").length}</Text>
            <Text style={styles.statSmall}>Resolved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statBig}>
              ₹{reports.reduce((s, r) => s + (r.payment && (r.payment.status === "confirmed" || (!r.payment.status && !!r.payment.paidAt)) ? r.payment.amount : 0), 0).toLocaleString()}
            </Text>
            <Text style={styles.statSmall}>Justice Paid</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.controlsBar, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search incidents..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const active = filter === item;
            return (
              <Pressable
                onPress={() => setFilter(item)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                {active && item === "All" && <Feather name="list" size={12} color="#FFF" />}
                {active && item === "Pending" && <Feather name="clock" size={12} color="#FFF" />}
                {active && item === "Guilty" && <Feather name="check-circle" size={12} color="#FFF" />}
                {active && item === "Dismissed" && <Feather name="x-circle" size={12} color="#FFF" />}
                <Text style={[styles.chipText, { color: active ? "#FFF" : colors.mutedForeground }]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            isOwner={item.reporterId === user.id}
            onPress={() => router.push(`/detail/${item.id}`)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 120 + bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={[colors.gradientStart + "22", colors.gradientEnd + "22"]}
              style={styles.emptyIcon}
            >
              <Feather name="inbox" size={36} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No incidents found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search ? "Try a different search" : "Be the first to report a line cutter"}
            </Text>
          </View>
        }
      />

      <FABButton onPress={handleFAB} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    lineHeight: 46,
    marginBottom: 4,
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
  },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 4,
  },
  statItem: { alignItems: "center", flex: 1 },
  statBig: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statSmall: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  controlsBar: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  filterList: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  list: { paddingTop: 8 },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fabWrapper: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "web" ? 118 : 84,
  },
  fabInner: {
    borderRadius: 32,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
