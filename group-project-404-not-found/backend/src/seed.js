import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";

// Models
import User from "./models/User.js";
import Course from "./models/Course.js";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3001";

const users = [
    {
        username: "alice",
        upi: "akim123",
        email: "alice@aucklanduni.ac.nz",
        firstname: "Alice",
        lastname: "Kim",
        password: bcrypt.hashSync("alice123", 10),
        bio: "CS student who loves sharing notes!",
        phone: "+64 21 111 1111",
        dob: "2000-01-01",
        avatarUrl: `${BASE_URL}/images/Asset 2.png`,
        notifPrefs: { email: true, push: false, sms: false },
        creditBalance: 1240,
        is_admin: 0,
        createdAt: "2024-01-15T00:00:00Z",
    },
    {
        username: "bob",
        upi: "blee456",
        email: "bob@aucklanduni.ac.nz",
        firstname: "Bob",
        lastname: "Lee",
        password: bcrypt.hashSync("bob123", 10),
        bio: "Hi there!",
        phone: "+64 21 222 2222",
        dob: "1999-05-05",
        avatarUrl: `${BASE_URL}/images/Asset 3.png`,
        notifPrefs: { email: true, push: true, sms: false },
        creditBalance: 800,
        is_admin: 0,
        createdAt: "2024-02-10T00:00:00Z",
    },
    {
        username: "james",
        upi: "jjang789",
        email: "james@aucklanduni.ac.nz",
        firstname: "James",
        lastname: "Jang",
        password: bcrypt.hashSync("james123", 10),
        bio: "Good to see you",
        phone: "+64 21 333 3333",
        dob: "1994-03-16",
        avatarUrl: `${BASE_URL}/images/Asset 4.png`,
        notifPrefs: { email: false, push: false, sms: false },
        creditBalance: 300,
        is_admin: 0,
        createdAt: "2024-03-01T00:00:00Z",
    },
    {
        username: "sky",
        upi: "shong001",
        email: "sky@aucklanduni.ac.nz",
        firstname: "Sky",
        lastname: "Hong",
        password: bcrypt.hashSync("sky123", 10),
        bio: "Platform admin. Have fun!",
        phone: "+64 21 444 4444",
        dob: "1990-02-16",
        avatarUrl: `${BASE_URL}/images/Asset 6.png`,
        notifPrefs: { email: true, push: true, sms: true },
        creditBalance: 5000,
        is_admin: 1,
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        username: "cloudy",
        upi: "chong002",
        email: "cloudy@aucklanduni.ac.nz",
        firstname: "Cloudy",
        lastname: "Hong",
        password: bcrypt.hashSync("cloudy123", 10),
        bio: "Have fun!!!",
        phone: "+64 21 555 5555",
        dob: "1970-02-16",
        avatarUrl: `${BASE_URL}/images/Asset 7.png`,
        notifPrefs: { email: true, push: false, sms: false },
        creditBalance: 420,
        is_admin: 0,
        createdAt: "2024-04-20T00:00:00Z",
    },
];

const courses = [
    {
        courseCode: "COMPSCI732",
        courseName: "Software Tools and Processes",
        description: "An introduction to modern software engineering tools, version control, and development processes.",
        instructorName: "Dr. Andrew Meads",
        instructorAvatar: null,
        level: 700,
        semester: "Sem1",
        department: "Computer Science",
        seatsLeft: 12,
        status: "Available",
        prerequisites: "COMPSCI220",
        schedule: "Mon, Wed 10:00 – 11:30 • Engineering Block",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    },
    {
        courseCode: "COMPSCI220",
        courseName: "Algorithms and Data Structures",
        description: "Core algorithms including sorting, searching, trees, and graphs with analysis of complexity.",
        instructorName: "Dr. Bernhard Pfahringer",
        instructorAvatar: null,
        level: 200,
        semester: "Sem2",
        department: "Computer Science",
        seatsLeft: 5,
        status: "Limited",
        prerequisites: "COMPSCI101",
        schedule: "Tue, Thu 14:00 – 15:30 • Science Building",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    },
    {
        courseCode: "SOFTENG281",
        courseName: "Object-Oriented Programming",
        description: "OOP principles using Java: inheritance, polymorphism, design patterns.",
        instructorName: "Dr. Ewan Tempero",
        instructorAvatar: null,
        level: 200,
        semester: "Sem1",
        department: "Computer Science",
        seatsLeft: 0,
        status: "Closed",
        prerequisites: "COMPSCI101",
        schedule: "Mon, Fri 09:00 – 10:30 • Kate Edger",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    },
    {
        courseCode: "MATHS108",
        courseName: "Mathematics for Business",
        description: "An introduction to applied mathematics for business students covering calculus fundamentals.",
        instructorName: "Dr. Ayesha Patel",
        instructorAvatar: null,
        level: 100,
        semester: "Sem1",
        department: "Mathematics",
        seatsLeft: 30,
        status: "Available",
        prerequisites: "None",
        schedule: "Tue, Thu 10:00 – 11:30 • Owen G Glenn",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    },
];

async function seedData() {
    console.log("Connecting to MongoDB...");
    await connectDB();

    try {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Course.deleteMany({});

        console.log("Inserting courses...");
        await Course.insertMany(courses);

        console.log("Inserting users...");
        await User.insertMany(users);

        console.log("\n✅ Database seeded successfully!");
        console.log("-----------------------------------------");
        console.log("Admin account created:");
        console.log("Email: sky@aucklanduni.ac.nz");
        console.log("Password: sky123");
        console.log("-----------------------------------------");

    } catch (err) {
        console.error("Error seeding data:", err);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

seedData();
