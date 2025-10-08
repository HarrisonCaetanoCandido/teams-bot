import { Queue } from 'bullmq';
import { redisConnection } from '../config/bullmq.config'

export const flowQueue = new Queue('flow-jobs', { connection: redisConnection });