interface Account {
    id: number;
    userId: number;
    accountNo: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;


    user: User;

}
