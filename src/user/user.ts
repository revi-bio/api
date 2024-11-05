import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class User {
    constructor(
        private readonly userModel: Model<User>,
    ) {}

    async createUser(data: {
        displayName: string;
        email: string;
        password: string;
    }) {
        const dbUser = new this.userModel({});
    }
}
