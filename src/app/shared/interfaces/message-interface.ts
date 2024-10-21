export interface MessageInterface {
    content: string,
    isRead: boolean,
    senderId:string,
    senderName: string, 
    senderAvatar: string,
    date: any,
    type: string,
    id: string,
    reactions: {
      content: string,
      senderIDs: string,
      senderNames: string,
      messageID: string,
    }
}
