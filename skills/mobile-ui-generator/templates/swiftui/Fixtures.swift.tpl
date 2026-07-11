import Foundation

struct ScreenFixture { let title: String; let body: String }
let fixtures: [String: ScreenFixture] = [
    "{{DEFAULT_STATE}}": ScreenFixture(title: "{{DEFAULT_TITLE}}", body: "{{DEFAULT_BODY}}"),
    "{{ACTION_SUCCESS_STATE}}": ScreenFixture(title: "{{SUCCESS_TITLE}}", body: "{{SUCCESS_BODY}}"),
    "loading": ScreenFixture(title: "{{LOADING_TITLE}}", body: "{{LOADING_BODY}}"),
    "error": ScreenFixture(title: "{{ERROR_TITLE}}", body: "{{ERROR_BODY}}"),
    "default": ScreenFixture(title: "{{DEFAULT_TITLE}}", body: "{{DEFAULT_BODY}}"),
]
