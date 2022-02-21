import type { TunComposable, TunContext } from 'tun';
declare module 'tun' {
    interface TunRequest {
        body: Record<string, any>;
    }
}
export default function bodyparser(): TunComposable<TunContext>;
