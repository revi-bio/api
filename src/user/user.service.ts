import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
    constructor(
        private readonly userModel: Model<UserService>,
    ) {}

    async createUser(data: {
        displayName: string;
        email: string;
        password: string;
    }) {
        const dbUser = new this.userModel({});
    }
}
