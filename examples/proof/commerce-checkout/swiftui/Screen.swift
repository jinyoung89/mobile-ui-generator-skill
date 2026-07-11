// Generated from canonical IR commerce-checkout-address; 한국어 + English; fixture-only.
import SwiftUI

struct CommerceCheckoutAddressScreen: View {
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize
  @FocusState private var focused: Bool
  @State private var locale = "ko"; @State private var screenState: String; @State private var input = ""; @State private var secondaryInput = ""; @State private var acknowledged: Bool
  init(initialState: String = "default") { _screenState = State(initialValue: requiredStates.contains(initialState) ? initialState : "default"); _acknowledged = State(initialValue: true) }
  private var model: ProofFixture { proofFixtures[locale] ?? proofFixtures["ko"]! }
  private var stateModel: ProofStateFixture { stateFixtures[locale]?[screenState] ?? stateFixtures["ko"]!["default"]! }
  var body: some View {
    ScrollView { VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .top) { VStack(alignment: .leading, spacing: 6) { Text(model.title).font(.system(size: 26, weight: .bold)).accessibilityAddTraits(.isHeader); Text(model.subtitle).font(.body).foregroundStyle(.secondary) }; Spacer(); Button(locale == "ko" ? "EN" : "KO") { locale = locale == "ko" ? "en" : "ko" }.accessibilityLabel(model.switch_language_label).frame(minWidth: 44, minHeight: 44).buttonStyle(.bordered) }
      if screenState != "default" { VStack(alignment: .leading, spacing: 6) { if stateModel.busy { ProgressView() }; Text(stateModel.title).font(.headline); Text(stateModel.body).foregroundStyle(.secondary); if let recoverTo = stateModel.recoverTo { Button(stateModel.recoveryLabel) { screenState = recoverTo } } }.padding(16).frame(maxWidth: .infinity, alignment: .leading).background(Color.accentColor.opacity(0.08), in: RoundedRectangle(cornerRadius: 12)).accessibilityElement(children: .combine) }
      proofCard(model.item_title, model.amount); TextField(model.field_label, text: $input).textFieldStyle(.roundedBorder).frame(minHeight: 52).focused($focused).onChange(of: input) { _, value in screenState = value.isEmpty ? "default" : "filled" }; proofCard(model.secondary_label, model.item_meta)
    }.padding(.horizontal, 16).padding(.top, 24).padding(.bottom, 100).frame(maxWidth: .infinity, alignment: .leading) }
    .scrollDismissesKeyboard(.interactively).dynamicTypeSize(...DynamicTypeSize.accessibility3)
    .safeAreaInset(edge: .bottom, spacing: 0) { Button(stateModel.actionLabel) { screenState = "loading"; focused = false; DispatchQueue.main.async { screenState = "success" } }.frame(maxWidth: .infinity, minHeight: 52).buttonStyle(.borderedProminent).clipShape(RoundedRectangle(cornerRadius: 12)).disabled(stateModel.blocksPrimary).accessibilityLabel(stateModel.actionLabel).padding(.horizontal, 16).padding(.vertical, 12).background(.ultraThinMaterial) }
  }
  private func proofCard(_ title: String, _ body: String) -> some View { VStack(alignment: .leading, spacing: 6) { Text(title).font(.headline); Text(body).font(.body).foregroundStyle(.secondary) }.padding(16).frame(maxWidth: .infinity, alignment: .leading).background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 12)) }
}
private extension View { func proofBubble(_ background: Color, foreground: Color = .primary, alignment: Alignment) -> some View { self.padding(12).foregroundStyle(foreground).background(background, in: RoundedRectangle(cornerRadius: 18)).frame(maxWidth: .infinity, alignment: alignment) } }
private extension Text { func proofPin() -> some View { self.frame(width: 38, height: 38).foregroundStyle(.white).background(Color.accentColor, in: Circle()).overlay(Circle().stroke(.white, lineWidth: 4)) } }
