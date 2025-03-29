// Global type declarations for Deno Edge Functions

// Deno namespace
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  }
  
  export const env: Env;
  export const args: string[];
  
  export interface ConnInfo {
    readonly localAddr: Deno.Addr;
    readonly remoteAddr: Deno.Addr;
  }
  
  export interface Addr {
    transport: 'tcp' | 'udp';
    hostname: string;
    port: number;
  }
}

// Module declarations
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export type ConnInfo = any;
  export type Handler = (request: Request, connInfo: ConnInfo) => Response | Promise<Response>;
  export function serve(handler: Handler, options?: { port?: number; hostname?: string }): Promise<void>;
}

declare module 'npm:@supabase/supabase-js' {
  export * from '@supabase/supabase-js';
}

declare module '../_shared/cors.ts' {
  export const corsHeaders: Record<string, string>;
} 