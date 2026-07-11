import Foundation
import SwiftUI

let referenceDeviceName = "iPhone 15"
let referenceSimulatorID = "7732B728-22A6-4CCC-A121-C1F2BDC5EC23"

struct VerificationStatus: Equatable {
    let nativeBuild: String
    let nativeCapture: String
}

struct SwiftUIArtifactManifest: Equatable {
    let manifestVersion: String
    let exampleID: String
    let platform: String
    let harnessVersion: String
    let requiredFixtures: [String]
    let verification: VerificationStatus
    let profiles: [String]
}

struct NativeProfile: Equatable {
    let name: String
    let viewport: CGSize
    let safeArea: EdgeInsets
    let textScale: CGFloat
    let keyboardOpen: Bool
    let keyboardInset: CGFloat
}

let checkoutManifest = SwiftUIArtifactManifest(
    manifestVersion: "1.0.0",
    exampleID: "commerce-checkout-address",
    platform: "swiftui",
    harnessVersion: "1.0.0",
    requiredFixtures: ["address_default", "payment_card"],
    verification: VerificationStatus(nativeBuild: "unverified", nativeCapture: "unverified"),
    profiles: ["compact", "standard", "large", "short-keyboard", "large-text"]
)

let profileTable: [String: NativeProfile] = [
    "compact": NativeProfile(name: "compact", viewport: CGSize(width: 320, height: 568), safeArea: EdgeInsets(top: 59, leading: 0, bottom: 34, trailing: 0), textScale: 1, keyboardOpen: false, keyboardInset: 34),
    "standard": NativeProfile(name: "standard", viewport: CGSize(width: 390, height: 844), safeArea: EdgeInsets(top: 59, leading: 0, bottom: 34, trailing: 0), textScale: 1, keyboardOpen: false, keyboardInset: 34),
    "large": NativeProfile(name: "large", viewport: CGSize(width: 430, height: 932), safeArea: EdgeInsets(top: 59, leading: 0, bottom: 34, trailing: 0), textScale: 1, keyboardOpen: false, keyboardInset: 34),
    "short-keyboard": NativeProfile(name: "short-keyboard", viewport: CGSize(width: 390, height: 667), safeArea: EdgeInsets(top: 59, leading: 0, bottom: 34, trailing: 0), textScale: 1, keyboardOpen: true, keyboardInset: 325),
    "large-text": NativeProfile(name: "large-text", viewport: CGSize(width: 390, height: 844), safeArea: EdgeInsets(top: 59, leading: 0, bottom: 34, trailing: 0), textScale: 1.3, keyboardOpen: false, keyboardInset: 34),
]

func resolveProfile(_ name: String) -> NativeProfile {
    profileTable[name] ?? profileTable["standard"]!
}

func fixtureAction(actionID: String, event: String, currentState: String) -> (state: String, outcome: String) {
    guard actionID == "submit-payment", event == "press" else { return (currentState, "ignored") }
    return ("success", "local_state")
}
