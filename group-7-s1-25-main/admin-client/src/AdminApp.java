import javax.swing.*;          // Import Swing components for GUI
import java.awt.*;             // Import AWT classes like CardLayout and JPanel
import java.util.Locale;       // Import Locale for setting language and region

public class AdminApp {
    public static void main(String[] args) {

        // Set default language to English for things like dates and formatting
        Locale.setDefault(Locale.ENGLISH);

        // Start the GUI on the Event Dispatch Thread (recommended for Swing)
        SwingUtilities.invokeLater(() -> {
            // Create the main window with title "Admin Panel"
            JFrame frame = new JFrame("Admin Panel");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);  // Close app when window is closed
            frame.setSize(900, 600);  // Set window size to 900x600 pixels

            // Use CardLayout to switch between login screen and main panel
            CardLayout layout = new CardLayout();
            JPanel cards = new JPanel(layout);  // Container that holds both login and main panels

            // Create the main panel (after login) and the login panel
            MainPanel mainPanel = new MainPanel(layout, cards);  // Shows user data and controls
            LoginPanel loginPanel = new LoginPanel(layout, cards, mainPanel);  // Handles login UI

            // Add both panels to the card layout with unique names
            cards.add(loginPanel, "login");  // Login screen
            cards.add(mainPanel, "main");    // Admin main screen

            // Add the card layout container to the window
            frame.add(cards);

            // Show the window
            frame.setVisible(true);
        });
    }
}
