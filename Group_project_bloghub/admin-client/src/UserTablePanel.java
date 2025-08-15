import javax.swing.*;                     // For UI components like JPanel, JTable, JButton
import javax.swing.table.DefaultTableModel; // For table data model
import java.util.List;                    // For handling user data as list of rows

public class UserTablePanel extends JPanel {
    public JTable userTable;              // Table to display user info
    public JButton deleteButton;          // Button to delete selected user
    private DefaultTableModel model;      // Table model for dynamic data

    // Constructor: initialize UI components
    public UserTablePanel() {
        // Define table columns: ID, Username, Role, Article Count, Avatar ID
        String[] columns = {"ID", "Username", "Role", "Articles", "AvatarID"};
        model = new DefaultTableModel(columns, 0);   // Start with empty table
        userTable = new JTable(model);               // Create table using the model
        deleteButton = new JButton("Delete Selected"); // Button for deleting selected user

        // Arrange components vertically
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        add(new JScrollPane(userTable));  // Add table inside scroll pane
        add(deleteButton);                // Add delete button below the table

        // Set up delete button behavior
        deleteButton.addActionListener(e -> {
            int row = userTable.getSelectedRow(); // Get selected row index
            if (row >= 0) {
                int userId = (int) model.getValueAt(row, 0); // Get user ID from first column
                if (HttpClient.deleteUser(userId)) {
                    model.removeRow(row);  // Remove user from table if deletion successful
                } else {
                    JOptionPane.showMessageDialog(this, "Failed to delete user");
                }
            }
        });
    }

    // Reload user data from backend and populate the table
    public void refreshUsers() {
        model.setRowCount(0); // Clear current table content
        List<Object[]> users = HttpClient.fetchUsers(); // Fetch from server
        for (Object[] row : users) {
            model.addRow(row); // Add each user row (ID, Username, Role, Articles, AvatarID)
        }
    }

    // Get the avatar ID of the currently selected user
    public int getSelectedAvatarId() {
        int row = userTable.getSelectedRow();
        if (row >= 0) {
            Object val = model.getValueAt(row, 4); // AvatarID is in column 5 (index 4)
            if (val instanceof Integer) {
                return (Integer) val;
            }
            try {
                return Integer.parseInt(val.toString()); // Try parsing if not integer
            } catch (Exception ignored) { }
        }
        return -1; // Return -1 if nothing is selected or parsing fails
    }

    // Get the user ID of the currently selected user
    public int getSelectedUserId() {
        int row = userTable.getSelectedRow();
        if (row >= 0) {
            Object val = model.getValueAt(row, 0); // User ID is in column 1 (index 0)
            if (val instanceof Integer) {
                return (Integer) val;
            }
            try {
                return Integer.parseInt(val.toString());
            } catch (Exception ignored) { }
        }
        return -1; // Return -1 if nothing is selected or parsing fails
    }

    public void clearTable() {
        model.setRowCount(0);
    }

}
