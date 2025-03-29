declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export type ConnInfo = any;
  export type Handler = (request: Request, connInfo: ConnInfo) => Response | Promise<Response>;
  export function serve(handler: Handler, options?: { port?: number; hostname?: string }): Promise<void>;
}

declare module "npm:@supabase/supabase-js" {
  export * from "@supabase/supabase-js";
}

// Deno namespace
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
  
  export interface ConnInfo {
    localAddr: {
      transport: string;
      hostname: string;
      port: number;
    };
    remoteAddr: {
      transport: string;
      hostname: string;
      port: number;
    };
  }
} 