package de.atmspro.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * P31F13: aktuelle bestätigte ATMS-Weboberfläche als lokale Android-Assets.
 * Die DUS-Abfrage läuft weiterhin ausschließlich über die bestätigte Native Flight Bridge.
 */
public final class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.atmsWebView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        // Android-Objekt bewusst unter einem Host-Namen veröffentlichen.
        // Die ATMS-kompatible JS-Hülle wird erst nach dem Laden injiziert.
        webView.addJavascriptInterface(new AtmsNativeFlightBridge(), "ATMSNativeFlightBridgeHost");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                installAtmsBridge(view);
            }
        });

        webView.loadUrl("file:///android_asset/index.html");
    }

    private static void installAtmsBridge(WebView view) {
        String script = "(function(){"
                + "if(!window.ATMSNativeFlightBridgeHost)return;"
                + "window.ATMSNativeFlightBridge={"
                + "contractVersion:'ATMS-FLIGHT-NATIVE-1',"
                + "requestJsonString:function(s){return window.ATMSNativeFlightBridgeHost.requestJsonString(String(s));},"
                + "lastError:function(){return window.ATMSNativeFlightBridgeHost.lastError();}"
                + "};"
                + "try{if(typeof window.ATMSNotifyNativeFlightBridgeReady==='function'){window.ATMSNotifyNativeFlightBridgeReady();}}catch(e){}"
                + "try{window.dispatchEvent(new CustomEvent('atms-native-flight-bridge-ready'));}catch(e){}"
                + "})();";
        view.evaluateJavascript(script, null);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
