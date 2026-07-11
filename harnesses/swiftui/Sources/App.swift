import SwiftUI

@main
struct MobileUIShowcaseApp: App {
    private let launch = LaunchConfiguration(arguments: ProcessInfo.processInfo.arguments)

    var body: some Scene {
        WindowGroup {
            ShowcaseRoot(
                exampleID: launch.exampleID,
                profileName: launch.profileName,
                state: launch.state
            )
        }
    }
}

struct ShowcaseRoot: View {
    let exampleID: String
    let profileName: String
    let state: String

    var body: some View {
        if exampleID == checkoutManifest.exampleID {
            CheckoutScreen(profile: resolveProfile(profileName), initialState: state)
        } else {
            ContentUnavailableView("예시를 찾을 수 없어요", systemImage: "questionmark.circle")
        }
    }
}

struct LaunchConfiguration {
    let exampleID: String
    let profileName: String
    let state: String

    init(arguments: [String]) {
        func value(after flag: String, fallback: String) -> String {
            guard let index = arguments.firstIndex(of: flag), arguments.indices.contains(index + 1) else { return fallback }
            return arguments[index + 1]
        }
        exampleID = value(after: "--example-id", fallback: checkoutManifest.exampleID)
        profileName = value(after: "--profile", fallback: "standard")
        state = value(after: "--state", fallback: "default")
    }
}

