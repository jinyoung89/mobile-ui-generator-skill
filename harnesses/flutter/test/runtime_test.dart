import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile_ui_generator_flutter_harness/main.dart';
import 'package:mobile_ui_generator_flutter_harness/registry.dart';
import 'package:mobile_ui_generator_flutter_harness/runtime/runtime.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test(
    'profiles pin viewport, safe area, keyboard, and text scale metrics',
    () {
      expect(
        profileTable.keys,
        containsAll(<String>[
          'compact',
          'standard',
          'large',
          'short-keyboard',
          'large-text',
        ]),
      );
      expect(resolveProfile('standard').viewport, const Size(390, 844));
      expect(resolveProfile('standard').safeArea.top, 59);
      expect(resolveProfile('short-keyboard').keyboard.inset, 325);
      expect(resolveProfile('large-text').textScale, 1.3);
      expect(() => resolveProfile('missing'), throwsArgumentError);
    },
  );

  testWidgets(
    'checkout uses SafeArea, MediaQuery, scrolling, theme, and text scaling',
    (tester) async {
      await tester.pumpWidget(const ShowcaseApp(profileName: 'standard'));

      expect(find.byType(SafeArea), findsOneWidget);
      expect(find.byType(SingleChildScrollView), findsOneWidget);
      expect(find.byKey(const Key('screen-scroll')), findsOneWidget);
      expect(find.byKey(const Key('primary-action')), findsOneWidget);
      expect(find.text('배송지를 확인할게요'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);

      final mediaQuery = tester.widget<MediaQuery>(
        find.byType(MediaQuery).first,
      );
      expect(mediaQuery.data.textScaler.scale(16), 16);
      expect(find.byType(Theme), findsAtLeastNWidgets(1));
    },
  );

  testWidgets(
    'keyboard profile exposes bottom view inset and keeps action visible',
    (tester) async {
      await tester.pumpWidget(const ShowcaseApp(profileName: 'short-keyboard'));
      final mediaQueries = tester.widgetList<MediaQuery>(
        find.byType(MediaQuery),
      );
      expect(
        mediaQueries.any((query) => query.data.viewInsets.bottom == 325),
        true,
      );
      expect(find.byKey(const Key('primary-action')), findsOneWidget);
    },
  );

  testWidgets(
    'large text profile scales labels without leaving the fixture screen',
    (tester) async {
      await tester.pumpWidget(const ShowcaseApp(profileName: 'large-text'));
      final mediaQueries = tester.widgetList<MediaQuery>(
        find.byType(MediaQuery),
      );
      expect(
        mediaQueries.any((query) => query.data.textScaler.scale(16) == 20.8),
        true,
      );
      expect(find.text('결제 수단'), findsOneWidget);
      expect(find.text('신한카드 ···· 1234'), findsOneWidget);
    },
  );

  testWidgets('fixture action changes only local state', (tester) async {
    await tester.pumpWidget(const ShowcaseApp(profileName: 'standard'));
    expect(find.text('결제하기'), findsOneWidget);
    await tester.tap(find.byKey(const Key('submit-payment')));
    await tester.pump();
    expect(find.text('결제가 완료됐어요'), findsOneWidget);
    expect(
      fixtureAction('unknown', 'press', 'default'),
      const FixtureActionResult('default', FixtureOutcome.ignored),
    );
  });

  test('registry exposes explicit native-unverified evidence', () {
    expect(exampleRegistry, contains('commerce-checkout-address'));
    final verification = getExampleArtifactManifest(
      'commerce-checkout-address',
    ).verification;
    expect(verification.nativeBuild, 'unverified');
    expect(verification.nativeCapture, 'unverified');
  });
}
