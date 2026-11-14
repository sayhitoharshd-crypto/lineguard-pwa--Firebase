import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getReportById, proposeDirectPayment, confirmDirectPayment, dismissReport, authUser: user } = useApp();

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [apology, setApology] = useState("");
  const [payerName, setPayerName] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const report = getReportById(id ?? "");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!report) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Report not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = report.reporterId === user.id;

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: "LineGuard — Queue Justice Report",
        message: `🚨 Line Cutter Reported!\n\n📍 ${report.location.address}\n\n"${report.description}"\n\nReported via LineGuard — Queue Justice App`,
      });
    } catch {
      // User dismissed share sheet
    }
  };

  const handlePay = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount paid directly to the reporter.");
      return;
    }
    if (!apology.trim() || !payerName.trim()) {
      Alert.alert("Details needed", "Please enter your name and public apology.");
      return;
    }
    proposeDirectPayment(report.id, amt, apology.trim(), payerName.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPayModalVisible(false);
    setAmount("");
    setApology("");
    setPayerName("");
    Alert.alert("Payment reported", "The reporter must confirm that they received the money before it appears in their LineGuard wallet.");
  };

  const handleConfirmReceipt = () => {
    Alert.alert("Confirm money received", "Only confirm if the accused person's money has actually reached you. This will add the amount to your LineGuard wallet.", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, received", onPress: () => {
        confirmDirectPayment(report.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Wallet updated", "The confirmed amount is now included in your wallet balance.");
      } },
    ]);
  };

  const statusConfig = {
    pending: { label: "PENDING", color: colors.warning, bg: colors.warning + "22" },
    guilty: { label: "GUILTY — RESOLVED", color: colors.success, bg: colors.success + "22" },
    dismissed: { label: "DISMISSED", color: colors.mutedForeground, bg: colors.muted },
  }[report.status];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#FFF" }]}>Incident Report</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
          <Feather name="share-2" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {report.mediaUris.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: report.mediaUris[activeImage] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {report.mediaUris.length > 1 && (
              <View style={styles.thumbnails}>
                {report.mediaUris.map((uri, i) => (
                  <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                    <Image
                      source={{ uri }}
                      style={[
                        styles.thumb,
                        { borderColor: i === activeImage ? colors.primary : "transparent" },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {report.mediaUris.length === 0 && (
          <View style={[styles.noImageBanner, { backgroundColor: colors.primary + "15" }]}>
            <Feather name="camera-off" size={32} color={colors.primary} />
            <Text style={[styles.noImageText, { color: colors.mutedForeground }]}>No photo/video evidence</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>

          <Text style={[styles.description, { color: colors.foreground }]}>{report.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{report.location.address}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.secondary} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{formatDate(report.timestamp)}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.reporterSection}>
            <View style={[styles.reporterAvatar, { backgroundColor: report.reporterColor }]}>
              <Text style={styles.avatarText}>
                {report.reporterName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.reporterLabel, { color: colors.mutedForeground }]}>Reported by</Text>
              <Text style={[styles.reporterName, { color: colors.foreground }]}>
                {isOwner ? "You" : report.reporterName}
              </Text>
            </View>
            <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>{timeAgo(report.timestamp)}</Text>
          </View>

          {report.payment?.status === "awaiting_confirmation" && (
            <View style={[styles.guiltyCTA, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "40" }]}>
              <Feather name="clock" size={18} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Payment awaiting confirmation</Text>
                <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
                  {isOwner ? `${report.payment.payerName} says they paid ₹${report.payment.amount} directly. Confirm only after you receive it.` : "The reporter must confirm receipt before this case is marked resolved and the wallet is credited."}
                </Text>
                {!isOwner && <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>Apology: {report.payment.apology}</Text>}
                {isOwner && <TouchableOpacity onPress={handleConfirmReceipt} style={[styles.payBtn, { backgroundColor: colors.success, marginTop: 10 }]}><Text style={styles.payBtnText}>Confirm money received</Text></TouchableOpacity>}
              </View>
            </View>
          )}

          {report.status === "guilty" && report.payment && (
            <View style={[styles.paymentCard, { backgroundColor: colors.success + "12", borderColor: colors.success + "30" }]}>
              <View style={styles.paymentHeader}>
                <View style={[styles.payIconCircle, { backgroundColor: colors.success }]}>
                  <Feather name="check" size={16} color="#FFF" />
                </View>
                <Text style={[styles.paymentTitle, { color: colors.success }]}>Paid & Apologised</Text>
              </View>
              <View style={styles.paymentDetail}>
                <Text style={[styles.payerName, { color: colors.foreground }]}>{report.payment.payerName}</Text>
                <Text style={[styles.payAmount, { color: colors.success }]}>₹{report.payment.amount}</Text>
              </View>
              <View style={[styles.apologyBox, { backgroundColor: colors.success + "08" }]}>
                <Feather name="message-square" size={13} color={colors.success} />
                <Text style={[styles.apologyText, { color: colors.foreground }]}>{report.payment.apology}</Text>
              </View>
              <Text style={[styles.paidDate, { color: colors.mutedForeground }]}>
                {formatDate(report.payment.paidAt)}
              </Text>
            </View>
          )}

          {report.status === "pending" && !isOwner && !report.payment && (
            <View style={[styles.guiltyCTA, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
              <Feather name="alert-triangle" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Were you the line cutter?</Text>
                <Text style={[styles.ctaDesc, { color: colors.mutedForeground }]}>
                  Pay the reporter directly by an agreed method, then submit your public apology. The reporter confirms receipt in LineGuard.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {report.status === "pending" && !isOwner && !report.payment && (
        <View style={[styles.footerBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
          <TouchableOpacity
            onPress={() => setPayModalVisible(true)}
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="dollar-sign" size={18} color="#FFF" />
            <Text style={styles.payBtnText}>Pay & Apologise</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={payModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPayModalVisible(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Pay & Issue Public Apology</Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              Send the agreed amount directly to the reporter using a payment method you both choose. LineGuard does not collect money or verify the transfer automatically. The reporter must confirm receipt before their wallet is credited.
            </Text>

            <View style={styles.modalFields}>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                value={payerName}
                onChangeText={setPayerName}
              />
              <View style={[styles.amountInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.rupee, { color: colors.foreground }]}>₹</Text>
                <TextInput
                  style={[styles.amountField, { color: colors.foreground }]}
                  placeholder="Amount to pay"
                  placeholderTextColor={colors.mutedForeground}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <TextInput
                style={[styles.apologyInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Write your public apology..."
                placeholderTextColor={colors.mutedForeground}
                value={apology}
                onChangeText={setApology}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setPayModalVisible(false)}
                style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePay}
                style={[styles.confirmPayBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.confirmPayText}>I have paid directly</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFF",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  content: { gap: 0 },
  imageContainer: { width: "100%" },
  mainImage: {
    width: "100%",
    height: 260,
  },
  thumbnails: {
    flexDirection: "row",
    padding: 8,
    gap: 6,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
  },
  noImageBanner: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  noImageText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  body: {
    padding: 16,
    gap: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  metaRow: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  divider: {
    height: 1,
  },
  reporterSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reporterAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  reporterLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  reporterName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  timeAgo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  paymentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  payIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  paymentDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payerName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  payAmount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  apologyBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    alignItems: "flex-start",
  },
  apologyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 20,
  },
  paidDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  guiltyCTA: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  ctaTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  ctaDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    lineHeight: 18,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  payBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: -6,
  },
  modalFields: {
    gap: 10,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 4,
  },
  rupee: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  amountField: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    paddingVertical: 12,
  },
  apologyInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 90,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  confirmPayBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmPayText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
