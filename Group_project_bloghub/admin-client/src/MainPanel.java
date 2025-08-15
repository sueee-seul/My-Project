import javax.swing.*;       // For Swing components
import java.awt.*;          // For layout management like BorderLayout

public class MainPanel extends JPanel {
    // Sub-panels for users, avatar, and articles
    public UserTablePanel userTablePanel;
    private AvatarPanel avatarPanel;
    private ArticlePanel articlePanel;

    // Constructor to set up the admin main panel, with layout and parent for switching
    public MainPanel(CardLayout layout, JPanel parent) {
        // Use BorderLayout to arrange panels
        setLayout(new BorderLayout());

        // Logout button at the top
        JButton logoutButton = new JButton("Logout");
        logoutButton.addActionListener(e -> {

            // clear cookie
            HttpClient.clearSession();

            // clear JTable
            userTablePanel.clearTable();

            // clear avatar
            avatarPanel.clearAvatar();

            // clear article list
            articlePanel.clearArticles();

            // jump back to the login page
            layout.show(parent, "login");
        });

        add(logoutButton, BorderLayout.NORTH); // Add button to top

        // Initialize sub-panels
        userTablePanel = new UserTablePanel();   // Shows user list and delete button
        avatarPanel = new AvatarPanel();         // Shows selected user's avatar
        articlePanel = new ArticlePanel();       // Shows selected user's articles

        // Add panels to the layout
        add(userTablePanel, BorderLayout.CENTER);  // Center: user table
        add(avatarPanel, BorderLayout.EAST);       // Right: avatar
        add(articlePanel, BorderLayout.SOUTH);     // Bottom: article list

        // Load users when panel is initialized
        userTablePanel.refreshUsers();

        // Set up listener: update avatar and articles when user selection changes
        userTablePanel.userTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) { // Only respond when selection is finished
                int userId = userTablePanel.getSelectedUserId();
                int avatarId = userTablePanel.getSelectedAvatarId();
                if (userId != -1) {
                    avatarPanel.loadAvatarAsync(avatarId);     // Load avatar image
                    articlePanel.loadArticlesForUser(userId);  // Load user articles
                }
            }
        });
    }
}
