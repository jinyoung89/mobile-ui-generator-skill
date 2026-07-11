import React, { useMemo, useState } from 'react';
import { AccessibilityInfo, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fixtures } from './fixtures';

type ScreenState = keyof typeof fixtures;
export function {{SCREEN_COMPONENT}}() {
  const [state, setState] = useState<ScreenState>('{{DEFAULT_STATE}}');
  const model = useMemo(() => fixtures[state] ?? fixtures.default, [state]);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={styles.title}>{model.title}</Text>
          <Text style={styles.body}>{model.body}</Text>
          <View style={styles.spacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="{{PRIMARY_LABEL}}"
            accessibilityState={{ disabled: state === 'loading' || state === 'disabled', busy: state === 'loading' }}
            disabled={state === 'loading' || state === 'disabled'}
            onPress={() => { setState('{{ACTION_SUCCESS_STATE}}'); AccessibilityInfo.announceForAccessibility(model.success); }}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Text style={styles.actionText}>{{PRIMARY_LABEL}}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '{{SURFACE_COLOR}}' },
  content: { flexGrow: 1, paddingHorizontal: {{SCREEN_INSET_DP}}, paddingTop: {{APP_BAR_VERTICAL_DP}}, paddingBottom: {{BOTTOM_CLEARANCE_DP}}, gap: {{COMPONENT_GAP_DP}} },
  title: { color: '{{TEXT_COLOR}}', fontSize: {{TITLE_FONT_SIZE_SP}}, lineHeight: {{TITLE_LINE_HEIGHT_SP}}, fontWeight: '{{TITLE_FONT_WEIGHT}}' },
  body: { color: '{{TEXT_COLOR}}', fontSize: {{BODY_FONT_SIZE_SP}}, lineHeight: {{BODY_LINE_HEIGHT_SP}} },
  spacer: { flex: 1, minHeight: {{SECTION_GAP_DP}} },
  action: { minHeight: {{CONTROL_HEIGHT_DP}}, borderRadius: {{CONTROL_RADIUS_DP}}, alignItems: 'center', justifyContent: 'center', backgroundColor: '{{ACTION_COLOR}}' },
  pressed: { opacity: 0.82 },
  actionText: { color: '{{ACTION_TEXT_COLOR}}', fontSize: {{BODY_FONT_SIZE_SP}}, fontWeight: '{{ACTION_FONT_WEIGHT}}' },
});
