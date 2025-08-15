// A mock version of the API client used for testing or offline development
public class MockApiClient {

    // Simulate a login check without making a real HTTP request
    public static boolean login(String username, String password) {
        // Only accept "admin" as both username and password
        return "admin".equals(username) && "admin".equals(password);
    }
}
