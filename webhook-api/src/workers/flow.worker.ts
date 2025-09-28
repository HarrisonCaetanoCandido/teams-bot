import { Worker } from 'bullmq';
import { connection } from '../config/bullmq.config';
import FlowExecutor from '../services/flowExecutor.service';

new Worker('flow-jobs', async job => {
    await FlowExecutor.processJob(job.data);
}, { connection });
