import de.atmspro.app.DusRequestPolicy;

public final class DusRequestPolicySelfTest {
    public static void main(String[] args) throws Exception {
        String ok = "https://www.dus.com/api/sitecore/flightapi/SearchFlightsWithOutParams?lang=de&arrival=false&offset=0&codeshare=true&count=20&flightStartTime=2026-09-20T00:00:00%2B02:00&flightEndTime=2026-09-21T05:59:59%2B02:00&showDetails=false";
        DusRequestPolicy.validate("GET", ok);
        boolean blocked = false;
        try {
            DusRequestPolicy.validate("GET", "https://evil.example/api/sitecore/flightapi/SearchFlightsWithOutParams?lang=de&arrival=false&offset=0&codeshare=true&count=20&flightStartTime=x&flightEndTime=y&showDetails=false");
        } catch (SecurityException expected) {
            blocked = true;
        }
        if (!blocked) throw new IllegalStateException("evil host was not blocked");
        System.out.println("P31F12 policy self-test OK");
    }
}
