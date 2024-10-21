import { UserInterface } from "../../landing-page/interfaces/userinterface";
import { MessageInterface } from "./message-interface";


export interface Channel {
    channelID?: string,
    title: string,
    description: string,
    createdBy: string,
    isFocus: boolean,
    user: UserInterface[],
    messages: MessageInterface[],
}
