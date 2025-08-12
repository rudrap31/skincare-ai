import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateProductRoute from "./routes/rateProduct.js";
import analyzeFaceRoute from "./routes/analyzeFace.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/product', rateProductRoute);

app.use('/api/face', analyzeFaceRoute);

const PORT = process.env.PORT || 5111;
app.listen(PORT, '0.0.0.0',  () => console.log(`Server running on port ${PORT}`));