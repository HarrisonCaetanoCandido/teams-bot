import { FlowDefinition } from "../types/flowDefinition.types.js";

export class FlowRegistry {
    private flows = new Map<string, FlowDefinition>();

    constructor() {
        this.initializeFlows();
    }

    private initializeFlows() {
        this.flows.set("import-users", {
            name: "import-users",
            description: "Importa usuários do sistema externo",
            steps: [
                {
                    name: "fetch-external-users",
                    action: "HTTP_GET",
                    endpoint: "https://jsonplaceholder.typicode.com/users",
                    mapping: new Map<string, string>([
                        ["title", "reportName"],
                        ["body", "content"],
                    ]),
                },
                // {
                //   name: "transform-data",
                //   action: "DATA_TRANSFORM",
                //   rules: [],
                // },
                // {
                //     name: 'update-crm',
                //     action: 'HTTP_POST',
                //     endpoint: '/api/internal/users',
                //     data: 'transformedData'
                // }
            ],
            requiredPermissions: ["user:write"],
            timeout: 300000,
        });

        this.flows.set("generate-report", {
            name: "generate-report",
            description: "Gera relatório consolidado",
            steps: [],
            requiredPermissions: ["report:generate"],
            timeout: 300000,
        });
    }

    getFlow(flowName: string): FlowDefinition {
        const flow = this.flows.get(flowName);
        if (!flow) throw new Error("Flow not found $");
        return flow;
    }
}
