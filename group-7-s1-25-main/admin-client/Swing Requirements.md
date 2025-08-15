Required Features for Java Swing Application：

Create a Java Swing application using a single JFrame.

Include two input fields (TextField) for entering the username and password.

Include two buttons: one for Login and one for Logout.

Include a JTable to display all user data.

Include a button to delete the selected user from the JTable.

When the Login button is clicked, send a request to /api/login to authenticate the user.

If the user is authenticated as an administrator, fetch all users from /api/users and display them in the JTable; otherwise, show an error message in a popup and log the user out.

When the Logout button is clicked, clear the JTable and call /api/logout.

When a user is selected in the JTable, a separate JPanel should display the selected user's username and avatar (the avatar should be loaded via HTTP, and the UI thread must not be blocked).

When the Delete button is clicked, send a request to /api/users/:id to delete the selected user, and then update the JTable to reflect the change.

All buttons and components must be enabled or disabled depending on the application state (e.g., the "Delete" button should be disabled when not logged in).

You must use design patterns, such as MVC, Adapter, or Observer, especially for separating the JTable logic and ensuring maintainable code.

Do not use GUI builders or templates (e.g., NetBeans visual designer). The entire UI must be implemented by hand-written code.