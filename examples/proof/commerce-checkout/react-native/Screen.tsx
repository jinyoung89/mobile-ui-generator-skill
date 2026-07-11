// Generated from canonical IR commerce-checkout-address; 한국어 + English; fixture-only.
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fixtures } from './fixtures';

type Locale = keyof typeof fixtures;
export function CommerceCheckoutAddressScreen() {
  const [locale, setLocale] = useState<Locale>('ko');
  const [screenState, setScreenState] = useState<'default' | 'success'>('default');
  const model = useMemo(() => fixtures[locale], [locale]);
  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.header}><View style={styles.flex}><Text accessibilityRole="header" allowFontScaling style={styles.title}>{model.title}</Text><Text allowFontScaling style={styles.muted}>{model.subtitle}</Text></View><Pressable accessibilityRole="button" onPress={() => setLocale(locale === 'ko' ? 'en' : 'ko')} style={styles.locale}><Text>{locale === 'ko' ? 'EN' : 'KO'}</Text></Pressable></View>
        <View style={styles.card}><Text style={styles.badge}>{model.item_badge}</Text><Text style={styles.strong}>{model.item_title}</Text><Text style={styles.muted}>{model.item_body}</Text><Text style={styles.amount}>{model.amount}</Text></View><TextInput accessibilityLabel={model.field_label} style={styles.input} /><View style={styles.row}><View style={styles.mark}><Text style={styles.markText}>V</Text></View><Text style={styles.strong}>{model.secondary_label}</Text></View>
      </ScrollView>
      <View style={styles.fixed}><Pressable accessibilityRole="button" accessibilityLabel={model.primary_cta} onPress={() => setScreenState('success')} style={styles.action}><Text style={styles.actionText}>{screenState === 'success' ? model.success_label : model.primary_cta}</Text></Pressable></View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' }, flex: { flex: 1 }, content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 218, gap: 12 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }, title: { color: '#111827', fontSize: 26, lineHeight: 34, fontWeight: '700' }, muted: { color: '#5B6472', lineHeight: 22 }, strong: { color: '#111827', fontWeight: '700', fontSize: 17 }, amount: { marginTop: 12, fontSize: 24, fontWeight: '800' }, badge: { color: '#2563EB', fontWeight: '800' },
  locale: { minWidth: 44, minHeight: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D7DCE3', alignItems: 'center', justifyContent: 'center' }, input: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: '#AEB6C2', paddingHorizontal: 16 }, card: { gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#F7F9FC' }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, mark: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' }, markText: { color: '#FFFFFF', fontWeight: '800' },
  map: { minHeight: 280, borderRadius: 18, backgroundColor: '#DFEEE5', overflow: 'hidden' }, route: { position: 'absolute', top: 105, left: 88, width: 170, height: 72, borderRightWidth: 5, borderBottomWidth: 5, borderColor: '#2563EB', borderRadius: 36 }, pinA: { position: 'absolute', top: 64, left: 65, padding: 12, borderRadius: 24, color: '#FFFFFF', backgroundColor: '#2563EB' }, pinB: { position: 'absolute', right: 58, bottom: 54, padding: 12, borderRadius: 24, color: '#FFFFFF', backgroundColor: '#2563EB' }, eta: { position: 'absolute', top: 16, right: 16, padding: 10, borderRadius: 10, backgroundColor: '#FFFFFF', fontWeight: '800' }, risk: { color: '#B42318', lineHeight: 22 },
  stories: { flexDirection: 'row', gap: 12 }, story: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '#2563EB', textAlign: 'center', paddingTop: 17, fontWeight: '800' }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' }, media: { minHeight: 220, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EDF4' },
  messages: { minHeight: 390, justifyContent: 'flex-end', gap: 12 }, incoming: { alignSelf: 'flex-start', maxWidth: '78%', padding: 12, borderRadius: 18, backgroundColor: '#EDF0F4' }, outgoing: { alignSelf: 'flex-end', maxWidth: '78%', padding: 12, borderRadius: 18, color: '#FFFFFF', backgroundColor: '#2563EB' }, time: { alignSelf: 'center', color: '#717B89' }, composer: { flexDirection: 'row', gap: 12 }, send: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  fixed: { minHeight: 84, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' }, action: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' }, actionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
});
