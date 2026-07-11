import 'package:flutter/material.dart';

class KeyboardMetrics {
  final bool open;
  final double height;
  final double inset;

  const KeyboardMetrics({
    required this.open,
    required this.height,
    required this.inset,
  });
}

class NativeProfile {
  final String name;
  final Size viewport;
  final double pixelRatio;
  final EdgeInsets safeArea;
  final double textScale;
  final KeyboardMetrics keyboard;
  final Brightness brightness;

  const NativeProfile({
    required this.name,
    required this.viewport,
    required this.pixelRatio,
    required this.safeArea,
    required this.textScale,
    required this.keyboard,
    this.brightness = Brightness.light,
  });
}

const profileTable = <String, NativeProfile>{
  'compact': NativeProfile(
    name: 'compact',
    viewport: Size(320, 568),
    pixelRatio: 3,
    safeArea: EdgeInsets.only(top: 59, bottom: 34),
    textScale: 1,
    keyboard: KeyboardMetrics(open: false, height: 0, inset: 34),
  ),
  'standard': NativeProfile(
    name: 'standard',
    viewport: Size(390, 844),
    pixelRatio: 3,
    safeArea: EdgeInsets.only(top: 59, bottom: 34),
    textScale: 1,
    keyboard: KeyboardMetrics(open: false, height: 0, inset: 34),
  ),
  'large': NativeProfile(
    name: 'large',
    viewport: Size(430, 932),
    pixelRatio: 3,
    safeArea: EdgeInsets.only(top: 59, bottom: 34),
    textScale: 1,
    keyboard: KeyboardMetrics(open: false, height: 0, inset: 34),
  ),
  'short-keyboard': NativeProfile(
    name: 'short-keyboard',
    viewport: Size(390, 667),
    pixelRatio: 3,
    safeArea: EdgeInsets.only(top: 59, bottom: 34),
    textScale: 1,
    keyboard: KeyboardMetrics(open: true, height: 291, inset: 325),
  ),
  'large-text': NativeProfile(
    name: 'large-text',
    viewport: Size(390, 844),
    pixelRatio: 3,
    safeArea: EdgeInsets.only(top: 59, bottom: 34),
    textScale: 1.3,
    keyboard: KeyboardMetrics(open: false, height: 0, inset: 34),
  ),
};

NativeProfile resolveProfile(String name) {
  final profile = profileTable[name];
  if (profile == null) {
    throw ArgumentError('unknown Flutter profile: $name');
  }
  return profile;
}

enum FixtureOutcome { localState, ignored }

class FixtureActionResult {
  final String state;
  final FixtureOutcome outcome;

  const FixtureActionResult(this.state, this.outcome);

  @override
  bool operator ==(Object other) =>
      other is FixtureActionResult &&
      other.state == state &&
      other.outcome == outcome;

  @override
  int get hashCode => Object.hash(state, outcome);
}

FixtureActionResult fixtureAction(
  String actionId,
  String event,
  String currentState,
) {
  if (actionId != 'submit-payment' || event != 'press') {
    return FixtureActionResult(currentState, FixtureOutcome.ignored);
  }
  return const FixtureActionResult('success', FixtureOutcome.localState);
}

class RuntimeContract {
  final double safeAreaTop;
  final double safeAreaBottom;
  final double contentBottomPadding;
  final double keyboardBottomInset;
  final String scrollOwner;
  final String fixedRegion;

  const RuntimeContract({
    required this.safeAreaTop,
    required this.safeAreaBottom,
    required this.contentBottomPadding,
    required this.keyboardBottomInset,
    required this.scrollOwner,
    required this.fixedRegion,
  });
}

RuntimeContract runtimeContract({
  required EdgeInsets safeArea,
  required double stickyRegionHeight,
  required double scrollContentBottomInset,
  required KeyboardMetrics keyboard,
}) {
  return RuntimeContract(
    safeAreaTop: safeArea.top,
    safeAreaBottom: safeArea.bottom,
    contentBottomPadding: stickyRegionHeight + scrollContentBottomInset,
    keyboardBottomInset: keyboard.open ? keyboard.inset : safeArea.bottom,
    scrollOwner: 'screen-scroll',
    fixedRegion: 'primary-action',
  );
}

class CheckoutScreen extends StatefulWidget {
  final NativeProfile profile;

  const CheckoutScreen({super.key, required this.profile});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String screenState = 'default';
  String address = '';

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final contract = runtimeContract(
      safeArea: media.padding,
      stickyRegionHeight: 84,
      scrollContentBottomInset: 100,
      keyboard: widget.profile.keyboard,
    );
    final bottomClearance =
        contract.contentBottomPadding +
        media.padding.bottom +
        media.viewInsets.bottom;

    return SafeArea(
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: Column(
          children: <Widget>[
            Expanded(
              child: SingleChildScrollView(
                key: const Key('screen-scroll'),
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                padding: EdgeInsets.fromLTRB(16, 24, 16, bottomClearance),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    Text(
                      'COMMERCE · CHECKOUT',
                      style: Theme.of(context).textTheme.labelSmall,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '배송지를 확인할게요',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '안전한 결제를 위해 주문 정보를 확인합니다.',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      key: const Key('address-field'),
                      decoration: const InputDecoration(
                        labelText: '배송지',
                        hintText: '서울시 강남구 테헤란로 123',
                      ),
                      minLines: 1,
                      maxLines: 2,
                      onChanged: (value) => setState(() => address = value),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Text(
                              '결제 수단',
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                            const SizedBox(height: 2),
                            const Text('신한카드 ···· 1234'),
                          ],
                        ),
                      ),
                    ),
                    if (address.isNotEmpty) const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
            Container(
              key: const Key('primary-action'),
              padding: EdgeInsets.fromLTRB(
                16,
                12,
                16,
                12 + media.padding.bottom,
              ),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: Border(
                  top: BorderSide(color: Theme.of(context).dividerColor),
                ),
              ),
              child: SizedBox(
                height: 52,
                width: double.infinity,
                child: FilledButton(
                  key: const Key('submit-payment'),
                  onPressed: () => setState(
                    () => screenState = fixtureAction(
                      'submit-payment',
                      'press',
                      screenState,
                    ).state,
                  ),
                  child: Text(screenState == 'success' ? '결제가 완료됐어요' : '결제하기'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
