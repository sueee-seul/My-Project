import { getDatabase } from "./database.js";         // Import the function to connect to the database
import { getSubscribers } from "./subs-dao.js";       // Import the function to retrieve subscribers
import dayjs from "dayjs";                            // Import dayjs for formatting timestamps

// Get all notifications for a specific user
export async function getNotifications(userId) {
    const db = await getDatabase();                   // Connect to the database
    const dbResult = await db.all(
        "SELECT * FROM Notifications WHERE user_id = ?",
        userId
    );                                                // Query all notifications for the user
    return dbResult;                                  // Return the result
}

// Get a single notification by its ID
export async function getNotificationById(id) {
    const db = await getDatabase();                   // Connect to the database
    const dbResult = await db.get(
        "SELECT * FROM Notifications WHERE id = ?",
        id
    );                                                // Query the notification by ID
    return dbResult;                                  // Return the result
}

// Create a new notification related to a comment
export async function createCommentNotification(userId, commentId) {
    const db = await getDatabase();                   // Connect to the database
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss"); // Get current time
    const dbResult = await db.run(
        "INSERT INTO Notifications (time, user_id, comment_id) VALUES (?, ?, ?)",
        timestamp, userId, commentId
    );                                                // Insert new comment notification
};

// Create notifications for all subscribers when a new article is posted
export async function createArticleNotifications(posterId, articleId) {
    const db = await getDatabase();                   // Connect to the database
    const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss"); // Get current time
    const subscribers = await getSubscribers(posterId);       // Get all subscribers of the poster
    for (const subscriber of subscribers) {
        const id = subscriber.subscriber_id;
        await db.run(
            "INSERT INTO Notifications (time, user_id, article_id) VALUES (?, ?, ?)",
            timestamp, id, articleId
        );                                            // Insert notification for each subscriber
    }
};

// Mark a notification as seen (not new anymore)
export async function seenNotification(notificationId) {
    const db = await getDatabase();                   // Connect to the database
    await db.run(
        "UPDATE Notifications SET is_new = 0 WHERE id = ?",
        notificationId
    );                                                // Update the notification's status
};
