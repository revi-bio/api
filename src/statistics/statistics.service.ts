import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { Bio, BioDocument } from 'src/types/schema/Bio';
import { BioVisitContainer, BioVisitContainerDocument, Visitor } from 'src/types/schema/BioView';
import { User } from 'src/types/schema/User';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Collections.Bio) private readonly bioModel: Model<Bio>,
    @InjectModel(Collections.BioVisitContainer) private readonly bioVisitContainerModel: Model<BioVisitContainer>,
  ) {}

  async getBioVisits(bioId: string | Types.ObjectId): Promise<BioVisitContainerDocument[]> {
    const bio = await this.bioModel.findById(bioId);
    if (!bio) {
      throw new NotFoundException('Bio not found');
    }
    
    return await this.bioVisitContainerModel.find({ bio: bio._id });
  }

  async getBioVisitsByUser(userId: string | Types.ObjectId): Promise<BioVisitContainerDocument[]> {
    const bios = await this.bioModel.find({ user: userId });
    if (!bios || bios.length === 0) {
      return [];
    }
    
    const bioIds = bios.map(bio => bio._id);
    return await this.bioVisitContainerModel.find({ bio: { $in: bioIds } });
  }

  async getBiosByUser(userId: string | Types.ObjectId): Promise<BioDocument[]> {
    return await this.bioModel.find({ user: userId });
  }

  async getTotalViews(bioId?: string | Types.ObjectId): Promise<number> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    return visitContainers.reduce((total, container) => {
      return total + Object.keys(container.visits).length;
    }, 0);
  }

  async getTotalClicks(bioId?: string | Types.ObjectId): Promise<number> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    return visitContainers.reduce((total, container) => {
      return total + Object.values(container.visits).reduce((clickTotal, visitor: Visitor) => {
        return clickTotal + visitor.clicks.length;
      }, 0);
    }, 0);
  }

  async getCountryDistribution(bioId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const countryDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      Object.values(container.visits).forEach((visitor: Visitor) => {
        const countryCode = visitor.countryCode || 'unknown';
        countryDistribution[countryCode] = (countryDistribution[countryCode] || 0) + 1;
      });
    });
    
    // Sort by count in descending order and limit to top 5
    return Object.fromEntries(
      Object.entries(countryDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    );
  }

  async getSocialDistribution(bioId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const socialDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      Object.values(container.visits).forEach((visitor: Visitor) => {
        visitor.clicks.forEach(click => {
          socialDistribution[click] = (socialDistribution[click] || 0) + 1;
        });
      });
    });
    
    // Sort by count in descending order
    return Object.fromEntries(
      Object.entries(socialDistribution)
        .sort(([, a], [, b]) => b - a)
    );
  }

  async getReferralDistribution(bioId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const referralDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      Object.values(container.visits).forEach((visitor: Visitor) => {
        if (visitor.referrer) {
          const referrer = visitor.referrer;
          referralDistribution[referrer] = (referralDistribution[referrer] || 0) + 1;
        }
      });
    });
    
    // Sort by count in descending order
    return Object.fromEntries(
      Object.entries(referralDistribution)
        .sort(([, a], [, b]) => b - a)
    );
  }

  async getViewsTimeline(bioId?: string | Types.ObjectId, days: number = 30): Promise<number[]> {
    let query = {};
    
    if (bioId) {
      const bio = await this.bioModel.findById(bioId);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    }
    
    // Get date range for the last 'days' days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Add date range to query
    query = {
      ...query,
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    // Initialize array with zeros for each day
    const timeline: number[] = Array(days).fill(0);
    
    visitContainers.forEach(container => {
      const containerDate = new Date(container.createdAt);
      const dayDiff = Math.floor((endDate.getTime() - containerDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff >= 0 && dayDiff < days) {
        timeline[days - 1 - dayDiff] += Object.keys(container.visits).length;
      }
    });
    
    return timeline;
  }
}
