import { flowQueue } from "../queues/flow.queue.js";
import { FlowRegistry } from "./flowRegistry.service.js";
import { FlowExecuteMetadata } from "../types/flowExecuteMetadata.types.js";
import axios from "axios";
import { axiosGetWithRetry, axiosTeamsPostWithRetry } from "../utils/retry.js";

export default class FlowExecutor {
    private static registry = new FlowRegistry();

    public static execute(
        flowName: string,
        parameters: string,
        metadata: FlowExecuteMetadata
    ) {
        const jobId = this.generateExecId();

        flowQueue.add(
            "flow-jobs",
            {
                jobId,
                flowName,
                parameters,
                status: "pending",
                createdAt: new Date(),
                metadata,
            },
            {
                jobId,
                attempts: 3,
                backoff: 5000,
                removeOnComplete: true,
            }
        );

        console.log(`Job ${jobId} for flow ${flowName} added to the queue`);

        return jobId;
    }

    private static generateExecId() {
        return `execute-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
    }

    static async processJob(job: any) {
        try {
            const flowContext: Record<string, any> = {};

            console.log(`Processing job ${job.jobId} for flow ${job.flowName}`);

            const flow = this.registry.getFlow(job.flowName);

            for (const step of flow.steps) {
                console.log(`Running step ${step.name} with action ${step.action}`);

                switch (step.action) {
                    case "HTTP_GET":
                        console.log(`Stringify: ${JSON.stringify(step)}`);
                        if (!step.endpoint)
                            throw new Error(
                                `Step ${step.name} does not contain an endpoint ${step.endpoint}!`
                            );

                        flowContext[step.name] = await this.executeHttpGet(
                            step.endpoint,
                            job.parameters
                        );
                        break;

                    case "HTTP_POST":
                        if (!step.endpoint)
                            throw new Error(
                                `Step ${step.name} does not contain an endpoint!`
                            );

                        if (!step.data)
                            throw new Error(
                                `Step ${step.name} does not contain data!`
                            );

                        flowContext[step.name] = await this.executeHttpPost(
                            step.endpoint,
                            step.data,
                            job.parameters
                        );
                        break;

                    case "DATA_TRANSFORM":
                        if (!step.rules || step.rules.length == 0)
                            throw new Error(
                                `Step ${step.name} does not contain a rules field!`
                            );

                        flowContext[step.name] = await this.executeDataTransform(
                            step.rules,
                            job.parameters
                        );
                        break;

                    default:
                        throw new Error(`Unknown action type: ${step.action}`);
                }
            }

            const data = {
                type: "message",
                from: { id: "bot" },
                text: `Flow ${job.flowName} executed successfully!`,
            };

            const header = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const backToTeamsBaseUrl = job.metadata.serviceUrl.replace(/\/$/, "");
            const backToTeamsConversationId = encodeURIComponent(
                job.metadata.conversationId
            );
            const backToTeamsUrl = `${backToTeamsBaseUrl}/v3/conversations/${backToTeamsConversationId}/activities`;

            await axiosTeamsPostWithRetry(
                backToTeamsUrl,
                backToTeamsConversationId,
                data,
                header
            );
        } catch (err: any) {
            console.error(`Error processing job ${job.jobId}: ${err.message}`);
        }
    }

    private static async executeHttpGet(
        endpoint: string,
        parameters: string
    ): Promise<any> {
        console.log(`GET ${endpoint} with params ${JSON.stringify(parameters)}`);

        const config = {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: 15000,
        };

        return await axiosGetWithRetry(endpoint, config);
    }

    private static async executeHttpPost(
        endpoint: string,
        data: string,
        parameters: string
    ): Promise<any> {
        console.log(`POST ${endpoint} with params ${parameters}`);

        const config = {
            headers: {
                "Content-Type": "application/json",
            },
            params: JSON.parse(parameters),
        };

        axios
            .post(endpoint, config)
            .then((res) => {
                console.log(`Response status: ${res.status}`);
                if (res.data) console.log(`Data: ${res.data}`);
            })
            .catch((err) => {
                throw new Error(`Could not post data to ${endpoint}: ${err}`);
            });
    }

    private static async executeDataTransform(
        rules: string[],
        parameters: string
    ): Promise<void> {
        console.log(
            `Execute Data Transform with rules ${rules} and params ${parameters}`
        );
    }
}
