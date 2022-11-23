interface Deposit extends Timestamps {
    id: number;
    amount: number;
    accountId: number;
}
