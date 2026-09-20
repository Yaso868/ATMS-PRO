# P31F12: keine Minifizierung im ersten Native-Rahmen.
# Die JavascriptInterface-Methoden sind zusätzlich explizit geschützt.
-keepclassmembers class de.atmspro.app.AtmsNativeFlightBridge {
    @android.webkit.JavascriptInterface <methods>;
}
