import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export type NativeProfile = {
  name: string;
  viewport: { width: number; height: number };
  pixelRatio: number;
  safeArea: { top: number; right: number; bottom: number; left: number };
  orientation: "portrait" | "landscape";
  theme: "light" | "dark";
  locale: "ko" | "en";
  textScale: number;
  keyboard: { open: boolean; height: number; inset: number };
};

export const profileTable: Record<string, NativeProfile> = {
  compact: { name: "compact", viewport: { width: 320, height: 568 }, pixelRatio: 3, safeArea: { top: 59, right: 0, bottom: 34, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, height: 0, inset: 34 } },
  standard: { name: "standard", viewport: { width: 390, height: 844 }, pixelRatio: 3, safeArea: { top: 59, right: 0, bottom: 34, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, height: 0, inset: 34 } },
  large: { name: "large", viewport: { width: 430, height: 932 }, pixelRatio: 3, safeArea: { top: 59, right: 0, bottom: 34, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: false, height: 0, inset: 34 } },
  "short-keyboard": { name: "short-keyboard", viewport: { width: 390, height: 667 }, pixelRatio: 3, safeArea: { top: 59, right: 0, bottom: 34, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1, keyboard: { open: true, height: 291, inset: 325 } },
  "large-text": { name: "large-text", viewport: { width: 390, height: 844 }, pixelRatio: 3, safeArea: { top: 59, right: 0, bottom: 34, left: 0 }, orientation: "portrait", theme: "light", locale: "ko", textScale: 1.3, keyboard: { open: false, height: 0, inset: 34 } },
};

export function resolveProfile(name: string): NativeProfile {
  const profile = profileTable[name];
  if (!profile) throw new Error(`unknown native profile: ${name}`);
  return { ...profile, viewport: { ...profile.viewport }, safeArea: { ...profile.safeArea }, keyboard: { ...profile.keyboard } };
}

export type RuntimeContractInput = {
  safeArea: { top: number; bottom: number };
  stickyRegionHeight: number;
  scrollContentBottomInset: number;
  keyboard: { open: boolean; inset: number };
};

export function runtimeContract(input: RuntimeContractInput) {
  return {
    safeAreaTop: input.safeArea.top,
    safeAreaBottom: input.safeArea.bottom,
    contentBottomPadding: input.stickyRegionHeight + input.scrollContentBottomInset,
    keyboardBottomInset: input.keyboard.open ? input.keyboard.inset : input.safeArea.bottom,
    scrollOwner: "screen-scroll" as const,
    fixedRegion: "primary-action" as const,
  };
}

export function fixtureAction(actionId: string, event: string, current: { state: string }): { state: string; outcome: "local_state" | "ignored" } {
  if (actionId !== "submit-payment" || event !== "press") return { state: current.state, outcome: "ignored" };
  return { state: "success", outcome: "local_state" };
}

export type CheckoutScreenProps = { profile?: NativeProfile; state?: string };

function CheckoutScreen({ profile = profileTable.standard, state = "default" }: CheckoutScreenProps) {
  const insets = useSafeAreaInsets();
  const [screenState, setScreenState] = useState(state);
  const [address, setAddress] = useState("");
  const contract = useMemo(() => runtimeContract({ safeArea: { top: insets.top || profile.safeArea.top, bottom: insets.bottom || profile.safeArea.bottom }, stickyRegionHeight: 84, scrollContentBottomInset: 100, keyboard: profile.keyboard }), [insets.bottom, insets.top, profile]);
  const submit = () => setScreenState(fixtureAction("submit-payment", "press", { state: screenState }).state);
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={insets.top || profile.safeArea.top}>
        <ScrollView
          testID="screen-scroll"
          contentContainerStyle={{ padding: 16, paddingBottom: contract.contentBottomPadding + contract.safeAreaBottom, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <Text style={styles.eyebrow} allowFontScaling maxFontSizeMultiplier={1.3}>COMMERCE · CHECKOUT</Text>
          <Text accessibilityRole="header" style={styles.title} allowFontScaling maxFontSizeMultiplier={1.3}>배송지를 확인할게요</Text>
          <Text style={styles.description} allowFontScaling maxFontSizeMultiplier={1.3}>안전한 결제를 위해 주문 정보를 확인합니다.</Text>
          <View style={styles.field}>
            <Text nativeID="address-label" style={styles.label} allowFontScaling maxFontSizeMultiplier={1.3}>배송지</Text>
            <TextInput
              testID="address-field"
              accessibilityLabel="배송지"
              accessibilityHint="배송지를 입력하세요"
              aria-label="배송지"
              nativeID="address-input"
              value={address}
              onChangeText={setAddress}
              placeholder="서울시 강남구 테헤란로 123"
              returnKeyType="done"
              style={styles.input}
              allowFontScaling
              maxFontSizeMultiplier={1.3}
            />
          </View>
          <View style={styles.fixtureCard} accessibilityLabel="결제 수단 카드">
            <Text style={styles.fixtureLabel} allowFontScaling maxFontSizeMultiplier={1.3}>결제 수단</Text>
            <Text style={styles.fixtureValue} allowFontScaling maxFontSizeMultiplier={1.3}>신한카드 ···· 1234</Text>
          </View>
          <View style={{ height: 8 }} />
        </ScrollView>
        <View testID="primary-action" style={[styles.fixedRegion, { paddingBottom: Math.max(12, contract.safeAreaBottom) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="결제하기"
            testID="submit-payment"
            onPress={submit}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, screenState === "success" && styles.buttonSuccess]}
          >
            <Text style={styles.buttonText} allowFontScaling maxFontSizeMultiplier={1.3}>{screenState === "success" ? "결제가 완료됐어요" : "결제하기"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function CheckoutApp(props: CheckoutScreenProps) {
  return <SafeAreaProvider initialMetrics={{ insets: props.profile?.safeArea ?? profileTable.standard.safeArea, frame: { x: 0, y: 0, width: props.profile?.viewport.width ?? 390, height: props.profile?.viewport.height ?? 844 } }}><CheckoutScreen {...props} /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  flex: { flex: 1 },
  eyebrow: { color: "#64748b", fontSize: 12, lineHeight: 16, fontWeight: "700", letterSpacing: 0.5 },
  title: { color: "#111827", fontSize: 24, lineHeight: 32, fontWeight: "700" },
  description: { color: "#475569", fontSize: 16, lineHeight: 24 },
  field: { gap: 6 },
  label: { color: "#334155", fontSize: 14, lineHeight: 20, fontWeight: "600" },
  input: { minHeight: 52, borderWidth: 1, borderColor: "#94a3b8", borderRadius: 12, paddingHorizontal: 12, color: "#111827", fontSize: 16, lineHeight: 24 },
  fixtureCard: { minHeight: 68, justifyContent: "center", padding: 16, borderRadius: 12, backgroundColor: "#f1f5f9" },
  fixtureLabel: { color: "#64748b", fontSize: 12, lineHeight: 16 },
  fixtureValue: { marginTop: 2, color: "#111827", fontSize: 16, lineHeight: 24, fontWeight: "600" },
  fixedRegion: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e2e8f0", backgroundColor: "#ffffff" },
  button: { minHeight: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#2563eb" },
  buttonPressed: { opacity: 0.82 },
  buttonSuccess: { backgroundColor: "#15803d" },
  buttonText: { color: "#ffffff", fontSize: 16, lineHeight: 24, fontWeight: "700" },
});
