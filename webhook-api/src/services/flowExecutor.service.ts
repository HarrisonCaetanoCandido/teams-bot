import { flowQueue } from '../queues/flow.queue';
import { FlowRegistry } from "./flowRegistry.service";
import { StepsDefinition } from "../types/flowDefinition.types";
import { FlowExecuteMetadata } from "../types/flowExecuteMetadata.types";
import axios from "axios";

export default class FlowExecutor {
    private static registry = new FlowRegistry();

    public static execute(flowName: string, parameters: string, metadata: FlowExecuteMetadata) {
        const jobId = this.generateExecId();

        flowQueue.add('flow-jobs', {
            jobId,
            flowName,
            parameters,
            status: 'pending',
            createdAt: new Date(),
            metadata
        }, {
            jobId,
            attempts: 3,
            backoff: 5000,
            removeOnComplete: true,
        });

        console.log(`Job ${jobId} for flow ${flowName} added to the queue`);

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

            const data = {
                type: "message",
                from: { id: "bot" },
                text: `Flow ${job.flowName} executed successfully!`,
            }

            const header = {
                headers: {
                    'Content-Type': 'application/json'
                }
            }

            const backToTeamsBaseUrl = job.metadata.serviceUrl.replace(/\/$/, '');
            const backToTeamsConversationId = encodeURIComponent(job.metadata.conversationId);
            const backToTeamsUrl = `${backToTeamsBaseUrl}/v3/conversations/${backToTeamsConversationId}/activities`;

            await axios.post(backToTeamsUrl, data, header).then((res) => {
                console.log(`Notified conversation ${backToTeamsConversationId} of completion. Status: ${res.status}`);
            }).catch((err) => {
                console.error(`Could not notify domain ${backToTeamsBaseUrl} with conversation ${backToTeamsConversationId}: ${err}`);
            });
        } catch (err: any) {
            console.error(`Error processing job ${job.jobId}: ${err.message}`);
        }
    }

    private static async executeStep(step: StepsDefinition, parameters: string) {
        try {
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
                    if (!step.rules || step.rules.length == 0)
                        throw new Error(`Step ${step.name} does not contain a rules field!`);

                    return await this.executeDataTransform(step.rules, parameters);
                default:
                    throw new Error(`Unknown action type: ${step.action}`);
            }
        } catch (err: any) {
            console.error(`Could not process a step ${err}`);
        }
    }

    private static async executeHttpGet(endpoint: string, parameters: string) {
        console.log(`GET ${endpoint} with params ${JSON.stringify(parameters)}`);

        const config = {
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 70000,
        };

        const sys_response = await axios.get(endpoint, config);

        if (sys_response.status == 200) {
            console.log(`Response status: ${sys_response.status}`);
            console.log(`Data: ${JSON.stringify(sys_response.data)}`);
        } else
            console.error("Sys_response status code: ", sys_response.status);
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

    private static async executeDataTransform(rules: string[], parameters: string): Promise<void> {
        console.log(`Execute Data Transform with rules ${rules} and params ${parameters}`);
    }
}