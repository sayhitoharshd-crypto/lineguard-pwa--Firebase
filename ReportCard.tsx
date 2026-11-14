import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Report } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface ReportCardProps {
  report: Report;
  onPress: () => void;
  isOwner?: boolean;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "clock" as const,
    gradient: ["#F59E0B", "#EA580C"] as [string, string],
  },
  guilty: {
    label: "Guilty",
    icon: "check-circle" as const,
    gradient: ["#059669", "#10B981"] as [string, string],
  },
  dismissed: {
    label: "Dismissed",
    icon: "x-circle" as const,
    gradient: ["#6B7280", "#9CA3AF"] as [string, string],
  },
};

function Avatar({ name, color, size = 38 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  return (
    <View style={[styles.avatar, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function ReportCard({ report, onPress, isOwner }: ReportCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const status = STATUS_CONFIG[report.status];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, styles.wrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {report.mediaUris.length > 0 ? (
          <View style={styles.mediaWrapper}>
            <Image
              source={{ uri: report.mediaUris[0] }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              style={styles.imageOverlay}
            />
          </View>
        ) : (
          <LinearGradient
            colors={[colors.gradientStart + "18", colors.gradientEnd + "18"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.placeholderBanner}
          >
            <View style={[styles.placeholderIcon, { backgroundColor: colors.primary + "25" }]}>
              <Feather name="user-x" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.placeholderLabel, { color: colors.mutedForeground }]}>
              No photo evidence
            </Text>
          </LinearGradient>
        )}

        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <View style={styles.reporterInfo}>
              <Avatar name={isOwner ? "You" : report.reporterName} color={report.reporterColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.reporterName, { color: colors.foreground }]}>
                  {isOwner ? "You" : report.reporterName}
                </Text>
                <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
                  {timeAgo(report.timestamp)}
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={status.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusPill}
            >
              <Feather name={status.icon} size={10} color="#FFF" />
              <Text style={styles.statusText}>{status.label}</Text>
            </LinearGradient>
          </View>

          <Text style={[styles.description, { color: colors.foreground }]} numberOfLines={2}>
            {report.description}
          </Text>

          <View style={styles.footerRow}>
            <View style={[styles.locationPill, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="map-pin" size={11} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.primary }]} numberOfLines={1}>
                {report.location.address}
              </Text>
            </View>

            {report.status === "guilty" && report.payment && (
              <LinearGradient
                colors={["#059669", "#10B981"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.payPill}
              >
                <Text style={styles.payText}>₹{report.payment.amount}</Text>
              </LinearGradient>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 7,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6D28D9",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  mediaWrapper: {
    width: "100%",
    height: 170,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  placeholderBanner: {
    width: "100%",
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  cardBody: {
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  reporterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  avatarText: {
    color: "#FFF",
    fontFamily: "Inter_700Bold",
  },
  reporterName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  timeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  payPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  payText: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
});
