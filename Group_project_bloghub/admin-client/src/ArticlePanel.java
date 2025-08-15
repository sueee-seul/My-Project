import javax.swing.*;           // Import Swing components
import java.awt.*;              // Import layout managers like BorderLayout
import java.util.List;          // Import List for holding articles

public class ArticlePanel extends JPanel {

    // Text area to display articles
    private JTextArea articleText;

    // Constructor to set up the article display panel
    public ArticlePanel() {
        // Use BorderLayout to organize components
        setLayout(new BorderLayout());

        // Create a non-editable text area for displaying article content
        articleText = new JTextArea();
        articleText.setEditable(false);          // User cannot change the text
        articleText.setLineWrap(true);           // Wrap text to next line
        articleText.setWrapStyleWord(true);      // Wrap by whole words only

        // Add the text area to a scroll pane for vertical scrolling
        JScrollPane scrollPane = new JScrollPane(articleText);
        scrollPane.setPreferredSize(new Dimension(400, 300));  // Set scroll area size

        // Add label at the top and the scroll pane in the center
        add(new JLabel("Articles for selected user:"), BorderLayout.NORTH);
        add(scrollPane, BorderLayout.CENTER);
    }

    // Load and display articles for a specific user
    public void loadArticlesForUser(int userId) {
        // Show loading message while fetching data
        articleText.setText("Loading...");

        // Use SwingUtilities to safely update UI on the main thread
        SwingUtilities.invokeLater(() -> {
            List<String> articles = HttpClient.getArticlesForUser(userId);

            // Show a message if no articles found
            if (articles.isEmpty()) {
                articleText.setText("No articles found.");
            } else {
                // Join articles with double newlines for readability
                articleText.setText(String.join("\n\n", articles));
            }
        });
    }

    public void clearArticles() {
        articleText.setText("");
    }

}
