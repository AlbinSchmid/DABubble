import { FirestoreService } from "../shared/services/firebase-services/firestore.service";

export class UserInChannel {
    // firestoreService: FirestoreService = injec(FirestoreService);

    userID: string;
    password: string;
    email: string;
    username: string;
    avatar: string;
    userStatus: string;
    isFocus: boolean;

    userListSubscription: any;

    constructor(obj?: any) {
        this.userID = obj ? obj.content : '';
        this.password = obj ? obj.senderID : '';
        this.email = obj ? obj.senderName : '';
        this.username = obj ? obj.senderAvatar : '';
        this.avatar = obj ? obj.isRead : '';
        this.userStatus = obj ? obj.date : '';
        this.isFocus = obj ? obj.messageID : false;
    }

    // getTheUsersOfChannel() {
    //     this.userListSubscription = this.firestoreService.userList$.subscribe(users => {
    //         this.usersListAll = users;
    //         this.unsubChannelList = this.firebaseMessenger.subChannelUserList((list: any) => {
    //             this.usersInChannel = [];
    //             const usersIDs = list.data()['userIDs'];
    //             for (let i = 0; i < usersIDs.length; i++) {
    //                 const userID = usersIDs[i];
    //                 const user = this.usersListAll.filter(user => user.userID === userID);
    //                 this.usersInChannel.push(this.firebaseMessenger.getCleanJson(user));
    //             }
    //         });
    //     });
    // }
}