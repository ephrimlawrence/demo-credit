interface User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nextOfKin: string;
    otherNames?: string;
    createdAt: Date;
    updatedAt: Date;
}
