// Configure environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import routes from "./routes/routes.js";
import connectDB from "./config/db.js";

// Set the backend port separately from the frontend dev server to avoid conflicts.
const PORT = process.env.PORT ?? 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

export function createApp({ logger = process.env.NODE_ENV !== "test" } = {}) {
    //Creates the express server
    const app = express();

    /**
     * Configure middleware(logging, CORS getSourceMapsSupport, JSON parsing getSourceMapsSupport,
        static files support, cookie parser)

        CORS is configured to allow cookies and these two origins from fetch() requests.
     */

    if (logger) {
        app.use(morgan("dev"));
    }

    app.use(cookieParser());
    app.use(
        cors({
            origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'],
            credentials: true
        })
    );

    app.use(express.json());
    app.use(express.static("public"));

    //Import and use our application routes.
    app.use("/", routes);

    return app;
}

export async function startServer() {
    //Make sure our database is up and running
    await connectDB();

    const app = createApp();

    //Start the server running
    return app.listen(PORT, ()=>{
        console.log(`404 NOT FOUND Project server listening on port ${PORT}`);
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await startServer();
}
