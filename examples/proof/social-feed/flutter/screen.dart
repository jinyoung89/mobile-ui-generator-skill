// Generated from canonical IR social-feed; 한국어 + English; fixture-only.
import 'package:flutter/material.dart';
import 'fixtures.dart';

class SocialFeedScreen extends StatefulWidget { const SocialFeedScreen({super.key, this.initialState = 'default'}); final String initialState; @override State<SocialFeedScreen> createState() => _SocialFeedScreenState(); }
class _SocialFeedScreenState extends State<SocialFeedScreen> {
  String locale = 'ko'; late String screenState; bool acknowledged = true;
  @override void initState() { super.initState(); screenState = requiredStates.contains(widget.initialState) ? widget.initialState : 'default'; }
  @override Widget build(BuildContext context) {
    final model = proofFixtures[locale]!; final stateModel = stateFixtures[locale]![screenState]!; final media = MediaQuery.of(context); final scaler = MediaQuery.textScalerOf(context); final canSubmit = !stateModel.blocksPrimary;
    return SafeArea(child: Scaffold(backgroundColor: const Color(0xFFFFFFFF), body: Column(children: [
      Expanded(child: SingleChildScrollView(key: const Key('proof-scroll'), keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag, padding: EdgeInsets.fromLTRB(16, 24, 16, 100 + media.viewInsets.bottom), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(model['title']!, textScaler: scaler, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)), SizedBox(height: 6), Text(model['subtitle']!)])), Semantics(label: model['switch_language_label'], button: true, child: TextButton(onPressed: () => setState(() => locale = locale == 'ko' ? 'en' : 'ko'), child: Text(locale == 'ko' ? 'EN' : 'KO')))]),
        if (screenState != 'default') ...[SizedBox(height: 12), _StatePanel(stateModel: stateModel, onRecover: stateModel.recoverTo == null ? null : () => setState(() => screenState = stateModel.recoverTo!))],
        SizedBox(height: 24), Row(children: const [CircleAvatar(child: Text('UI')), SizedBox(width: 12), CircleAvatar(child: Text('UX')), SizedBox(width: 12), CircleAvatar(child: Text('DEV'))]), SizedBox(height: 12), _Card(model['item_title']!, model['item_body']!, 16, 12), SizedBox(height: 12), Container(height: 220, alignment: Alignment.center, decoration: BoxDecoration(color: const Color(0xFFE8EDF4), borderRadius: BorderRadius.circular(12)), child: Text(model['media_label']!))
      ]))),
      Container(padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + media.padding.bottom + media.viewInsets.bottom), child: SizedBox(height: 52, width: double.infinity, child: FilledButton(onPressed: canSubmit ? () { setState(() => screenState = 'loading'); Future.microtask(() { if (mounted) setState(() => screenState = 'success'); }); } : null, child: stateModel.busy ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2)) : Text(stateModel.actionLabel))))
    ])));
  }
}
class _Card extends StatelessWidget { const _Card(this.title, this.body, this.padding, this.radius); final String title; final String body; final double padding; final double radius; @override Widget build(BuildContext context) => Container(padding: EdgeInsets.all(padding), decoration: BoxDecoration(color: const Color(0xFFF7F9FC), borderRadius: BorderRadius.circular(radius)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(height: 6), Text(body)])); }
class _StatePanel extends StatelessWidget { const _StatePanel({required this.stateModel, required this.onRecover}); final ProofStateFixture stateModel; final VoidCallback? onRecover; @override Widget build(BuildContext context) => Semantics(liveRegion: true, child: Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [if (stateModel.busy) const LinearProgressIndicator(), Text(stateModel.title, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(height: 6), Text(stateModel.body), if (onRecover != null) TextButton(onPressed: onRecover, child: Text(stateModel.recoveryLabel))])))); }
