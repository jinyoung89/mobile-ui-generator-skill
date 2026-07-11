import XCTest
@testable import MobileUIShowcase

final class RuntimeTests: XCTestCase {
    func testSafeAreaAndFixedRegionContract() {
        let profile = resolveProfile("standard")
        let contract = runtimeContract(profile: profile)
        XCTAssertEqual(contract.safeAreaTop, 59)
        XCTAssertEqual(contract.safeAreaBottom, 34)
        XCTAssertEqual(contract.contentBottomPadding, 184)
        XCTAssertEqual(contract.fixedRegion, "primary-action")
    }

    func testKeyboardInsetKeepsPrimaryActionVisible() {
        let contract = runtimeContract(profile: resolveProfile("short-keyboard"))
        XCTAssertEqual(contract.keyboardBottomInset, 325)
        XCTAssertEqual(contract.scrollOwner, "screen-scroll")
    }

    func testLocalFixtureActionDoesNotUseExternalServices() {
        XCTAssertEqual(fixtureAction(actionID: "submit-payment", event: "press", currentState: "default").state, "success")
        XCTAssertEqual(fixtureAction(actionID: "unknown", event: "press", currentState: "default").outcome, "ignored")
    }
}

