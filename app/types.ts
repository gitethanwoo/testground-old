export type BlockType = "Input" | "Generate";

export interface SchemaProperty {
  name: string;
  type: "string" | "number" | "boolean" | "string[]";
  description?: string;
}

export interface SchemaDefinition {
  outputType: "object" | "array" | "enum";
  properties?: SchemaProperty[];
  enumValues?: string[];
}

export interface Block {
  id: string;
  type: BlockType;
  expanded: boolean;
  name: string;
  settings: {
    prompt?: string;
    input?: string;
    temperature?: number;
    maxTokens?: number;
    generateType: "text" | "object";
    schemaDefinition?: SchemaDefinition;
  };
  result?: string | object;
  isExecuting?: boolean;
}

export interface ResultViewProps {
  result: string | object;
  blockName: string;
}
