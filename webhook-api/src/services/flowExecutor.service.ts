import { flowQueue } from '../queues/flow.queue';
import { FlowRegistry } from "./flowRegistry.service";
import { StepsDefinition } from "../types/flowDefinition.types";
import { FlowExecuteMetadata } from "../types/flowExecuteMetadata.types";
import axios from "axios";

export default class FlowExecutor {
    private static registry = new FlowRegistry();

    // a intencao eh que esse metodo receba comandos do chat para executar um fluxo
    public static execute(flowName: string, parameters: string, metadata: FlowExecuteMetadata) {
        const jobId = this.generateExecId();

        // desa forma nao travamos o chat enquanto o flow eh executado
        flowQueue.add('flow-job', {
            jobId,
            flowName,
            parameters,
            status: 'pending',
            createdAt: new Date()
        }, {
            jobId,
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });

        return jobId;
    }

    private static generateExecId() {
        return `execute-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    }

    static async processJob(job: any) {
        try {
            console.log(`Processing job ${job.jobId} for flow ${job.flowName}`);

            const flow = this.registry.getFlow(job.flowName);

            for (const step of flow.steps) {
                console.log(`Running step ${step.name} with action ${step.action}`);
                await this.executeStep(step, job.parameters);
            }

            await this.updateExecStatus(job.jobId, 'completed', 'Flow executed successfully');
            console.log(`Job ${job.jobId} completed successfully`);
        } catch (err: any) {
            console.error(`Error processing job ${job.jobId}: ${err.message}`);
            await this.updateExecStatus(job.jobId, 'failed', err.message);
        }
    }

    private static async executeStep(step: StepsDefinition, parameters: string) {
        switch (step.action) {
            case 'HTTP_GET':
                if (step.endpoint)
                    return await this.executeHttpGet(step.endpoint, parameters);
                throw new Error(`Step ${step.name} does not contain an endpoint!`);
            case 'HTTP_POST':
                if (!step.endpoint)
                    throw new Error(`Step ${step.name} does not contain an endpoint!`);

                if (!step.data)
                    throw new Error(`Step ${step.name} does not contain a data field`);

                return await this.executeHttpPost(step.endpoint, step.data, parameters);
            case 'DATA_TRANSFORM':
                if (!step.rules)
                    throw new Error(`Step ${step.name} does not contain a rules field!`);

                return await this.executeDataTransform(step.rules, parameters);
            default:
                throw new Error(`Unknown action type: ${step.action}`);
        }
    }

    private static async executeHttpGet(endpoint: string, parameters: string) {
        console.log(`GET ${endpoint} with params ${parameters}`);

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            params: JSON.parse(parameters)
        };

        axios.get(endpoint, config).then((res => {
            console.log(`Response status: ${res.status}`);

            console.log(`Data: ${res.data}`);

            // armazenar no banco ou algo assim

        })).catch(err => {
            throw new Error(`Could not get data from ${endpoint}: ${err}`);
        });
    }

    private static async executeHttpPost(endpoint: string, data: string, parameters: string) {
        console.log(`POST ${endpoint} with params ${parameters}`);

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            params: JSON.parse(parameters)
        }

        axios.post(endpoint, config).then(res => {
            console.log(`Response status: ${res.status}`);
            if (res.data)
                console.log(`Data: ${res.data}`);
        }).catch(err => {
            throw new Error(`Could not post data to ${endpoint}: ${err}`);
        });
    }

    private static async executeDataTransform(rules: string[], parameters: string) {
        console.log(`Execute Data Transform with rules ${rules} and params ${parameters}`);
    }

    private static async updateExecStatus(jobId: string, status: 'pending' | 'in_progress' | 'completed' | 'failed', message?: string) {
        // const job = await this.queue.getJob(jobId);
    }
}