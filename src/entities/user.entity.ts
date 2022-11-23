interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

interface User extends Timestamps {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nextOfKin: string;
    otherNames?: string;
}
