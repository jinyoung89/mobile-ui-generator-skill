import SwiftUI

struct {{SCREEN_VIEW}}: View {
    @State private var state = "{{DEFAULT_STATE}}"
    private var model: ScreenFixture { fixtures[state] ?? fixtures["default"]! }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: {{COMPONENT_GAP_PT}}) {
                    Text(model.title).font(.system(size: {{TITLE_FONT_SIZE_PT}}, weight: .{{TITLE_FONT_WEIGHT_SWIFT}}))
                    Text(model.body).font(.system(size: {{BODY_FONT_SIZE_PT}}))
                    Spacer(minLength: {{SECTION_GAP_PT}})
                    Button("{{PRIMARY_LABEL}}") { state = "{{ACTION_SUCCESS_STATE}}" }
                        .frame(maxWidth: .infinity, minHeight: {{CONTROL_HEIGHT_PT}})
                        .buttonStyle(.borderedProminent)
                        .disabled(state == "loading" || state == "disabled")
                        .accessibilityLabel("{{PRIMARY_LABEL}}")
                }
                .padding(.horizontal, {{SCREEN_INSET_PT}})
                .padding(.top, {{APP_BAR_VERTICAL_PT}})
                .padding(.bottom, {{BOTTOM_CLEARANCE_PT}})
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("{{SCREEN_TITLE}}")
        }
        .tint(Color("{{ACTION_COLOR_ASSET}}"))
    }
}
