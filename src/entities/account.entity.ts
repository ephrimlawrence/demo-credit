import { UserDto } from "./user.entity";

export class Account {
    id: number;
    userId: number;
    accountNo: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;


    user: UserDto;
}
