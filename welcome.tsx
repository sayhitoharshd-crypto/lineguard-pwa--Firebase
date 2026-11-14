import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.inner, { paddingTop: topPad + 40, paddingBottom: bottomPad + 24 }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={styles.logoRing}>
              <Feather name="shield" size={36} color="#FFF" />
            </View>
          </View>
          <Text style={styles.appName}>LineGuard</Text>
          <Text style={styles.tagline}>Queue Justice for India</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.heroTextWrap}>
          <Text style={styles.headline}>Stop line{"\n"}cutters. 🚫</Text>
          <Text style={styles.subtext}>
            Report them. Shame them publicly.{"\n"}Get compensated. Be the change.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.features}>
          {[
            { icon: "map-pin", text: "Auto-detect location" },
            { icon: "camera", text: "Capture photo/video evidence" },
            { icon: "dollar-sign", text: "Get paid a public apology" },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={f.icon as any} size={14} color="#FFF" />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.buttons}>
          <TouchableOpacity
            onPress={() => router.push("/auth/signup")}
            style={styles.signUpBtn}
          >
            <Text style={styles.signUpText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/auth/signin")}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing you agree to our Terms of Service and Privacy Policy.
            {"\n"}Reports are public — never share private information.
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 8,
  },
  logoWrap: {
    marginBottom: 4,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  appName: {
    color: "#FFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
  },
  heroTextWrap: {
    gap: 10,
  },
  headline: {
    color: "#FFFFFF",
    fontSize: 48,
    fontFamily: "Inter_700Bold",
    lineHeight: 54,
  },
  subtext: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  features: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  buttons: {
    gap: 12,
  },
  signUpBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  signUpText: {
    color: "#6D28D9",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  signInBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  terms: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 16,
  },
});
