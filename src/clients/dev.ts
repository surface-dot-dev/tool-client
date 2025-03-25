import { ev, undelimit, formatError, safeJsonStringify as stringify } from '@surface.dev/utils';
import {
  CallToolParams,
  StdioServerParams,
  ToolCallResult,
  ToolCallResultContentType,
} from '../types';
import * as errors from '../errors';
import * as env from '../utils/env';

class DevClient {
  private client: any = null;
  private isInitialized: boolean = false;
  private serverParams: StdioServerParams;

  get serverConfigured(): boolean {
    const { command, args } = this.serverParams;
    return !!command && !!args.length;
  }

  constructor() {
    // Populate map of env vars to give to the server process.
    const envsMap: Record<string, string> = {};
    const envNames = undelimit(ev(env.STDIO_SERVER_ENV_VARS, '')).filter((v) => !!v);
    envNames.forEach((name) => {
      envsMap[name] = ev(name, '');
    });

    this.serverParams = {
      command: 'node',
      args: undelimit(ev(env.STDIO_SERVER_ARGS, '')).filter((v) => !!v),
      envs: envsMap,
    };
  }

  async init() {
    if (!this.serverConfigured) {
      console.warn(errors.MCP_SERVER_NOT_CONFIGURED);
      return;
    }

    try {
      // Instantiate MCP client.
      const { Client } = await import('@modelcontextprotocol/sdk/client/index');
      this.client = new Client({ name: 'dev-client', version: '1.0.0' });

      // Define MCP server process (via stdio transport).
      const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio');
      const transport = new StdioClientTransport(this.serverParams);

      await this.client.connect(transport);
      this.isInitialized = true;
    } catch (e: unknown) {
      throw formatError(errors.MCP_CONNECTION_ERROR, e, {
        serverParams: stringify(this.serverParams),
      });
    }
  }

  async callTool<I, O>({ name, input, outputSchema }: CallToolParams<I>): Promise<O> {
    if (!this.isInitialized) {
      throw errors.MCP_CLIENT_NOT_INITIALIZED;
    }

    // Call tool and handle *MCP-level* errors.
    const errorParams = { name, input: stringify(input || {}) };
    let result: ToolCallResult;
    try {
      result = await this.client.callTool({ name, arguments: input || {} });
    } catch (e: unknown) {
      throw formatError(errors.PERFORMING_TOOL_CALL_FAILED, e, errorParams);
    }

    // Ensure response is of type "text".
    const content = result.content || [];
    const { type, text } = content[0] || {};
    if (type !== ToolCallResultContentType.Text) {
      throw formatError(errors.UNSUPPORTED_TOOL_CALL_RESULT_CONTENT_TYPE, type, errorParams);
    }

    // Handle *tool-level* errors (i.e. "failed successfully").
    if (result.isError) {
      throw formatError(errors.TOOL_CALL_RETURNED_ERROR, text || errors.UNKNOWN_ERROR, errorParams);
    }

    // Parse according to given output schema.
    const parsed = outputSchema.safeParse(text);
    if (!parsed.success) {
      throw formatError(errors.ERROR_PARSING_TOOL_RESPONSE, parsed.error, {
        ...errorParams,
        content,
      });
    }

    return parsed.data as O;
  }
}

export default DevClient;
