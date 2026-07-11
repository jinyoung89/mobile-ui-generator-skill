class ArtifactVerification {
  final String nativeBuild;
  final String nativeCapture;

  const ArtifactVerification({
    required this.nativeBuild,
    required this.nativeCapture,
  });
}

class ArtifactManifest {
  final String manifestVersion;
  final String exampleId;
  final String platform;
  final String harnessVersion;
  final String sourceHash;
  final String moduleEntry;
  final List<String> requiredFixtures;
  final List<String> requiredAssets;
  final Map<String, bool> capabilities;
  final String assemblyCommand;
  final String runCommand;
  final ArtifactVerification verification;
  final List<String> profiles;

  const ArtifactManifest({
    required this.manifestVersion,
    required this.exampleId,
    required this.platform,
    required this.harnessVersion,
    required this.sourceHash,
    required this.moduleEntry,
    required this.requiredFixtures,
    required this.requiredAssets,
    required this.capabilities,
    required this.assemblyCommand,
    required this.runCommand,
    required this.verification,
    required this.profiles,
  });
}

const exampleRegistry = <String>['commerce-checkout-address'];

const checkoutManifest = ArtifactManifest(
  manifestVersion: '1.0.0',
  exampleId: 'commerce-checkout-address',
  platform: 'flutter',
  harnessVersion: '1.0.0',
  sourceHash: 'local-fixture-generated-at-build-time',
  moduleEntry: 'harnesses/flutter/lib/runtime/runtime.dart#CheckoutScreen',
  requiredFixtures: <String>['address_default', 'payment_card'],
  requiredAssets: <String>[],
  capabilities: <String, bool>{
    'network': false,
    'authentication': false,
    'payment_execution': false,
    'push': false,
    'fixture_only': true,
  },
  assemblyCommand:
      'cd harnesses/flutter && flutter pub get && flutter analyze && flutter test',
  runCommand:
      'cd harnesses/flutter && flutter run --dart-define=EXAMPLE_ID=commerce-checkout-address',
  verification: ArtifactVerification(
    nativeBuild: 'unverified',
    nativeCapture: 'unverified',
  ),
  profiles: <String>[
    'compact',
    'standard',
    'large',
    'short-keyboard',
    'large-text',
  ],
);

ArtifactManifest getExampleArtifactManifest(String exampleId) {
  if (exampleId != checkoutManifest.exampleId) {
    throw ArgumentError('unknown Flutter example: $exampleId');
  }
  return checkoutManifest;
}
