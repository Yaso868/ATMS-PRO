// STORAGE V2 PHASE 2A · 01.10.2026: Native Datei-Write-Read-Verifikation mit bytegenauem Vergleich + SHA-256 für .atmsarchive; bestehende Exporte bleiben kompatibel.
// CORE-007D8A1F1D8P70 · 27.09.2026: NATIVE GOOGLE MAPS ROUTE HANDOFF – Opens ATMS Google Maps routes directly in the installed Google Maps app and intercepts intent:// route handoffs inside the WebView; HTTPS fallback remains if Google Maps is unavailable.
// CORE-007D8A1F1D8P69 · 27.09.2026: NATIVE ADDRESS BOOK FILE EXPORT – Adds a dedicated Storage Access Framework bridge for user-confirmed CSV/XLSX file creation. Existing import picker, geolocation and flight bridge stay unchanged.
// CORE-007D8A1F1D8P40F1 · 24.09.2026: NATIVE LIVE NON-BLOCKING BRIDGE – P40 network requests can run off the WebView/UI thread via an async Promise bridge; existing synchronous bridge remains for backward compatibility.
package de.atmspro.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import android.util.Base64;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.util.Arrays;

/**
 * P31F13: aktuelle bestaetigte ATMS-Weboberflaeche als lokale Android-Assets.
 * Die DUS-Abfrage laeuft weiterhin ausschliesslich ueber die bestaetigte Native Flight Bridge.
 * P36F8: Native Datei-Auswahl fuer Bild/Planliste via Android-Systempicker wiederhergestellt.
 * P37B: Native Standortberechtigung + sicherer appassets-Origin fuer HTML5-Geolocation,
 *       ohne die bestaetigte Datei-/Planlisten-Auswahl zu entfernen.
 */
public final class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST_CODE = 3608;
    private static final int FILE_EXPORT_REQUEST_CODE = 6901;
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 3701;
    private static final String LOCAL_APP_URL =
            "https://appassets.androidplatform.net/assets/index.html";
    private static final String GOOGLE_MAPS_PACKAGE = "com.google.android.apps.maps";

    private WebView webView;
    private ValueCallback<Uri[]> pendingFileChooser;
    private byte[] pendingExportBytes;
    private String pendingExportRequestId;
    private boolean pendingExportVerifyReadBack;
    private String pendingGeolocationOrigin;
    private GeolocationPermissions.Callback pendingGeolocationCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.atmsWebView);

        // P97-2B: Android 13+ Predictive-Back / Randgeste explizit abfangen.
        // Auf aktuellen Android-Versionen wird die Randgeste nicht verlaesslich
        // ueber Activity.onBackPressed() zugestellt. Beide System-Randgesten
        // sollen innerhalb von ATMS navigieren und die Activity niemals direkt beenden.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    new OnBackInvokedCallback() {
                        @Override
                        public void onBackInvoked() {
                            dispatchAtmsNativeBack();
                        }
                    }
            );
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        // Fuer vom Android-Systempicker gelieferte content://-URIs weiterhin erforderlich.
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setGeolocationEnabled(true);

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Android-Objekt bewusst unter einem Host-Namen veroeffentlichen.
        // Die ATMS-kompatible JS-Huelle wird erst nach dem Laden injiziert.
        webView.addJavascriptInterface(
                new AtmsNativeFlightBridge(webView),
                "ATMSNativeFlightBridgeHost");
        webView.addJavascriptInterface(
                new AtmsNativeFileExportBridge(),
                "ATMSNativeFileExportHost");

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

            @Override
            public void onGeolocationPermissionsShowPrompt(
                    String origin,
                    GeolocationPermissions.Callback callback) {
                if (hasLocationPermission()) {
                    callback.invoke(origin, true, false);
                    return;
                }

                if (pendingGeolocationCallback != null) {
                    pendingGeolocationCallback.invoke(
                            pendingGeolocationOrigin,
                            false,
                            false);
                }
                pendingGeolocationOrigin = origin;
                pendingGeolocationCallback = callback;

                requestPermissions(
                        new String[]{
                                Manifest.permission.ACCESS_FINE_LOCATION,
                                Manifest.permission.ACCESS_COARSE_LOCATION
                        },
                        LOCATION_PERMISSION_REQUEST_CODE);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request != null && request.getUrl() != null
                        && openExternalNavigation(request.getUrl().toString())) {
                    return true;
                }
                return false;
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternalNavigation(url);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    WebResourceRequest request) {
                WebResourceResponse response =
                        assetLoader.shouldInterceptRequest(request.getUrl());
                if (response != null) {
                    return response;
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                installAtmsBridge(view);
                installAtmsFileExportBridge(view);
            }
        });

        webView.loadUrl(LOCAL_APP_URL);
    }

    private boolean openExternalNavigation(String rawUrl) {
        String value = rawUrl == null ? "" : rawUrl.trim();
        if (value.isEmpty()) {
            return false;
        }

        try {
            if (value.startsWith("intent://")) {
                Intent parsedIntent = Intent.parseUri(value, Intent.URI_INTENT_SCHEME);
                Uri routeUri = parsedIntent.getData();
                if (isGoogleMapsRouteUri(routeUri)) {
                    launchGoogleMapsRoute(routeUri);
                    return true;
                }
                return false;
            }

            Uri uri = Uri.parse(value);
            if (isGoogleMapsRouteUri(uri)) {
                launchGoogleMapsRoute(uri);
                return true;
            }
        } catch (Exception ignored) {
            String fallbackUrl = value;
            int marker = fallbackUrl.indexOf("#Intent;");
            if (marker >= 0) {
                fallbackUrl = fallbackUrl.substring(0, marker);
            }
            if (fallbackUrl.startsWith("intent://")) {
                fallbackUrl = "https://" + fallbackUrl.substring("intent://".length());
            }
            try {
                Uri fallbackUri = Uri.parse(fallbackUrl);
                if (isGoogleMapsRouteUri(fallbackUri)) {
                    launchGoogleMapsRoute(fallbackUri);
                    return true;
                }
            } catch (Exception ignoredFallback) {
                // Ungueltiger intent://-Wert wird unten nur aus der WebView abgefangen.
            }
            return value.startsWith("intent://www.google.com/maps/dir/")
                    || value.startsWith("intent://maps.google.com/maps/dir/");
        }
        return false;
    }

    private static boolean isGoogleMapsRouteUri(Uri uri) {
        if (uri == null) {
            return false;
        }
        String scheme = uri.getScheme();
        String host = uri.getHost();
        String path = uri.getPath();
        boolean webScheme = "https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme);
        boolean googleHost = "www.google.com".equalsIgnoreCase(host)
                || "google.com".equalsIgnoreCase(host)
                || "maps.google.com".equalsIgnoreCase(host);
        return webScheme && googleHost && path != null && path.startsWith("/maps/dir");
    }

    private void launchGoogleMapsRoute(Uri routeUri) {
        Intent mapsIntent = new Intent(Intent.ACTION_VIEW, routeUri);
        mapsIntent.setPackage(GOOGLE_MAPS_PACKAGE);
        try {
            startActivity(mapsIntent);
            return;
        } catch (ActivityNotFoundException | SecurityException ignored) {
            // Google Maps ist nicht verfuegbar: sicheren HTTPS-Fallback extern oeffnen.
        }

        try {
            startActivity(new Intent(Intent.ACTION_VIEW, routeUri));
        } catch (ActivityNotFoundException | SecurityException ignored) {
            // Kein externer Handler vorhanden. Die Navigation bleibt bewusst aus der WebView heraus.
        }
    }

    private boolean hasLocationPermission() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED
                || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)
                        == PackageManager.PERMISSION_GRANTED;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_EXPORT_REQUEST_CODE) {
            handleNativeFileExportResult(resultCode, data);
            return;
        }
        if (requestCode != FILE_CHOOSER_REQUEST_CODE || pendingFileChooser == null) {
            return;
        }

        Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
        pendingFileChooser.onReceiveValue(result);
        pendingFileChooser = null;
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != LOCATION_PERMISSION_REQUEST_CODE) {
            return;
        }

        boolean granted = hasLocationPermission();
        if (pendingGeolocationCallback != null) {
            pendingGeolocationCallback.invoke(
                    pendingGeolocationOrigin,
                    granted,
                    false);
            pendingGeolocationCallback = null;
            pendingGeolocationOrigin = null;
        }
    }

    private final class AtmsNativeFileExportBridge {
        @JavascriptInterface
        public void saveBase64File(
                String base64Data,
                String fileName,
                String mimeType,
                String requestId) {
            beginBase64FileExport(base64Data, fileName, mimeType, requestId, false);
        }

        @JavascriptInterface
        public void saveBase64FileVerified(
                String base64Data,
                String fileName,
                String mimeType,
                String requestId) {
            beginBase64FileExport(base64Data, fileName, mimeType, requestId, true);
        }

        private void beginBase64FileExport(
                String base64Data,
                String fileName,
                String mimeType,
                String requestId,
                boolean verifyReadBack) {
            final byte[] bytes;
            try {
                bytes = Base64.decode(base64Data == null ? "" : base64Data, Base64.DEFAULT);
            } catch (IllegalArgumentException error) {
                notifyNativeFileExportResult(
                        requestId,
                        false,
                        "Exportdaten konnten nicht verarbeitet werden.");
                return;
            }
            runOnUiThread(() -> beginNativeFileExport(bytes, fileName, mimeType, requestId, verifyReadBack));
        }
    }

    private void beginNativeFileExport(
            byte[] bytes,
            String fileName,
            String mimeType,
            String requestId,
            boolean verifyReadBack) {
        String currentUrl = webView == null ? null : webView.getUrl();
        if (currentUrl == null
                || !currentUrl.startsWith("https://appassets.androidplatform.net/assets/")) {
            notifyNativeFileExportResult(
                    requestId,
                    false,
                    "Dateiexport ist nur innerhalb der lokalen ATMS-App erlaubt.");
            return;
        }
        if (pendingExportRequestId != null) {
            notifyNativeFileExportResult(
                    requestId,
                    false,
                    "Ein Speicherdialog ist bereits geöffnet.");
            return;
        }

        pendingExportBytes = bytes == null ? new byte[0] : bytes;
        pendingExportRequestId = requestId;
        pendingExportVerifyReadBack = verifyReadBack;

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(normalizeExportMimeType(mimeType));
        intent.putExtra(Intent.EXTRA_TITLE, sanitizeExportFileName(fileName));
        try {
            startActivityForResult(intent, FILE_EXPORT_REQUEST_CODE);
        } catch (ActivityNotFoundException | SecurityException error) {
            finishNativeFileExport(false, "Android-Speicherdialog konnte nicht geöffnet werden.");
        }
    }

    private void handleNativeFileExportResult(int resultCode, Intent data) {
        if (pendingExportRequestId == null) {
            return;
        }
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            finishNativeFileExport(false, "Speichern abgebrochen.");
            return;
        }

        Uri target = data.getData();
        final byte[] expectedBytes = pendingExportBytes == null ? new byte[0] : pendingExportBytes;
        try (OutputStream output = getContentResolver().openOutputStream(target)) {
            if (output == null) {
                throw new IllegalStateException("Kein Schreibzugriff auf die gewählte Datei.");
            }
            output.write(expectedBytes);
            output.flush();
        } catch (Exception error) {
            String detail = error.getMessage();
            finishNativeFileExport(
                    false,
                    detail == null || detail.trim().isEmpty()
                            ? "Datei konnte nicht gespeichert werden."
                            : "Datei konnte nicht gespeichert werden: " + detail);
            return;
        }

        if (!pendingExportVerifyReadBack) {
            finishNativeFileExport(true, "");
            return;
        }

        try (InputStream input = getContentResolver().openInputStream(target)) {
            if (input == null) {
                throw new IllegalStateException("Gespeicherte Datei konnte nicht zur Prüfung geöffnet werden.");
            }
            byte[] readBackBytes = readAllBytes(input);
            if (!Arrays.equals(expectedBytes, readBackBytes)) {
                throw new IllegalStateException("Write-Read-Prüfung fehlgeschlagen: Dateiinhalte weichen ab.");
            }
            finishNativeFileExport(true, "", true, readBackBytes.length, sha256Hex(readBackBytes));
        } catch (Exception error) {
            String detail = error.getMessage();
            finishNativeFileExport(
                    false,
                    detail == null || detail.trim().isEmpty()
                            ? "Datei wurde geschrieben, konnte aber nicht verifiziert werden."
                            : "Datei wurde geschrieben, konnte aber nicht verifiziert werden: " + detail);
        }
    }

    private void finishNativeFileExport(boolean success, String errorMessage) {
        finishNativeFileExport(success, errorMessage, false, 0, "");
    }

    private void finishNativeFileExport(
            boolean success,
            String errorMessage,
            boolean verifiedReadBack,
            int byteLength,
            String sha256) {
        String requestId = pendingExportRequestId;
        pendingExportRequestId = null;
        pendingExportBytes = null;
        pendingExportVerifyReadBack = false;
        notifyNativeFileExportResult(requestId, success, errorMessage, verifiedReadBack, byteLength, sha256);
    }

    private void notifyNativeFileExportResult(
            String requestId,
            boolean success,
            String errorMessage) {
        notifyNativeFileExportResult(requestId, success, errorMessage, false, 0, "");
    }

    private void notifyNativeFileExportResult(
            String requestId,
            boolean success,
            String errorMessage,
            boolean verifiedReadBack,
            int byteLength,
            String sha256) {
        if (requestId == null || requestId.trim().isEmpty() || webView == null) {
            return;
        }
        String safeId = JSONObject.quote(requestId);
        String safeError = JSONObject.quote(errorMessage == null ? "" : errorMessage);
        JSONObject result = new JSONObject();
        try {
            result.put("verifiedReadBack", success && verifiedReadBack);
            result.put("byteLength", success && verifiedReadBack ? Math.max(0, byteLength) : 0);
            result.put("sha256", success && verifiedReadBack && sha256 != null ? sha256 : "");
        } catch (Exception ignored) {
        }
        String safeResult = JSONObject.quote(result.toString());
        String script = "try{if(typeof window.__ATMSNativeFileExportResolve==='function'){"
                + "window.__ATMSNativeFileExportResolve("
                + safeId
                + ","
                + (success ? "true" : "false")
                + ","
                + safeError
                + ","
                + safeResult
                + ");}}catch(e){}";
        webView.post(() -> webView.evaluateJavascript(script, null));
    }

    private static byte[] readAllBytes(InputStream input) throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int read;
        while ((read = input.read(buffer)) != -1) {
            output.write(buffer, 0, read);
        }
        return output.toByteArray();
    }

    private static String sha256Hex(byte[] bytes) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(bytes == null ? new byte[0] : bytes);
        StringBuilder out = new StringBuilder(hash.length * 2);
        for (byte value : hash) {
            out.append(String.format(java.util.Locale.ROOT, "%02x", value & 0xff));
        }
        return out.toString();
    }

    private static String normalizeExportMimeType(String mimeType) {
        String value = mimeType == null ? "" : mimeType.trim();
        int separator = value.indexOf(';');
        if (separator >= 0) {
            value = value.substring(0, separator).trim();
        }
        return value.contains("/") ? value : "application/octet-stream";
    }

    private static String sanitizeExportFileName(String fileName) {
        String value = fileName == null ? "" : fileName.trim();
        value = value.replace('/', '_').replace('\\', '_');
        return value.isEmpty() ? "ATMS_Export" : value;
    }

    private static void installAtmsBridge(WebView view) {
        String script = "(function(){"
                + "if(!window.ATMSNativeFlightBridgeHost)return;"
                + "var seq=0;"
                + "window.__ATMSNativeFlightBridgePending=window.__ATMSNativeFlightBridgePending||{};"
                + "window.__ATMSNativeFlightBridgeResolve=function(id,body,error){"
                + "var p=window.__ATMSNativeFlightBridgePending[id];if(!p)return;delete window.__ATMSNativeFlightBridgePending[id];"
                + "if(error){p.reject(new Error(String(error)));}else{p.resolve(String(body||''));}};"
                + "window.ATMSNativeFlightBridge={"
                + "contractVersion:'ATMS-FLIGHT-NATIVE-1',"
                + "requestJsonString:function(s){return window.ATMSNativeFlightBridgeHost.requestJsonString(String(s));},"
                + "requestJsonStringAsync:function(s){return new Promise(function(resolve,reject){"
                + "seq+=1;var id='atms-native-'+Date.now().toString(36)+'-'+seq.toString(36);"
                + "window.__ATMSNativeFlightBridgePending[id]={resolve:resolve,reject:reject};"
                + "try{window.ATMSNativeFlightBridgeHost.requestJsonStringAsync(String(s),id);}"
                + "catch(e){delete window.__ATMSNativeFlightBridgePending[id];reject(e);}});},"
                + "lastError:function(){return window.ATMSNativeFlightBridgeHost.lastError();}"
                + "};"
                + "try{if(typeof window.ATMSNotifyNativeFlightBridgeReady==='function'){window.ATMSNotifyNativeFlightBridgeReady();}}catch(e){}"
                + "try{window.dispatchEvent(new CustomEvent('atms-native-flight-bridge-ready'));}catch(e){}"
                + "})();";
        view.evaluateJavascript(script, null);
    }

    private static void installAtmsFileExportBridge(WebView view) {
        String script = "(function(){"
                + "if(!window.ATMSNativeFileExportHost)return;"
                + "var seq=0;"
                + "window.__ATMSNativeFileExportPending=window.__ATMSNativeFileExportPending||{};"
                + "window.__ATMSNativeFileExportResolve=function(id,success,error,resultJson){"
                + "var p=window.__ATMSNativeFileExportPending[id];if(!p)return;delete window.__ATMSNativeFileExportPending[id];"
                + "if(success){var result={verifiedReadBack:false,byteLength:0,sha256:''};try{if(resultJson)result=JSON.parse(String(resultJson));}catch(e){}p.resolve(result);}else{p.reject(new Error(String(error||'Speichern fehlgeschlagen.')));}};"
                + "window.ATMSNativeFileExport={"
                + "contractVersion:'ATMS-FILE-EXPORT-NATIVE-2',"
                + "saveBase64File:function(base64Data,fileName,mimeType){return new Promise(function(resolve,reject){"
                + "seq+=1;var id='atms-file-'+Date.now().toString(36)+'-'+seq.toString(36);"
                + "window.__ATMSNativeFileExportPending[id]={resolve:resolve,reject:reject};"
                + "try{window.ATMSNativeFileExportHost.saveBase64File(String(base64Data||''),String(fileName||''),String(mimeType||''),id);}"
                + "catch(e){delete window.__ATMSNativeFileExportPending[id];reject(e);}});},"
                + "saveBase64FileVerified:function(base64Data,fileName,mimeType){return new Promise(function(resolve,reject){"
                + "seq+=1;var id='atms-file-verified-'+Date.now().toString(36)+'-'+seq.toString(36);"
                + "window.__ATMSNativeFileExportPending[id]={resolve:resolve,reject:reject};"
                + "try{window.ATMSNativeFileExportHost.saveBase64FileVerified(String(base64Data||''),String(fileName||''),String(mimeType||''),id);}"
                + "catch(e){delete window.__ATMSNativeFileExportPending[id];reject(e);}});}"
                + "};"
                + "try{window.dispatchEvent(new CustomEvent('atms-native-file-export-ready'));}catch(e){}"
                + "})();";
        view.evaluateJavascript(script, null);
    }

    private void dispatchAtmsNativeBack() {
        if (webView == null) {
            return;
        }
        webView.evaluateJavascript(
                "(function(){try{window.dispatchEvent(new CustomEvent('atms-native-back'));}catch(e){}})();",
                null
        );
    }

    @Override
    public void onBackPressed() {
        // P97-2B: Fallback fuer Android 12 und aelter sowie Hardware-Zuruecktasten.
        // Android 13+ wird ueber OnBackInvokedDispatcher abgefangen.
        if (webView != null) {
            dispatchAtmsNativeBack();
            return;
        }
        super.onBackPressed();
    }
}
