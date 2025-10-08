import { Request, Response } from 'express'
import FlowExecutor from '../services/flowExecutor.service'
import { FlowExecuteMetadata } from '../types/flowExecuteMetadata.types'

export default async function executeFlow(req: Request, res: Response) {
    try {
        const { flowName, parameters, initiatedBy, correlationId, conversationId, serviceUrl } = req.body;

        console.log(`Executando o fluxo ${flowName} ${JSON.stringify(parameters)}`);

        const isValid = await validateFlowAndPermissions(flowName, initiatedBy);

        if (!isValid)
            res.status(403).json({
                success: false,
                error: "Flow not found or permission denied"
            });


        const flowExecuteMetadata: FlowExecuteMetadata = {
            initiatedBy: initiatedBy,
            correlationId: correlationId,
            conversationId: conversationId,
            serviceUrl: serviceUrl
        }

        const executionId = FlowExecutor.execute(flowName, parameters, flowExecuteMetadata);

        res.status(200).json({
            success: true,
            message: 'Flow execution started',
            executionId: executionId
        })
    } catch (err: any) {
        throw new Error(`Could not run executeFlow ${err}`);
    }
}

async function validateFlowAndPermissions(flowName: string, initiatedBy: string): Promise<Boolean> {
    return true;
}