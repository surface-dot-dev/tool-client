import { getClient } from './clients';
import { Tool, DataSourceParams, NewToolParams } from './types';

const client = getClient();
const initPromise = client.init();

export const newTool = <I, O>({ name, outputSchema }: NewToolParams): Tool<I, O> => {
  return async (input: I, dataSource: DataSourceParams) => {
    await initPromise;
    return client.callTool<I, O>({ name, input, outputSchema, dataSource });
  }
};