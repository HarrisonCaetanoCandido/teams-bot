import { Queue } from 'bullmq';
import { connection } from '../config/bullmq.config'

export const flowQueue = new Queue('flow-queue', { connection });

(async () => {
    await flowQueue.add('normal', { foo: 'bar' }, {
        attempts: 3,
        backoff: 10000,
        removeOnComplete: true,
        removeOnFail: false
    });
})();