package de.atmspro.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * P31F13: aktuelle bestätigte ATMS-Weboberfläche als lokale Android-Assets.
 * Die DUS-Abfrage läuft weiterhin ausschließlich über die bestätigte Native Flight Bridge.
 * P36F8: Native Datei-Auswahl für Bild/Planliste via Android-Systempicker wiederhergestellt.
 */
public final class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST_CODE = 3608;

    private WebView webView;
    private ValueCallback<Uri[]> pendingFileChooser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.atmsWebView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        // Erforderlich, damit vom Android-Systempicker gelieferte content://-URIs
        // vom lokalen WebView-Uploadfeld gelesen werden können.
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        // Android-Objekt bewusst unter einem Host-Namen veröffentlichen.
        // Die ATMS-kompatible JS-Hülle wird erst nach dem Laden injiziert.
        webView.addJavascriptInterface(new AtmsNativeFlightBridge(), "ATMSNativeFlightBridgeHost");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(
                    WebView view,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams) {
                if (pendingFileChooser != null) {
                    pendingFileChooser.onReceiveValue(null);
                }
                pendingFileChooser = filePathCallback;

                try {
                    Intent chooserIntent = fileChooserParams.createIntent();
                    chooserIntent.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                    return true;
                } catch (ActivityNotFoundException | SecurityException error) {
                    pendingFileChooser.onReceiveValue(null);
                    pendingFileChooser = null;
                    return false;
                }
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                installAtmsBridge(view);
            }
        });
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST_CODE || pendingFileChooser == null) {
            return;
        }

        Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        pendingFileChooser.onReceiveValue(result);
        pendingFileChooser = null;
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
