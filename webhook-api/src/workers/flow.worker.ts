import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/bullmq.config.js";
import FlowExecutor from "../services/flowExecutor.service.js";
import { jobDefinition } from "../types/jobDefinition.types.js";

const worker = new Worker(
  "flow-jobs",
  async (job: Job<jobDefinition>) => {
    const jobData = job.data;
    console.log(`[Worker]: Processing ${jobData.jobId} - ${jobData.flowName}`);
    await FlowExecutor.processJob(job.data);
  },
  { connection: redisConnection }
);

worker.on("completed", (job: Job<jobDefinition>) => {
  console.log(`[Worker]: Job ${job.id} has completed!`);
});

worker.on(
  "failed",
  (job: Job<jobDefinition> | undefined, err: Error, prev: string) => {
    if (job) {
      console.error(
        `[Worker]: Job ${job.id} has failed with error ${err.message}`
      );
    } else {
      console.error(`[Worker]: A job has failed with error ${err.message}`);
    }
  }
);

worker.on("error", (err) => {
  console.error(`[Worker]: Worker encountered an error: ${err.message}`);
});

worker.on("active", (job: Job<jobDefinition>) => {
  console.log(`[Worker]: Job ${job.data.jobId} is now active`);
});

worker.on("stalled", (jobId: string, prev: string) => {
  console.warn(`[Worker]: Job ${jobId} has stalled and will be reprocessed`);
});

worker.on("ready", () => {
  console.log("[Worker]: Worker is ready and waiting for jobs");
});

export default worker;
