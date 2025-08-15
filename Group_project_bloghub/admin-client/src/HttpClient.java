import java.io.*;
import java.net.*;
import java.util.*;
import org.json.*;

public class HttpClient {

    private static String cookieHeader = null;

    static {
        CookieHandler.setDefault(new CookieManager());
    }

    public static boolean login(String username, String password) {
        try {
            URL url = new URL("http://localhost:3000/api/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String jsonInput = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonInput.getBytes("utf-8"));
            }

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) return false;

            List<String> cookiesHeader = conn.getHeaderFields().get("Set-Cookie");
            if (cookiesHeader != null) {
                for (String cookie : cookiesHeader) {
                    if (cookie.startsWith("authToken=")) {
                        cookieHeader = cookie.split(";", 2)[0];
                        break;
                    }
                }
            }

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static List<Object[]> fetchUsers() {
        List<Object[]> users = new ArrayList<>();
        try {
            URL url = new URL("http://localhost:3000/api/admin/users");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            if (cookieHeader != null) {
                conn.setRequestProperty("Cookie", cookieHeader);
            }

            if (conn.getResponseCode() != 200) return users;

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            JSONObject jsonObj = new JSONObject(response.toString());
            JSONArray jsonArray = jsonObj.getJSONArray("users");

            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject user = jsonArray.getJSONObject(i);
                int id = user.getInt("id");
                String username = user.getString("username");
                int isAdmin = user.optInt("is_admin", 0);
                int articleCount = user.optInt("article_count", 0);
                int avatarId = user.optInt("avatar_id", 1);
                String role = isAdmin == 1 ? "ADMIN" : "USER";

                users.add(new Object[]{id, username, role, articleCount, avatarId});
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return users;
    }

    public static boolean deleteUser(int userId) {
        try {
            URL url = new URL("http://localhost:3000/api/admin/users/" + userId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");

            if (cookieHeader != null) {
                conn.setRequestProperty("Cookie", cookieHeader);
            }

            int code = conn.getResponseCode();
            return code == 200 || code == 204;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public static List<String> getArticlesForUser(int userId) {
        List<String> articles = new ArrayList<>();
        try {
            URL url = new URL("http://localhost:3000/api/articles");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            if (cookieHeader != null) {
                conn.setRequestProperty("Cookie", cookieHeader);
            }

            if (conn.getResponseCode() != 200) return articles;

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            JSONArray jsonArray = new JSONArray(response.toString());
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject article = jsonArray.getJSONObject(i);
                int authorId = article.getInt("author_id");

                if (authorId == userId) {
                    String title = article.getString("title");
                    String content = article.getString("content");
                    articles.add("📝 " + title + "\n    " + content + "\n");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return articles;
    }

    public static JSONObject getCurrentUser() {
        try {
            URL url = new URL("http://localhost:3000/api/users/me");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            if (cookieHeader != null) {
                conn.setRequestProperty("Cookie", cookieHeader);
            }

            if (conn.getResponseCode() != 200) return null;

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            JSONObject root = new JSONObject(response.toString());
            return root.getJSONObject("user");

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static boolean isCurrentUserAdmin() {
        JSONObject user = getCurrentUser();
        if (user == null) return false;

        int adminFlag = user.optInt("is_admin", 0);
        return adminFlag == 1;
    }

    public static void clearSession() {
        cookieHeader = null;
    }

}
