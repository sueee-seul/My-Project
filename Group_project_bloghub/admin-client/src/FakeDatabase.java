import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

public class FakeDatabase {

    // Static list to simulate a database of users
    private static final List<Object[]> users = new ArrayList<>();

    // Initialize fake users: each user is represented by an Object[] {id, username, role}
    static {
        users.add(new Object[]{1, "admin", "ADMIN"});
        users.add(new Object[]{2, "user", "USER"});
        users.add(new Object[]{3, "alice", "USER"});
        users.add(new Object[]{4, "bob", "USER"});
        users.add(new Object[]{5, "charlie", "USER"});
        users.add(new Object[]{6, "david", "USER"});
    }

    // Class to represent a user's article
    public static class Article {
        public final int userId;       // ID of the user who wrote the article
        public final String title;     // Article title
        public final String content;   // Article content

        public Article(int userId, String title, String content) {
            this.userId = userId;
            this.title = title;
            this.content = content;
        }
    }

    // Static list to simulate article storage
    private static final List<Article> articles = new ArrayList<>();

    // Initialize fake articles for test users
    static {
        articles.add(new Article(1, "Welcome to the platform", "Hello everyone!"));
        articles.add(new Article(2, "My first post", "I'm excited to be here."));
        articles.add(new Article(2, "Another one", "Here's another post."));
        articles.add(new Article(3, "Alice's intro", "Hi, I'm Alice."));
    }

    // Return a list of articles written by the given user
    public static List<Article> getArticlesByUser(int userId) {
        return articles.stream()
                .filter(a -> a.userId == userId)
                .collect(Collectors.toList());
    }

    // Return a list of all users (as a copy to prevent outside modification)
    public static List<Object[]> getAllUsers() {
        return new ArrayList<>(users);
    }

    // Remove a user by ID
    public static boolean deleteUser(int userId) {
        Iterator<Object[]> iterator = users.iterator();
        while (iterator.hasNext()) {
            Object[] row = iterator.next();
            if ((int) row[0] == userId) {
                iterator.remove();  // Remove the user from the list
                return true;
            }
        }
        return false;  // No user found with the given ID
    }

    // Check login credentials (only allows "admin" / "admin")
    public static boolean login(String username, String password) {
        return "admin".equals(username) && "admin".equals(password);
        // Optional: replace with actual user lookup in the users list
    }
}
