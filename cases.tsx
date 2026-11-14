import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportCard } from "@/components/ReportCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Pending", "Guilty", "Dismissed"] as const;
type Filter = (typeof FILTERS)[number];

export default function CasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { myReports } = useApp();
  const [filter, setFilter] = useState<Filter>("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const filtered = myReports.filter(r => {
    if (filter === "All") return true;
    return r.status === filter.toLowerCase();
  });

  const totalEarned = myReports.reduce((s, r) => s + (r.payment && (r.payment.status === "confirmed" || (!r.payment.status && !!r.payment.paidAt)) ? r.payment.amount : 0), 0);
  const resolvedCount = myReports.filter(r => r.status === "guilty").length;
  const pendingCount = myReports.filter(r => r.status === "pending").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.eyebrow}>YOUR IMPACT</Text>
        <Text style={styles.title}>My Cases</Text>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="flag" size={18} color="#FFF" />
            </View>
            <Text style={styles.statNum}>{myReports.length}</Text>
            <Text style={styles.statLbl}>Filed</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="check-circle" size={18} color="#FFF" />
            </View>
            <Text style={styles.statNum}>{resolvedCount}</Text>
            <Text style={styles.statLbl}>Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="clock" size={18} color="#FFF" />
            </View>
            <Text style={styles.statNum}>{pendingCount}</Text>
            <Text style={styles.statLbl}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.earningsCard]}>
            <View style={[styles.statIconWrap, { backgroundColor: "rgba(255,165,0,0.3)" }]}>
              <Feather name="trending-up" size={18} color="#FFD700" />
            </View>
            <Text style={[styles.statNum, { color: "#FFD700" }]}>₹{totalEarned}</Text>
            <Text style={styles.statLbl}>Earned</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.filtersWrap, { backgroundColor: colors.background }]}>
        <View style={styles.filtersRow}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? "#FFF" : colors.mutedForeground }]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            isOwner
            onPress={() => router.push(`/detail/${item.id}`)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 100 + bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={[colors.gradientStart + "20", colors.gradientEnd + "20"]}
              style={styles.emptyIcon}
            >
              <Feather name="folder" size={36} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No cases yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter !== "All" ? `No ${filter.toLowerCase()} cases` : "File your first report from the home screen"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 4,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  title: {
    color: "#FFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    gap: 5,
  },
  earningsCard: {
    backgroundColor: "rgba(255,165,0,0.15)",
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statNum: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLbl: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  filtersWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  list: { paddingTop: 8 },
  empty: {
    alignItems: "center",
    paddingTop: 50,
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
});
