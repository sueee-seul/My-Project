import javax.swing.*;               // For Swing UI components like JLabel and JPanel
import java.awt.*;                  // For layout and image sizing
import java.net.URL;                // For loading image from a URL
import javax.imageio.ImageIO;       // For reading image files
import java.awt.image.BufferedImage; // For storing image data

public class AvatarPanel extends JPanel {
    // Label to display the avatar image or message
    private JLabel imageLabel;

    // Constructor to set up the avatar panel UI
    public AvatarPanel() {
        // Set a fixed width (200px), height adjusts automatically
        setPreferredSize(new Dimension(200, 0));

        // Use BorderLayout to center the label
        setLayout(new BorderLayout());

        // Create label with default text, centered horizontally
        imageLabel = new JLabel("Avatar will appear here", SwingConstants.CENTER);

        // Add the label to the center of the panel
        add(imageLabel, BorderLayout.CENTER);
    }

    // Load and display the avatar image from the backend using avatar ID
    public void loadAvatarAsync(int avatarId) {
        // Show loading text while fetching image
        imageLabel.setText("Loading...");
        imageLabel.setIcon(null);  // Remove any existing image

        // Start a background thread to load the image (non-blocking)
        new Thread(() -> {
            try {
                // Build the image URL based on the avatar ID
                URL url = new URL("http://localhost:3000/images/" + avatarId + ".jpg");

                // Load the image from the URL
                BufferedImage image = ImageIO.read(url);

                // Resize the image to 100x100 with smooth scaling
                ImageIcon icon = new ImageIcon(image.getScaledInstance(100, 100, Image.SCALE_SMOOTH));

                // Update UI on the Swing event thread
                SwingUtilities.invokeLater(() -> {
                    imageLabel.setIcon(icon);   // Show the avatar image
                    imageLabel.setText("");     // Clear the text
                });
            } catch (Exception e) {
                // If loading fails, show error message
                SwingUtilities.invokeLater(() -> {
                    imageLabel.setText("Failed to load avatar.");
                    imageLabel.setIcon(null);
                });
            }
        }).start(); // Start the image loading thread
    }

    public void clearAvatar() {
        imageLabel.setIcon(null);
        imageLabel.setText("No avatar selected");
    }

}
