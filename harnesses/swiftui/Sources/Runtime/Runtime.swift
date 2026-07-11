import SwiftUI

struct RuntimeContract: Equatable {
    let safeAreaTop: CGFloat
    let safeAreaBottom: CGFloat
    let contentBottomPadding: CGFloat
    let keyboardBottomInset: CGFloat
    let scrollOwner: String
    let fixedRegion: String
}

func runtimeContract(profile: NativeProfile, stickyRegionHeight: CGFloat = 84, scrollContentBottomInset: CGFloat = 100) -> RuntimeContract {
    RuntimeContract(
        safeAreaTop: profile.safeArea.top,
        safeAreaBottom: profile.safeArea.bottom,
        contentBottomPadding: stickyRegionHeight + scrollContentBottomInset,
        keyboardBottomInset: profile.keyboardOpen ? profile.keyboardInset : profile.safeArea.bottom,
        scrollOwner: "screen-scroll",
        fixedRegion: "primary-action"
    )
}

struct CheckoutScreen: View {
    let profile: NativeProfile
    var initialState: String = "default"

    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @FocusState private var focusedField: Field?
    @State private var address = ""
    @State private var screenState: String

    private enum Field: Hashable { case address }

    init(profile: NativeProfile, initialState: String = "default") {
        self.profile = profile
        self.initialState = initialState
        _screenState = State(initialValue: initialState)
    }

    var body: some View {
        let contract = runtimeContract(profile: profile)
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                Text("COMMERCE · CHECKOUT")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color(.secondaryLabel))
                    .accessibilityHidden(true)
                Text("배송지를 확인할게요")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(Color(.label))
                    .dynamicTypeSize(...DynamicTypeSize.accessibility3)
                    .accessibilityAddTraits(.isHeader)
                Text("안전한 결제를 위해 주문 정보를 확인합니다.")
                    .font(.body)
                    .foregroundStyle(Color(.secondaryLabel))
                    .dynamicTypeSize(...DynamicTypeSize.accessibility3)
                VStack(alignment: .leading, spacing: 6) {
                    Text("배송지")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color(.label))
                    TextField("서울시 강남구 테헤란로 123", text: $address)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.default)
                        .frame(minHeight: 52)
                        .focused($focusedField, equals: .address)
                        .submitLabel(.done)
                        .accessibilityLabel("배송지")
                        .accessibilityHint("배송지를 입력하세요")
                }
                .padding(16)
                .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
                Text("신한카드 ···· 1234")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Color(.label))
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
            }
            .padding(16)
            .padding(.bottom, contract.contentBottomPadding + contract.safeAreaBottom)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .scrollDismissesKeyboard(.interactively)
        .accessibilityIdentifier(contract.scrollOwner)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            Button {
                let result = fixtureAction(actionID: "submit-payment", event: "press", currentState: screenState)
                screenState = result.state
                focusedField = nil
            } label: {
                Text(screenState == "success" ? "결제가 완료됐어요" : "결제하기")
                    .frame(maxWidth: .infinity, minHeight: 52)
            }
            .buttonStyle(.borderedProminent)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .accessibilityLabel("결제하기")
            .accessibilityIdentifier(contract.fixedRegion)
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, contract.safeAreaBottom)
            .background(.ultraThinMaterial)
        }
        .background(Color(.systemBackground))
        .scrollIndicators(.hidden)
        .environment(\.sizeCategory, profile.textScale > 1 ? .accessibilityMedium : .large)
        .onChange(of: dynamicTypeSize) { _, _ in }
    }
}
