import 'package:flutter/material.dart';
import 'fixtures.dart';

class {{SCREEN_WIDGET}} extends StatefulWidget {
  const {{SCREEN_WIDGET}}({super.key});
  @override State<{{SCREEN_WIDGET}}> createState() => _{{SCREEN_WIDGET}}State();
}

class _{{SCREEN_WIDGET}}State extends State<{{SCREEN_WIDGET}}> {
  String state = '{{DEFAULT_STATE}}';
  @override
  Widget build(BuildContext context) {
    final model = fixtures[state] ?? fixtures['default']!;
    return Scaffold(
      backgroundColor: const Color({{SURFACE_COLOR_DART}}),
      body: SafeArea(
        child: LayoutBuilder(builder: (context, constraints) => SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB({{SCREEN_INSET_DP}}, {{APP_BAR_VERTICAL_DP}}, {{SCREEN_INSET_DP}}, {{BOTTOM_CLEARANCE_DP}}),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight - {{APP_BAR_VERTICAL_DP}} - {{BOTTOM_CLEARANCE_DP}}),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Text(model.title, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: {{COMPONENT_GAP_DP}}),
              Text(model.body),
              const Spacer(),
              const SizedBox(height: {{SECTION_GAP_DP}}),
              SizedBox(height: {{CONTROL_HEIGHT_DP}}, child: Semantics(
                button: true,
                label: '{{PRIMARY_LABEL}}',
                child: ElevatedButton(onPressed: state == 'loading' || state == 'disabled' ? null : () => setState(() => state = '{{ACTION_SUCCESS_STATE}}'), child: const Text('{{PRIMARY_LABEL}}')),
              )),
            ]),
          ),
        )),
      ),
    );
  }
}
