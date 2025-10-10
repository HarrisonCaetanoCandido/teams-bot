export type StepsDefinition = {
  name: string;
  action: string;
  endpoint?: string;
  mapping?: Map<string, string>;
  rules?: string[];
  data?: string;
};

export interface FlowDefinition {
  name: string;
  description: string;
  steps: StepsDefinition[];
  requiredPermissions: string[];
  timeout: number;
}
