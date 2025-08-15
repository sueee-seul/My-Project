/**
 * This file contains a dummy DAO for the "Messages" database. You should
 * create your own DAOs for your project, and get rid of this one.
 */

import { getDatabase } from "./database.js";  // Import the function to get a database connection

// Retrieve all messages from the Messages table
export async function getMessages() {
  const db = await getDatabase();                       // Connect to the database
  const messages = await db.all("SELECT * FROM Messages"); // Query all messages
  return messages;                                      // Return the result list
}

// Add a new message to the Messages table
export async function addMessage(messageText) {
  const db = await getDatabase();                       // Connect to the database
  const response = await db.run(
    "INSERT INTO Messages (message) VALUES(?)",
    messageText
  );                                                    // Insert a new message
  return {
    id: response.lastID,                                // Return the ID of the new message
    message: messageText                                // Return the message content
  }
}
