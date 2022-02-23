import { TunRequest, TunContext } from 'tun'

declare module 'tun' {
  interface TunRequest {
    body: Record<string, any>
  }
}
