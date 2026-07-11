// Generated from canonical IR mobility-map-booking; 한국어 + English; fixture-only.
import SwiftUI

struct MobilityMapBookingScreen: View {
  @Environment(\.dynamicTypeSize) private var dynamicTypeSize
  @FocusState private var focused: Bool
  @State private var locale = "ko"; @State private var screenState = "default"; @State private var input = ""; @State private var secondaryInput = ""
  private var model: ProofFixture { proofFixtures[locale] ?? proofFixtures["ko"]! }
  var body: some View {
    ScrollView { VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .top) { VStack(alignment: .leading, spacing: 6) { Text(model.title).font(.system(size: 26, weight: .bold)).accessibilityAddTraits(.isHeader); Text(model.subtitle).font(.body).foregroundStyle(.secondary) }; Spacer(); Button(locale == "ko" ? "EN" : "KO") { locale = locale == "ko" ? "en" : "ko" }.frame(minWidth: 44, minHeight: 44).buttonStyle(.bordered) }
      RoundedRectangle(cornerRadius: 12).fill(Color.green.opacity(0.14)).frame(height: 280).overlay(ZStack { Path { path in path.move(to: CGPoint(x: 70, y: 70)); path.addCurve(to: CGPoint(x: 270, y: 210), control1: CGPoint(x: 170, y: 80), control2: CGPoint(x: 170, y: 210)) }.stroke(.tint, lineWidth: 5); Text("A").proofPin().position(x: 70, y: 70); Text("B").proofPin().position(x: 270, y: 210); Text(model.item_meta).font(.caption.bold()).padding(10).background(.background, in: RoundedRectangle(cornerRadius: 10)).position(x: 285, y: 30) }).accessibilityLabel(model.map_label); proofCard(model.item_title, model.item_body)
    }.padding(.horizontal, 16).padding(.top, 24).padding(.bottom, 100).frame(maxWidth: .infinity, alignment: .leading) }
    .scrollDismissesKeyboard(.interactively).dynamicTypeSize(...DynamicTypeSize.accessibility3)
    .safeAreaInset(edge: .bottom, spacing: 0) { Button(screenState == "success" ? model.success_label : model.primary_cta) { screenState = "success"; focused = false }.frame(maxWidth: .infinity, minHeight: 52).buttonStyle(.borderedProminent).clipShape(RoundedRectangle(cornerRadius: 12)).padding(.horizontal, 16).padding(.vertical, 12).background(.ultraThinMaterial) }
  }
  private func proofCard(_ title: String, _ body: String) -> some View { VStack(alignment: .leading, spacing: 6) { Text(title).font(.headline); Text(body).font(.body).foregroundStyle(.secondary) }.padding(16).frame(maxWidth: .infinity, alignment: .leading).background(Color.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 12)) }
}
private extension View { func proofBubble(_ background: Color, foreground: Color = .primary, alignment: Alignment) -> some View { self.padding(12).foregroundStyle(foreground).background(background, in: RoundedRectangle(cornerRadius: 18)).frame(maxWidth: .infinity, alignment: alignment) } }
private extension Text { func proofPin() -> some View { self.frame(width: 38, height: 38).foregroundStyle(.white).background(Color.accentColor, in: Circle()).overlay(Circle().stroke(.white, lineWidth: 4)) } }
