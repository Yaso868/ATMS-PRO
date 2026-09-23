// CORE-007D8A1F1D8P36F16 · 23.09.2026: NATIVE UNRESOLVED-FLIGHT ROUTE PROBE – erlaubt ausschließlich FlightStats other-days GET für die diagnostische Prüfung noch offener Flugnummern. Keine Freigabe/Übernahme in Java.
// CORE-007D8A1F1D8P36F13 · 23.09.2026: NATIVE FLIGHTSTATS AIRPORT-BOARD SECOND-SOURCE PROBE – streng allowlistete arr/dep-Airporttafel-Probe, nur Diagnose, keine Verifizierungsfreigabe.
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
 * - DUS-Produktivzugriff bleibt auf den explizit freigegebenen DUS-HTTPS-Endpunkt begrenzt.
 * - P36F12 erlaubt zusätzlich ausschließlich einen streng validierten FlightStats-Web-JSON-Pfad
 *   für eine DIAGNOSE-Probe. Dieser Pfad darf niemals selbst Flugstatus/Verifizierung freigeben.
 * - P36F13 erlaubt zusätzlich ausschließlich datumsspezifische FlightStats-Airport-Board-Pfade
 *   (arr/dep, 6-Stunden-Fenster) für eine DIAGNOSE-Zweitquellenprobe. Keine Verifizierungsfreigabe in Java.
 * - Rückgabe ist unveränderter JSON-Text der jeweils validierten Quelle.
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
            String method = request.optString("method", "GET");
            String urlText = request.optString("url", "");
            String purpose = request.optString("purpose", "");
            boolean flightStatsProbe = "flightstats_probe".equals(purpose);
            boolean flightStatsBoardProbe = "flightstats_board_probe".equals(purpose);
            boolean flightStatsOtherDaysProbe = "flightstats_other_days_probe".equals(purpose);
            URI validated;
            String sourceLabel;
            if (flightStatsOtherDaysProbe) {
                validated = validateFlightStatsOtherDaysProbe(method, urlText);
                sourceLabel = "FlightStats other-days probe";
            } else if (flightStatsBoardProbe) {
                validated = validateFlightStatsBoardProbe(method, urlText);
                sourceLabel = "FlightStats board probe";
            } else if (flightStatsProbe) {
                validated = validateFlightStatsProbe(method, urlText);
                sourceLabel = "FlightStats probe";
            } else {
                if (!"DUS".equalsIgnoreCase(airport)) {
                    throw new SecurityException("Native airport not allowed");
                }
                validated = DusRequestPolicy.validate(method, urlText);
                sourceLabel = "DUS";
            }

            int requestedTimeout = request.optInt("timeoutMs", DEFAULT_TIMEOUT_MS);
            int timeoutMs = Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, requestedTimeout));

            URL url = validated.toURL();
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/json");
            connection.setRequestProperty("X-Requested-With", "XMLHttpRequest");
            if (flightStatsProbe || flightStatsBoardProbe || flightStatsOtherDaysProbe) {
                connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 16; ATMS PRO Native) AppleWebKit/537.36");
                connection.setRequestProperty("Accept-Language", "de-DE,de;q=0.9,en;q=0.8");
            }
            connection.setRequestProperty("Cache-Control", "no-store");
            connection.setUseCaches(false);
            connection.setConnectTimeout(timeoutMs);
            connection.setReadTimeout(timeoutMs);
            connection.setInstanceFollowRedirects(false);

            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                InputStream errorStream = connection.getErrorStream();
                String errorBody = errorStream == null ? "" : readUtf8(errorStream);
                if (errorBody == null) errorBody = "";
                errorBody = errorBody.trim();
                if (errorBody.length() > 1200) errorBody = errorBody.substring(0, 1200) + "…";
                throw new IllegalStateException(sourceLabel + " HTTP " + status
                        + (errorBody.isEmpty() ? "" : " | " + errorBody));
            }

            String body = readUtf8(connection.getInputStream());
            if (body == null || body.trim().isEmpty()) {
                throw new IllegalStateException(sourceLabel + " returned empty body");
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

    private static URI validateFlightStatsOtherDaysProbe(String method, String urlText) throws Exception {
        if (!"GET".equalsIgnoreCase(method == null ? "" : method.trim())) {
            throw new SecurityException("FlightStats other-days probe method not allowed");
        }
        URI uri = new URI(urlText == null ? "" : urlText.trim());
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new SecurityException("FlightStats other-days probe protocol not allowed");
        }
        if (!"www.flightstats.com".equalsIgnoreCase(uri.getHost())) {
            throw new SecurityException("FlightStats other-days probe host not allowed");
        }
        String path = uri.getPath();
        if (path == null || !path.matches("/v2/api-next/flight-tracker/other-days/[A-Z0-9]{2,3}/[0-9]{1,4}[A-Z]?")) {
            throw new SecurityException("FlightStats other-days probe path not allowed");
        }
        if (uri.getRawQuery() != null || uri.getUserInfo() != null || uri.getFragment() != null) {
            throw new SecurityException("FlightStats other-days probe URL extras not allowed");
        }
        int port = uri.getPort();
        if (port != -1 && port != 443) {
            throw new SecurityException("FlightStats other-days probe port not allowed");
        }
        return uri;
    }

    private static URI validateFlightStatsBoardProbe(String method, String urlText) throws Exception {
        if (!"GET".equalsIgnoreCase(method == null ? "" : method.trim())) {
            throw new SecurityException("FlightStats board probe method not allowed");
        }
        URI uri = new URI(urlText == null ? "" : urlText.trim());
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new SecurityException("FlightStats board probe protocol not allowed");
        }
        if (!"www.flightstats.com".equalsIgnoreCase(uri.getHost())) {
            throw new SecurityException("FlightStats board probe host not allowed");
        }
        String path = uri.getPath();
        if (path == null || !path.matches("/v2/api-next/flight-tracker/(arr|dep)/[A-Z]{3}/[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}/(0|6|12|18)")) {
            throw new SecurityException("FlightStats board probe path not allowed");
        }
        String query = uri.getRawQuery();
        if (!"carrierCode=&numHours=6".equals(query)) {
            throw new SecurityException("FlightStats board probe query not allowed");
        }
        if (uri.getUserInfo() != null || uri.getFragment() != null) {
            throw new SecurityException("FlightStats board probe URL extras not allowed");
        }
        int port = uri.getPort();
        if (port != -1 && port != 443) {
            throw new SecurityException("FlightStats board probe port not allowed");
        }
        return uri;
    }

    private static URI validateFlightStatsProbe(String method, String urlText) throws Exception {
        if (!"GET".equalsIgnoreCase(method == null ? "" : method.trim())) {
            throw new SecurityException("FlightStats probe method not allowed");
        }
        URI uri = new URI(urlText == null ? "" : urlText.trim());
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new SecurityException("FlightStats probe protocol not allowed");
        }
        if (!"www.flightstats.com".equalsIgnoreCase(uri.getHost())) {
            throw new SecurityException("FlightStats probe host not allowed");
        }
        String path = uri.getPath();
        if (path == null || !path.matches("/v2/api-next/flight-tracker/[A-Z0-9]{2,3}/[0-9]{1,4}[A-Z]?/[0-9]{4}/[0-9]{1,2}/[0-9]{1,2}")) {
            throw new SecurityException("FlightStats probe path not allowed");
        }
        if (uri.getRawQuery() != null || uri.getUserInfo() != null || uri.getFragment() != null) {
            throw new SecurityException("FlightStats probe URL extras not allowed");
        }
        int port = uri.getPort();
        if (port != -1 && port != 443) {
            throw new SecurityException("FlightStats probe port not allowed");
        }
        return uri;
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
