import { Request, Response } from 'express'
import FlowExecutor from '../services/flowExecutor.service'
import {FlowExecuteMetadata} from '../types/flowExecuteMetadata.types'

export default async function executeFlow(req: Request, res: Response) {
    try {
        const { flowName, parameters, initiatedBy, correlationId } = req.body;

        console.log(`Executando o fluxo ${flowName} ${parameters}`);

        const isValid = await validateFlowAndPermissions(flowName, initiatedBy);

        if (!isValid)
            res.status(403).json({
                success: false,
                error: "Flow not found or permission denied"
            });


        const flowExecuteMetadata: FlowExecuteMetadata = {
            initiatedBy: initiatedBy,
            correlationId: correlationId
        }

        // executa o flow assincronamente sem bloquear a request
        const executionId = FlowExecutor.execute(flowName, parameters, flowExecuteMetadata);

    } catch (err: any) {
        console.error(`Could not run executeFlow ${err}`)
    }
}

async function validateFlowAndPermissions(flowName: string, initiatedBy: string): Promise<Boolean> {
    return true;
}