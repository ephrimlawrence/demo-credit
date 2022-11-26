interface Transfer extends Timestamps {
    id: number;
    amount: number;
    from_account_id: number;
    to_account_id: number;
}
