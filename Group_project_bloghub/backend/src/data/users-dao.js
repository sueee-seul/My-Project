import bcrypt from 'bcrypt';                         // Library for hashing passwords
import yup from 'yup';                               // Validation library
import { getDatabase } from './database.js';         // Function to get a database connection
import { updateDatabase } from './util.js';          // Custom utility function to update database

// Get public user info (no passwords or sensitive data)
export async function getUsersPublic() {
  const db = await getDatabase();                    // Connect to the database
  const users = await db.all(
    "SELECT id, username, firstname, lastname, avatar_id, is_admin FROM Users"
  );                                                  // Select public fields
  return users;                                       // Return list of users
}

// Get detailed user info by ID (with avatar URL)
export async function getUserById(id) {
  const db = await getDatabase();                    // Connect to the database
  const user = await db.get(
    "SELECT username, firstname, lastname, avatar_id FROM Users WHERE id = ?",
    id
  );                                                 // Query for the user
  if (user) {
    user.avatar = `http://localhost:3000/images/${user.avatar_id}.jpg`; // Add avatar URL
  }
  console.log(user);                                 // Debug log
  return user;                                       // Return user data
}

// Update user profile (optionally with password)
export async function updateUser(id, updateData) {
  const validatedUpdateData = updateUserSchema.validateSync(updateData, {
    abortEarly: true,    // Stop on first validation error
    stripUnknown: true   // Remove unknown fields
  });

  if (validatedUpdateData.password) {
    validatedUpdateData.password = await hashPassword(validatedUpdateData.password); // Hash password if provided
  }

  const db = await getDatabase();                    // Connect to the database
  const dbResult = await updateDatabase(db, "Users", validatedUpdateData, id); // Update using utility function
  return dbResult.changes > 0;                        // Return success status
}

// Get full user record by username
export async function getUserWithUsername(username) {
  const db = await getDatabase();                    // Connect to the database
  const user = await db.get(
    "SELECT * FROM Users WHERE username = ?",
    username
  );                                                 // Query user by username
  return user;
}

// Hash a password using bcrypt
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);             // Generate salt
  const hashedPassword = await bcrypt.hash(password, salt); // Hash password
  return hashedPassword;
}

// Check login credentials and return user if valid
export async function getUserWithCredentials(username, password) {
  let user = await getUserWithUsername(username);    // Get user by username
  console.log(user);
  if (!user) {
    return null;                                     // No such user
  }
  let passwordCheck = await bcrypt.compare(password, user.password); // Compare password
  console.log(passwordCheck);
  if (passwordCheck) {
    user.avatar = `http://localhost:3000/images/${user.avatar_id}.jpg`; // Add avatar URL
    return user;                                     // Valid credentials
  } else {
    return null;                                     // Invalid password
  }
}

// Validation schema for creating a user
const userSchema = yup
  .object({
    username: yup.string().min(1).max(16).required(),
    firstname: yup.string().min(1).required(),
    lastname: yup.string().min(1).required(),
    password: yup.string().min(3).required(),
    description: yup.string().min(1).required(),
    dob: yup.string().datetime().required(),
    avatar_id: yup.number().integer().required()
  })
  .required();

// Validation schema for updating a user (fields optional)
const updateUserSchema = yup
  .object({
    username: yup.string().min(1).max(16).optional(),
    firstname: yup.string().min(1).optional(),
    lastname: yup.string().min(1).optional(),
    password: yup.string().min(3).optional(),
    description: yup.string().min(1).optional(),
    dob: yup.string().datetime().optional(),
    avatar_id: yup.number().integer().optional()
  })
  .required();

// Create a new user (with validation and password hashing)
export async function createUser(data) {
  const parsedData = userSchema.validateSync(data, {
    abortEarly: false,   // Collect all validation errors
    stripUnknown: true   // Remove fields not in schema
  });

  let hashedPassword = await hashPassword(parsedData.password); // Hash the password

  const db = await getDatabase();                // Connect to database
  const dbResult = await db.run(
    "INSERT INTO Users(username, firstname, lastname, password, description, dob, avatar_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, 0)",
    parsedData.username,
    parsedData.firstname,
    parsedData.lastname,
    hashedPassword,
    parsedData.description,
    parsedData.dob,
    parsedData.avatar_id
  );                                             // Insert new user

  console.log(dbResult);                         // Debug log
  return dbResult.changes;                       // Return number of rows affected
}
