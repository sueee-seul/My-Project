import { getDatabase } from "./database.js";  // Import database connection function

// Add a new subscription (subscriber follows recipient)
export async function newSubscription(subscriberId, recipientId) {
    const db = await getDatabase();  // Connect to database
    const dbResult = await db.run(
        "INSERT INTO Subscriptions (subscriber_id, recipient_id) VALUES (?, ?)",
        subscriberId,
        recipientId
    );  // Insert new subscription record
    console.log(dbResult);  // Log the database result (for debugging)
    return dbResult.changes > 0;  // Return true if insertion was successful
};

// Remove an existing subscription
export async function removeSubscription(subscriberId, recipientId) {
    const db = await getDatabase();  // Connect to database
    const dbResult = await db.run(
        "DELETE FROM Subscriptions WHERE subscriber_id = ? AND recipient_id = ?",
        subscriberId,
        recipientId
    );  // Delete the subscription record
    console.log(dbResult);  // Log the result (for debugging)
    return dbResult.changes > 0;  // Return true if deletion was successful
};

// Get a list of subscriber IDs who follow a specific user
export async function getSubscribers(recipientId) {
    const db = await getDatabase();  // Connect to database
    let subscribers = await db.all(
        "SELECT subscriber_id FROM Subscriptions WHERE recipient_id = ?",
        recipientId
    );  // Fetch all subscriber IDs
    console.log(subscribers);  // Log the result (for debugging)
    return subscribers;  // Return the list
}

// Check if a user is subscribed to another user
export async function checkSubscribed(id, recipientId) {
    const db = await getDatabase();  // Connect to database
    let subscribed = await db.get(
        "SELECT * FROM Subscriptions WHERE subscriber_id = ? AND recipient_id = ?",
        id,
        recipientId
    );  // Look for a matching subscription
    if (subscribed == undefined) {
        return false;  // Not subscribed
    } else {
        return true;   // Subscribed
    }
}
