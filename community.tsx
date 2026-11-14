import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Community, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICONS: Record<string, string> = {
  Transport: "navigation",
  Healthcare: "heart",
  Workplace: "briefcase",
  Shopping: "shopping-bag",
  Government: "flag",
  Education: "book",
  Other: "hash",
};

function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  const colors = useColors();
  const { isMember, joinCommunity } = useApp();
  const scale = useSharedValue(1);
  const member = isMember(community.id);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const icon = (CATEGORY_ICONS[community.category] ?? "hash") as any;

  return (
    <Animated.View style={[animStyle, { marginHorizontal: 16, marginVertical: 6 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.cardIcon, { backgroundColor: community.color + "22" }]}>
          <Feather name={icon} size={24} color={community.color} />
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
            {community.name}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {community.description}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Feather name="users" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {community.memberIds.length} members
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="file-text" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {community.postCount} posts
              </Text>
            </View>
            <View style={[styles.categoryChip, { backgroundColor: community.color + "18" }]}>
              <Text style={[styles.categoryText, { color: community.color }]}>{community.category}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            if (!member) {
              joinCommunity(community.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={[
            styles.joinBtn,
            { backgroundColor: member ? colors.muted : community.color },
          ]}
        >
          <Text style={[styles.joinText, { color: member ? colors.mutedForeground : "#FFF" }]}>
            {member ? "Joined" : "Join"}
          </Text>
        </TouchableOpacity>
      </Pressable>
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { communities } = useApp();
  const [tab, setTab] = useState<"all" | "mine">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const { isMember } = useApp();
  const displayed = tab === "mine"
    ? communities.filter(c => isMember(c.id))
    : communities;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.eyebrow}>CONNECT & DISCUSS</Text>
        <Text style={styles.title}>Communities</Text>
        <Text style={styles.subtitle}>Join discussions, share experiences, build queue justice</Text>
      </LinearGradient>

      <View style={[styles.tabs, { backgroundColor: colors.background }]}>
        {(["all", "mine"] as const).map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, { borderBottomColor: tab === t ? colors.primary : "transparent", borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "all" ? "All Communities" : "My Communities"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CommunityCard community={item} onPress={() => router.push(`/community/${item.id}`)} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: 120 + bottomPad }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!displayed.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient colors={[colors.gradientStart + "22", colors.gradientEnd + "22"]} style={styles.emptyIcon}>
              <Feather name="users" size={36} color={colors.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {tab === "mine" ? "No communities joined yet" : "No communities yet"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {tab === "mine" ? "Join communities from the All tab" : "Create the first one!"}
            </Text>
          </View>
        }
      />

      <Animated.View style={[styles.fabWrap, { bottom: 90 + bottomPad }]}>
        <Pressable
          onPress={() => router.push("/community/create")}
          style={styles.fabInner}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Feather name="plus" size={26} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  list: { paddingTop: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: "#6D28D9", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1, gap: 4 },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "center",
    flexShrink: 0,
  },
  joinText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
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
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fabWrap: {
    position: "absolute",
    right: 20,
  },
  fabInner: {
    borderRadius: 30,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});
