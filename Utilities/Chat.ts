import {type IdType} from './Types';
import {fetchPostFormData} from './General';


export function sendChatMessage(roomId: IdType, messageText: string, fkey: string) {
    return fetchPostFormData(`/chats/${roomId}/messages/new`, {
        'text': messageText,
        'fkey': fkey
    });
}