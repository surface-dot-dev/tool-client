declare global {
  interface Window {
    webkit?: {
      messageHandlers?: Record<string, unknown>;
    };
  }
}

export const isSwiftRuntime = (): boolean =>
  !!(window?.webkit?.messageHandlers && typeof window.webkit.messageHandlers === 'object');
