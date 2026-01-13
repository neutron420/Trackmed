import { UserRole } from '@prisma/client';
export interface ChatMessage {
    type: 'CHAT';
    payload: {
        message: string;
        recipientId?: string;
        timestamp?: string;
    };
}
export declare function handleChatMessage(message: ChatMessage, senderUserId: string, senderRole: UserRole): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function validateChatMessage(message: any): message is ChatMessage;
//# sourceMappingURL=chat-handler.d.ts.map