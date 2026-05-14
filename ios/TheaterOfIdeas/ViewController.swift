import UIKit
import WebKit

final class ViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!

    override func loadView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.961, green: 0.949, blue: 0.925, alpha: 1)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.bounces = false
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        loadLocalApp()
    }

    private func loadLocalApp() {
        guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else {
            assertionFailure("index.html is missing from the app bundle.")
            return
        }

        do {
            let html = try String(contentsOf: url, encoding: .utf8)
            webView.loadHTMLString(html, baseURL: url.deletingLastPathComponent())
        } catch {
            assertionFailure("Unable to load index.html: \(error)")
        }
    }
}
