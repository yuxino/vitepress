/// <reference types="node" />
import { ServerConfig } from 'vite'
export declare function createServer(
  options?: ServerConfig
): Promise<import('http').Server>
