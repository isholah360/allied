import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("MongoDB URL:", process.env.MONGODB_URL); // debug

    const mongoURL = process.env.MONGODB_URL; // FIXED

    if (!mongoURL) {
      throw new Error("MONGODB_URL is not defined in .env file");
    }

    const conn = await mongoose.connect(mongoURL);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

