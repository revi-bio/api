import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { Bio, BioDocument } from 'src/types/schema/Bio';
import { BioVisitContainer, BioVisitContainerDocument } from 'src/types/schema/BioView';
import { User } from 'src/types/schema/User';

@Injectable()
export class BioService {
  constructor(
    @InjectModel(Collections.Bio) private readonly bioModel: Model<Bio>,
    @InjectModel(Collections.BioVisitContainer) private readonly bioVisitContainerModel: Model<BioVisitContainer>,
  ) { }

  async findById(id: Types.ObjectId) {
    return await this.bioModel.findById(id);
  }

  async findByHandle(handle: string) {
    return await this.bioModel.findOne({ handle });
  }

  async findByUser(user: User, projection: any = ''): Promise<BioDocument[]> {
    return await this.bioModel.find({ user: user._id }, projection);
  }

  async createBio(data: { handle: string; name: string; user: User }): Promise<BioDocument> {
    const { handle, name, user } = data;

    if (await this.bioModel.findOne({ handle }))
      throw new ConflictException({
        message: 'There is already a bio site with this handle',
      });

    if (await this.bioModel.countDocuments({ user }))
      throw new BadRequestException({
        message: 'Maximum count of bio pages exceeded',
      });

    const dbBio = new this.bioModel({
      handle,
      name,
      user,
      pages: [],
    });

    await dbBio.save();

    return dbBio;
  }

  async addPages(bio: BioDocument, pages: object[]): Promise<BioDocument> {
    bio.pages = pages;
    await bio.save();

    return bio;
  }

  async getPages(bio: BioDocument): Promise<object[]> {
    return bio.pages;
  }

  async getAllVisitContainers(bio: BioDocument): Promise<BioVisitContainerDocument[]> {
    return await this.bioVisitContainerModel.find({ bio });
  }

  async getTodaysVisitContainer(bio: BioDocument): Promise<BioVisitContainerDocument> {
    let container = await this.bioVisitContainerModel.findOne({ bio, createdAt: new Date() });
    if (!container) container = new this.bioVisitContainerModel({ bio });

    return container;
  }
}
