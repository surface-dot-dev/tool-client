import { z } from 'zod';

export type Tool<I, O> = (input: I, dataSource: DataSourceParams) => Promise<O>;

export type DataSourceParams = {
  source: string;
};

export type NewToolParams = {
  name: string;
  outputSchema: z.ZodType;
};

export type CallToolParams<I> = {
  name: string;
  input: I;
  outputSchema: z.ZodType;
  dataSource: DataSourceParams;
};

export type ServerParams = {
  command: string;
  args: string[];
  envs: Record<string, string>;
};

export enum ToolCallResultContentType {
  Text = 'text',
}

export type ToolCallResultContent = {
  type: ToolCallResultContentType;
  text: string;
};

export type ToolCallResult = {
  isError: boolean;
  content: ToolCallResultContent[];
};
