import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function PhoneAuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("+91");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    setError("");
    const normalized = phone.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) { setError("Enter a valid phone number with country code, e.g. +919876543210."); return; }
    setLoading(true);
    try { setConfirmation(await auth().signInWithPhoneNumber(normalized)); }
    catch (e: any) { setError(e?.message || "Unable to send OTP. Check Firebase Phone sign-in settings and app fingerprints."); }
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    if (!confirmation || !/^\d{6}$/.test(code.trim())) { setError("Enter the 6-digit verification code."); return; }
    setLoading(true); setError("");
    try { await confirmation.confirm(code.trim()); router.replace("/(tabs)"); }
    catch (e: any) { setError(e?.message || "The verification code is invalid or expired."); }
    finally { setLoading(false); }
  };

  return <View style={[styles.container,{backgroundColor:colors.background,paddingTop:insets.top+18,paddingBottom:insets.bottom+18}]}>
    <TouchableOpacity onPress={()=>router.back()} style={styles.back}><Feather name="arrow-left" size={22} color={colors.foreground}/></TouchableOpacity>
    <LinearGradient colors={[colors.gradientStart,colors.gradientMid,colors.gradientEnd]} style={styles.hero}><Text style={styles.title}>Phone verification</Text><Text style={styles.subtitle}>Sign in securely with a one-time code</Text></LinearGradient>
    <View style={styles.form}>
      {!!error && <Text style={[styles.error,{color:colors.destructive}]}>{error}</Text>}
      <Text style={[styles.label,{color:colors.foreground}]}>Phone number</Text>
      <TextInput editable={!confirmation} value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="+919876543210" placeholderTextColor={colors.mutedForeground} style={[styles.input,{color:colors.foreground,backgroundColor:colors.card,borderColor:colors.border}]}/>
      {confirmation && <><Text style={[styles.label,{color:colors.foreground}]}>6-digit OTP</Text><TextInput value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} placeholder="123456" placeholderTextColor={colors.mutedForeground} style={[styles.input,{color:colors.foreground,backgroundColor:colors.card,borderColor:colors.border}]}/></>}
      <Pressable disabled={loading} onPress={confirmation?verifyCode:sendCode} style={{borderRadius:14,overflow:"hidden",marginTop:12}}><LinearGradient colors={[colors.gradientStart,colors.gradientMid,colors.gradientEnd]} style={styles.button}>{loading?<ActivityIndicator color="#fff"/>:<Text style={styles.buttonText}>{confirmation?"Verify and Sign In":"Send OTP"}</Text>}</LinearGradient></Pressable>
      {confirmation && <TouchableOpacity onPress={()=>{setConfirmation(null);setCode("");setError("");}} style={{padding:14,alignItems:"center"}}><Text style={{color:colors.primary,fontWeight:"600"}}>Change phone number</Text></TouchableOpacity>}
      <Text style={[styles.note,{color:colors.mutedForeground}]}>By continuing, you agree to verify this phone number with Firebase. Standard SMS charges may apply.</Text>
    </View>
  </View>;
}
const styles=StyleSheet.create({container:{flex:1,paddingHorizontal:24},back:{width:42,height:42,justifyContent:"center"},hero:{borderRadius:20,padding:24,marginTop:16},title:{color:"#fff",fontSize:28,fontWeight:"800"},subtitle:{color:"rgba(255,255,255,.85)",marginTop:6},form:{paddingTop:28,gap:12},label:{fontWeight:"600",marginTop:8},input:{borderWidth:1,borderRadius:13,padding:15,fontSize:16},button:{padding:17,alignItems:"center"},buttonText:{color:"#fff",fontWeight:"700",fontSize:16},error:{padding:10},note:{fontSize:12,lineHeight:18,marginTop:16}});
