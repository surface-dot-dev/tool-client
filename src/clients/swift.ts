import { CallToolParams } from '../types';

class SwiftClient {

  async init() {}

  async callTool<I, O>({ name, input, outputSchema, dataSource }: CallToolParams<I>): Promise<O> {
    return {} as O;
  }
}

export default SwiftClient;