import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { Bio } from 'src/types/schema/Bio';

@Injectable()
export class BioService {
  constructor(
    @InjectModel(Collections.Bio) private readonly bioModel: Model<Bio>,
  ) { }

  async createBio() { }
}
