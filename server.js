import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import router from './routes.js';
import { createAgroAlliedRegistry, } from './controller/allied.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "Test endpoint is working!" });
})
app.use("/api", router);
app.post("/api/agroallied/create", createAgroAlliedRegistry);
// app.put("/api/agroallied/edit/:id", updateAgroAlliedRegistry);
app.post("/api/post", (req, res) => {
  res.json({ message: req.body });
})
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// export default app