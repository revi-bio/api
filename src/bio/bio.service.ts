import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { Bio, BioDocument } from 'src/types/schema/Bio';
import { User } from 'src/types/schema/User';

@Injectable()
export class BioService {
  constructor(
    @InjectModel(Collections.Bio) private readonly bioModel: Model<Bio>,
  ) { }

  async createBio(data: {
    handle: string,
    name: string,
    user: User,
  }): Promise<BioDocument> {
    const { handle, name, user } = data;

    if (await this.bioModel.findOne({ handle }))
      throw new ConflictException({ message: 'There is already a bio site with this handle' })

    if (await this.bioModel.countDocuments({ user }))
      throw new BadRequestException({ message: 'Maximum count of bio pages exceeded' })

    const dbBio = new this.bioModel({
      handle,
      name,
      user,
      widgets: [],
    });

    await dbBio.save();

    return dbBio;
  }
}
