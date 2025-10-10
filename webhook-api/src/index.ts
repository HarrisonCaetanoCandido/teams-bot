import express from "express";
import { router } from "./routes/router.routes.js";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { apiRateLimit } from "./middlewares/apiRateLimit.middleware.js";
import "../src/workers/flow.worker.js";

dotenv.config();

const app = express();

const PORT = process.env.WEBHOOK_API || 3000;

app.use(express.json());

app.use("/api/", apiRateLimit, router);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`API running on ${PORT}`);
});
