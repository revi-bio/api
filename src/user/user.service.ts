import { ConflictException, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/types/schema/User';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Collections } from 'src/types/Collections';
import { JwtData } from 'src/types/JwtData';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(Collections.User) private readonly userModel: Model<User>,
    ) {}

    async fromJwtData(jwtData: JwtData) {
        return await this.findById(jwtData.id);
    }

    async findById(id: Types.ObjectId): Promise<UserDocument | undefined> {
        return await this.userModel.findById(id);
    }

    async findByEmail(email: string): Promise<UserDocument | undefined> {
        return await this.userModel.findOne({ email });
    }

    async findByVerification(key: string, value: string): Promise<UserDocument | undefined> {
        const findKey = `validations.${key}`;
        return this.userModel.findOne({ [findKey]: value });
    }

    async createUser(data: {
        displayName: string;
        email: string;
        password: string;
    }): Promise<UserDocument> {
        const { displayName, email, password } = data;

        const userWithSameEmail = await this.userModel.findOne({ email });
        if (userWithSameEmail)
            throw new ConflictException({ message: 'There is already a user with this email' });

        const dbUser = new this.userModel({
            displayName,
            email,

            // Hashing the password.
            // this is an important step in every backend that should NEVER be skipped.
            // Password hashing is very important because it's private information that's
            // dangerous for us to store in plaintext. Argon2 is one of the best algorithms for
            // this task, so we use that.
            password: await argon2.hash(password),
            validations: [
                {emailVerification: uuidv4()},
            ],
        });

        await dbUser.save();

        return dbUser;
    }
}
