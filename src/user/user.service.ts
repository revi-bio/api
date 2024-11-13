import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/types/schema/User';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
    constructor(
        private readonly userModel: Model<User>,
    ) {}

    async findById(id: Types.ObjectId): Promise<UserDocument | undefined> {
        return await this.userModel.findById(id);
    }

    async findByEmail(email: string): Promise<UserDocument | undefined> {
        return await this.userModel.findOne({ email });
    }

    getFind() { return this.userModel.find };

    getFindOne() { return this.userModel.findOne };

    async createUser(data: {
        displayName: string;
        email: string;
        password: string;
    }): Promise<UserDocument> {
        const { displayName, email, password } = data;

        const dbUser = new this.userModel({
            displayName,
            email,

            // Hashing the password.
            // this is an important step in every backend that should NEVER be skipped.
            // Password hashing is very important because it's private information that's
            // dangerous for us to store in plaintext. Argon2 is one of the best algorithms for
            // this task, so we use that.
            password: argon2.hash(password),
        });

        await dbUser.save();

        return dbUser;
    }
}
