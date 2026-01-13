import { LocationMessage } from '../types/websocket';
export declare function handleLocationMessage(message: LocationMessage, senderUserId: string): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function validateLocationMessage(message: any): message is LocationMessage;
//# sourceMappingURL=location-handler.d.ts.map