import 'package:flutter/material.dart';

import 'registry.dart';
import 'runtime/runtime.dart';

class ShowcaseApp extends StatelessWidget {
  final String exampleId;
  final String profileName;

  const ShowcaseApp({
    super.key,
    this.exampleId = 'commerce-checkout-address',
    this.profileName = 'standard',
  });

  @override
  Widget build(BuildContext context) {
    if (exampleId != checkoutManifest.exampleId) {
      throw ArgumentError('unknown Flutter example: $exampleId');
    }
    final profile = resolveProfile(profileName);
    final theme = ThemeData(
      brightness: profile.brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF2563EB),
        brightness: profile.brightness,
      ),
      useMaterial3: true,
      inputDecorationTheme: const InputDecorationTheme(
        border: OutlineInputBorder(),
        filled: false,
      ),
    );
    final mediaData = MediaQueryData(
      size: profile.viewport,
      devicePixelRatio: profile.pixelRatio,
      padding: profile.safeArea,
      viewPadding: profile.safeArea,
      viewInsets: EdgeInsets.only(bottom: profile.keyboard.inset),
      textScaler: TextScaler.linear(profile.textScale),
    );
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: theme,
      builder: (context, child) => MediaQuery(data: mediaData, child: child!),
      home: CheckoutScreen(profile: profile),
    );
  }
}

void main() {
  runApp(const ShowcaseApp());
}
