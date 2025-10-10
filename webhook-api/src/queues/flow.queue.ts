import { Queue } from "bullmq";
import { redisConnection } from "../config/bullmq.config.js";

export const flowQueue = new Queue("flow-jobs", {
  connection: redisConnection,
});
