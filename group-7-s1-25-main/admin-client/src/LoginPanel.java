import javax.swing.*;             // For UI components like JLabel, JButton, etc.
import java.awt.*;                // For layout managers and drawing
import java.io.IOException;       // For handling image loading errors
import javax.imageio.ImageIO;     // For reading image files

public class LoginPanel extends JPanel {
    // Background image shown behind login form
    private Image backgroundImage;

    // Constructor for login screen
    public LoginPanel(CardLayout layout, JPanel cards, MainPanel mainPanel) {
        try {
            // Load background image from classpath (make sure bg.jpg is in resources)
            backgroundImage = ImageIO.read(getClass().getResource("/bg.jpg"));
        } catch (IOException | NullPointerException e) {
            e.printStackTrace();
        }

        // Use GridBagLayout for flexible component positioning
        setLayout(new GridBagLayout());
        setOpaque(false);  // Make panel transparent so background shows

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);  // Padding around components

        // UI components: username + password fields and login button
        JLabel userLabel = new JLabel("Username:");
        JTextField usernameField = new JTextField(15);

        JLabel passLabel = new JLabel("Password:");
        JPasswordField passwordField = new JPasswordField(15);

        JButton loginButton = new JButton("Login");

        // Position components on the grid
        gbc.gridx = 0;
        gbc.gridy = 0;
        add(userLabel, gbc);
        gbc.gridx = 1;
        add(usernameField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 1;
        add(passLabel, gbc);
        gbc.gridx = 1;
        add(passwordField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 2;
        add(loginButton, gbc);

        // Login button click event
        loginButton.addActionListener(e -> {
            String username = usernameField.getText();
            String password = new String(passwordField.getPassword());

            // Send login request using HttpClient
            if (HttpClient.login(username, password)) {
                // Optional pause for smoother transition
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}

                // Refresh user table in the main panel
                mainPanel.userTablePanel.refreshUsers();

                // Switch to the main admin panel
                layout.show(cards, "main");
            } else {
                // Show error popup if login fails
                JOptionPane.showMessageDialog(this, "Login failed.");
            }
        });
    }

    // Custom painting to draw background image
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (backgroundImage != null) {
            // Scale image to fill panel size
            g.drawImage(backgroundImage, 0, 0, getWidth(), getHeight(), this);
        }
    }
}
