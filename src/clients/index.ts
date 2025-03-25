import { CallToolParams } from '../types';
import { isSwiftRuntime } from '../utils/runtime';
import SwiftClient from './swift';
import DevClient from './dev';

export interface Client {
  init(): Promise<void>;
  callTool<I, O>(params: CallToolParams<I>): Promise<O>;
}

export const getClient = (): Client => {
  return isSwiftRuntime() ? new SwiftClient() : new DevClient();
};
