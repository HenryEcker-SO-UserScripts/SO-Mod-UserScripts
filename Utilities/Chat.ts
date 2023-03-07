import {type IdType} from './Types';
import {fetchPostFormData} from './General';


export function sendChatMessage(roomId: IdType, messageText: string, chatFkey: string) {
    // Will respond with a 200 if successful with JSON {id: number; time: number;}
    // Will respond with a 409 if rate limited. The response message is plaintext not JSON
    return fetchPostFormData(`/chats/${roomId}/messages/new`, {
        'text': messageText,
        'fkey': chatFkey
    });
}

export function deleteChatMessage(messageId: IdType, chatFkey: string) {
    // Will respond with a 200 if successful and text "ok"
    return fetchPostFormData(`/messages/${messageId}/delete`, {
        'fkey': chatFkey
    });
}