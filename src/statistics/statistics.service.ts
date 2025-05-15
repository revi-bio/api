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
    console.log('getBiosByUser userId:', userId);
    console.log('getBiosByUser userId type:', typeof userId);
    
    // Convert string ID to ObjectId if needed
    const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    console.log('getBiosByUser userIdObj:', userIdObj);
    
    const bios = await this.bioModel.find({ user: userIdObj });
    console.log('getBiosByUser bios count:', bios.length);
    console.log('getBiosByUser bios:', bios.map(bio => bio._id));
    return bios;
  }

  async getTotalViews(bioId?: string | Types.ObjectId, userId?: string | Types.ObjectId): Promise<number> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      console.log('getTotalViews userId:', userId);
      console.log('getTotalViews userId type:', typeof userId);
      
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      console.log('getTotalViews userIdObj:', userIdObj);
      
      const userBios = await this.bioModel.find({ user: userIdObj });
      console.log('getTotalViews userBios count:', userBios.length);
      console.log('getTotalViews userBios:', userBios.map(bio => bio._id));
      
      if (!userBios || userBios.length === 0) {
        return 0;
      }
      
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
    }
    
    console.log('getTotalViews query:', JSON.stringify(query));
    
    // First, try to find all visit containers regardless of query to see what's in the database
    const allContainers = await this.bioVisitContainerModel.find({});
    console.log('All containers in database:', allContainers.length);
    console.log('All container IDs:', allContainers.map(container => container._id));
    console.log('All container bio IDs:', allContainers.map(container => container.bio));
    
    // Now find containers matching our query
    const visitContainers = await this.bioVisitContainerModel.find(query);
    console.log('getTotalViews containers:', visitContainers.length);
    console.log('getTotalViews container IDs:', visitContainers.map(container => container._id));
    
    let totalVisits = 0;
    
    // Count visits from all containers if no specific query was provided
    if (Object.keys(query).length === 0) {
      console.log('No specific query provided, counting all visits');
      allContainers.forEach(container => {
        console.log(`Container ${container._id} has ${container.visits.length} visits`);
        totalVisits += container.visits.length;
      });
    } else {
      // Count visits from containers matching the query
      visitContainers.forEach(container => {
        console.log(`Container ${container._id} has ${container.visits.length} visits`);
        totalVisits += container.visits.length;
      });
    }
    
    return totalVisits;
  }

  async getTotalClicks(bioId?: string | Types.ObjectId, userId?: string | Types.ObjectId): Promise<number> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      console.log('getTotalClicks userId:', userId);
      
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      console.log('getTotalClicks userIdObj:', userIdObj);
      
      const userBios = await this.bioModel.find({ user: userIdObj });
      console.log('getTotalClicks userBios count:', userBios.length);
      
      if (!userBios || userBios.length === 0) {
        return 0;
      }
      
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
    }
    
    console.log('getTotalClicks query:', JSON.stringify(query));
    
    // First, try to find all visit containers regardless of query to see what's in the database
    const allContainers = await this.bioVisitContainerModel.find({});
    console.log('All containers for clicks:', allContainers.length);
    
    // Now find containers matching our query
    const visitContainers = await this.bioVisitContainerModel.find(query);
    console.log('getTotalClicks containers:', visitContainers.length);
    
    let totalClicks = 0;
    
    // Count clicks from all containers if no specific query was provided
    if (Object.keys(query).length === 0) {
      console.log('No specific query provided for clicks, counting all clicks');
      totalClicks = allContainers.reduce((total, container) => {
        return total + container.visits.reduce((clickTotal, visitor: Visitor) => {
          return clickTotal + visitor.clicks.length;
        }, 0);
      }, 0);
    } else {
      // Count clicks from containers matching the query
      totalClicks = visitContainers.reduce((total, container) => {
        return total + container.visits.reduce((clickTotal, visitor: Visitor) => {
          return clickTotal + visitor.clicks.length;
        }, 0);
      }, 0);
    }
    
    return totalClicks;
  }

  async getCountryDistribution(bioId?: string | Types.ObjectId, userId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const userBios = await this.bioModel.find({ user: userIdObj });
      if (!userBios || userBios.length === 0) {
        return {};
      }
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const countryDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      container.visits.forEach((visitor: Visitor) => {
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

  async getSocialDistribution(bioId?: string | Types.ObjectId, userId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const userBios = await this.bioModel.find({ user: userIdObj });
      if (!userBios || userBios.length === 0) {
        return {};
      }
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const socialDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      container.visits.forEach((visitor: Visitor) => {
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

  async getReferralDistribution(bioId?: string | Types.ObjectId, userId?: string | Types.ObjectId): Promise<Record<string, number>> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const userBios = await this.bioModel.find({ user: userIdObj });
      if (!userBios || userBios.length === 0) {
        return {};
      }
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
    }
    
    const visitContainers = await this.bioVisitContainerModel.find(query);
    
    const referralDistribution: Record<string, number> = {};
    
    visitContainers.forEach(container => {
      container.visits.forEach((visitor: Visitor) => {
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

  async getViewsTimeline(bioId?: string | Types.ObjectId, days: number = 30, userId?: string | Types.ObjectId): Promise<number[]> {
    let query = {};
    
    if (bioId) {
      // Convert string ID to ObjectId if needed
      const bioIdObj = typeof bioId === 'string' ? new Types.ObjectId(bioId) : bioId;
      const bio = await this.bioModel.findById(bioIdObj);
      if (!bio) {
        throw new NotFoundException('Bio not found');
      }
      query = { bio: bio._id };
    } else if (userId) {
      // If userId is provided but no bioId, get all bios for this user
      // Convert string ID to ObjectId if needed
      const userIdObj = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const userBios = await this.bioModel.find({ user: userIdObj });
      if (!userBios || userBios.length === 0) {
        return Array(days).fill(0);
      }
      const bioIds = userBios.map(bio => bio._id);
      query = { bio: { $in: bioIds } };
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
        timeline[days - 1 - dayDiff] += container.visits.length;
      }
    });
    
    return timeline;
  }
}
