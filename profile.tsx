import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
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

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  iconColor,
  iconBg,
  danger,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  iconColor: string;
  iconBg: string;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.menuItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={[styles.menuSublabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
        )}
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { authUser, myReports, updateUser, signOut } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(authUser?.name ?? "");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const confirmedPayments = myReports.filter(r => r.payment && (r.payment.status === "confirmed" || (!r.payment.status && !!r.payment.paidAt)));
  const totalEarned = confirmedPayments.reduce((s, r) => s + (r.payment?.amount ?? 0), 0);
  const redemptionMinimum = 100;
  const canRedeem = totalEarned >= redemptionMinimum;
  const resolvedCount = myReports.filter(r => r.status === "guilty").length;
  const initials = (authUser?.name ?? "U").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  const saveEdit = () => {
    if (nameInput.trim()) {
      updateUser(nameInput.trim());
      setEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSignOut = async () => {
    // React Native's Alert.alert is not implemented consistently on web.
    // Use the browser confirmation dialog there, while retaining the native
    // confirmation buttons on iOS/Android.
    if (Platform.OS === "web") {
      const confirmed =
        typeof globalThis.confirm === "function"
          ? globalThis.confirm("Are you sure you want to sign out?")
          : true;
      if (!confirmed) return;

      try {
        await signOut();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to sign out.";
        if (typeof globalThis.alert === "function") globalThis.alert(message);
      }
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign out.";
            Alert.alert("Sign out failed", message);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + bottomPad }}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
        >
          <View style={[styles.avatarRing, { borderColor: "rgba(255,255,255,0.4)" }]}>
            <View style={[styles.bigAvatar, { backgroundColor: authUser?.color ?? "#8B5CF6" }]}>
              <Text style={styles.bigAvatarText}>{initials}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => { setNameInput(authUser?.name ?? ""); setEditModalVisible(true); }}
            style={styles.nameRow}
          >
            <Text style={styles.userName}>{authUser?.name ?? "User"}</Text>
            <View style={styles.editChip}>
              <Feather name="edit-2" size={12} color="rgba(255,255,255,0.8)" />
            </View>
          </TouchableOpacity>
          <View style={styles.emailRow}>
            <Feather name="mail" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.emailText}>{authUser?.email ?? ""}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={[styles.statsSection, { backgroundColor: colors.background }]}>
          <View style={styles.bigStatsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient colors={[colors.primary + "25", colors.primary + "08"]} style={styles.statIcon}>
                <Feather name="flag" size={20} color={colors.primary} />
              </LinearGradient>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{myReports.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Cases Filed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <LinearGradient colors={[colors.success + "25", colors.success + "08"]} style={styles.statIcon}>
                <Feather name="check-circle" size={20} color={colors.success} />
              </LinearGradient>
              <Text style={[styles.statNum, { color: colors.foreground }]}>{resolvedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Resolved</Text>
            </View>
          </View>

          <LinearGradient
            colors={[colors.accent + "22", colors.gradientEnd + "22"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.earningsRow, { borderColor: colors.accent + "40" }]}
          >
            <View style={[styles.earningsIcon, { backgroundColor: colors.accent + "25" }]}>
              <Feather name="trending-up" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.earningsLabel, { color: colors.mutedForeground }]}>Total Earned</Text>
              <Text style={[styles.earningsAmount, { color: colors.accent }]}>₹{totalEarned.toLocaleString()}</Text>
            </View>
            <View style={[styles.justiceBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.justiceBadgeText}>Queue Hero</Text>
            </View>
          </LinearGradient>
          <View style={[styles.earningsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.earningsLabel, { color: colors.foreground }]}>Wallet balance</Text>
              <Text style={[styles.earningsAmount, { color: colors.success }]}>₹{totalEarned.toLocaleString("en-IN")}</Text>
              <Text style={[styles.menuSublabel, { color: colors.mutedForeground }]}>
                {canRedeem ? "Minimum redemption reached. Redemption will be enabled when payouts are set up." : `Redeem once your confirmed balance reaches ₹${redemptionMinimum}.`}
              </Text>
            </View>
            <View style={[styles.justiceBadge, { backgroundColor: canRedeem ? colors.success : colors.muted }]}>
              <Text style={[styles.justiceBadgeText, !canRedeem && { color: colors.mutedForeground }]}>{canRedeem ? "Eligible" : "₹100 min."}</Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EXPLORE</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="shield"
            label="Our Mission"
            sublabel="What LineGuard stands for"
            onPress={() => router.push("/mission")}
            iconColor={colors.primary}
            iconBg={colors.primary + "20"}
          />
          <MenuItem
            icon="users"
            label="Communities"
            sublabel="Join discussions, create communities"
            onPress={() => router.push("/(tabs)/community")}
            iconColor={colors.secondary}
            iconBg={colors.secondary + "20"}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MenuItem
            icon="edit-2"
            label="Edit Profile"
            sublabel="Change your display name"
            onPress={() => { setNameInput(authUser?.name ?? ""); setEditModalVisible(true); }}
            iconColor={colors.accent}
            iconBg={colors.accent + "20"}
          />
          <MenuItem
            icon="log-out"
            label="Sign Out"
            onPress={handleSignOut}
            iconColor={colors.destructive}
            iconBg={colors.destructive + "20"}
            danger
          />
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setEditModalVisible(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={e => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Name</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.cancelBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <Pressable onPress={saveEdit} style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientMid]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  <Text style={styles.saveText}>Save</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
    gap: 10,
  },
  avatarRing: { borderWidth: 3, borderRadius: 50, padding: 3, marginBottom: 4 },
  bigAvatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center" },
  bigAvatarText: { color: "#FFF", fontSize: 30, fontFamily: "Inter_700Bold" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  userName: { color: "#FFF", fontSize: 24, fontFamily: "Inter_700Bold" },
  editChip: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, padding: 6 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  emailText: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular" },
  statsSection: { padding: 16, gap: 12 },
  bigStatsRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16, alignItems: "center", gap: 8 },
  statIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  statNum: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  earningsRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 20, borderWidth: 1, padding: 16 },
  earningsIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  earningsLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  earningsAmount: { fontSize: 28, fontFamily: "Inter_700Bold" },
  justiceBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  justiceBadgeText: { color: "#FFF", fontSize: 12, fontFamily: "Inter_700Bold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1.5, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  menuCard: { marginHorizontal: 16, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuSublabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { width: "100%", borderRadius: 24, borderWidth: 1, padding: 24, gap: 16 },
  modalTitle: { fontSize: 19, fontFamily: "Inter_700Bold" },
  modalInput: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 16, fontFamily: "Inter_400Regular" },
  modalRow: { flexDirection: "row", gap: 10 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveGradient: { padding: 14, alignItems: "center" },
  saveText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_700Bold" },
});
