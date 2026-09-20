package de.atmspro.app;

import android.webkit.JavascriptInterface;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * P31F12 Native Flight Bridge.
 *
 * Vertrag mit js/flight-data-provider.js:
 * - JavaScript ruft requestJsonString(JSON-string) auf.
 * - Nur ATMS-FLIGHT-NATIVE-1 wird akzeptiert.
 * - Nur der explizit freigegebene DUS-HTTPS-Endpunkt darf angesprochen werden.
 * - Rückgabe ist der unveränderte JSON-Text des Airports.
 */
public final class AtmsNativeFlightBridge {
    private static final int MIN_TIMEOUT_MS = 1_000;
    private static final int MAX_TIMEOUT_MS = 30_000;
    private static final int DEFAULT_TIMEOUT_MS = 15_000;

    private volatile String lastError = "";

    @JavascriptInterface
    public String requestJsonString(String requestJson) {
        HttpURLConnection connection = null;
        try {
            JSONObject request = new JSONObject(requestJson == null ? "{}" : requestJson);
            String contract = request.optString("contractVersion", "");
            if (!DusRequestPolicy.CONTRACT_VERSION.equals(contract)) {
                throw new SecurityException("Native contract version mismatch");
            }
            String airport = request.optString("airportIata", "");
            if (!"DUS".equalsIgnoreCase(airport)) {
                throw new SecurityException("Native airport not allowed");
            }
            String method = request.optString("method", "GET");
            String urlText = request.optString("url", "");
            URI validated = DusRequestPolicy.validate(method, urlText);

            int requestedTimeout = request.optInt("timeoutMs", DEFAULT_TIMEOUT_MS);
            int timeoutMs = Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, requestedTimeout));

            URL url = validated.toURL();
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("Cache-Control", "no-store");
            connection.setUseCaches(false);
            connection.setConnectTimeout(timeoutMs);
            connection.setReadTimeout(timeoutMs);
            connection.setInstanceFollowRedirects(false);

            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IllegalStateException("DUS HTTP " + status);
            }

            String body = readUtf8(connection.getInputStream());
            if (body == null || body.trim().isEmpty()) {
                throw new IllegalStateException("DUS returned empty body");
            }

            // Nur gültiges JSON an ATMS zurückgeben.
            new JSONObject(body);
            lastError = "";
            return body;
        } catch (Exception error) {
            lastError = error.getClass().getSimpleName() + ": " + String.valueOf(error.getMessage());
            return "";
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    @JavascriptInterface
    public String lastError() {
        return lastError;
    }

    private static String readUtf8(InputStream stream) throws Exception {
        StringBuilder out = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) out.append(line);
        }
        return out.toString();
    }
}
