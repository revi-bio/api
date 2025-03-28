import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { SettingContainer, Settings } from 'src/types/schema/SettingContainer';
import { User } from 'src/types/schema/User';

@Injectable()
export class SettingService {
    constructor(
        @InjectModel(Collections.Setting) private readonly settingContainerModel: Model<SettingContainer>,
    ) { }

    async initSettings(user: User) {
        const dbSettingContainer = new this.settingContainerModel({
            user,
        });

        await dbSettingContainer.save();
    }

    async getSettings(user: User): Promise<Settings> {
        const dbSettingContainer = await this.settingContainerModel.findOne({ user: user._id })
        return dbSettingContainer.settings;
    }

    async setSettings(user: User, settings: Settings) {
        const dbSettingContainer = await this.settingContainerModel.findOne({ user: user._id })

        for (let key in settings) {
            dbSettingContainer.settings[key] = settings[key];
        }

        dbSettingContainer.markModified('settings');
        await dbSettingContainer.save();
    }
}
