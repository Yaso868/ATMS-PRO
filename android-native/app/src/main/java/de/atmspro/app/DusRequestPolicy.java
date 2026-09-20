package de.atmspro.app;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * P31F12: Pure-Java Allowlist für den einzigen nativen DUS-Endpunkt.
 * Bewusst ohne Android-Abhängigkeiten, damit die Regel separat testbar bleibt.
 */
public final class DusRequestPolicy {
    public static final String CONTRACT_VERSION = "ATMS-FLIGHT-NATIVE-1";
    public static final String HOST = "www.dus.com";
    public static final String PATH = "/api/sitecore/flightapi/SearchFlightsWithOutParams";

    private static final Set<String> ALLOWED_QUERY_KEYS = new HashSet<>(Arrays.asList(
            "lang", "arrival", "offset", "codeshare", "count",
            "flightStartTime", "flightEndTime", "showDetails"
    ));

    private DusRequestPolicy() {}

    public static URI validate(String method, String url) throws Exception {
        if (!"GET".equalsIgnoreCase(method == null ? "" : method.trim())) {
            throw new SecurityException("DUS native method not allowed");
        }

        URI uri = new URI(url == null ? "" : url.trim());
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new SecurityException("DUS native protocol not allowed");
        }
        if (!HOST.equalsIgnoreCase(uri.getHost())) {
            throw new SecurityException("DUS native host not allowed");
        }
        if (!PATH.equals(uri.getPath())) {
            throw new SecurityException("DUS native path not allowed");
        }
        if (uri.getUserInfo() != null || uri.getFragment() != null) {
            throw new SecurityException("DUS native URL extras not allowed");
        }
        int port = uri.getPort();
        if (port != -1 && port != 443) {
            throw new SecurityException("DUS native port not allowed");
        }

        String query = uri.getRawQuery();
        if (query == null || query.isEmpty()) {
            throw new SecurityException("DUS native query missing");
        }

        Set<String> seen = new HashSet<>();
        for (String part : query.split("&")) {
            String key = part;
            int eq = part.indexOf('=');
            if (eq >= 0) key = part.substring(0, eq);
            if (!ALLOWED_QUERY_KEYS.contains(key)) {
                throw new SecurityException("DUS native query key not allowed: " + key);
            }
            if (!seen.add(key)) {
                throw new SecurityException("DUS native duplicate query key: " + key);
            }
        }

        for (String required : ALLOWED_QUERY_KEYS) {
            if (!seen.contains(required)) {
                throw new SecurityException("DUS native required query key missing: " + required);
            }
        }

        return uri;
    }
}
