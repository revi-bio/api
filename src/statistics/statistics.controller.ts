import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/user/user.decorator';
import { JwtData } from 'src/types/JwtData';
import { Types } from 'mongoose';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('info')
    async getInfo(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {
                views: 0,
                linksClicked: 0,
                avgSecondsOnSites: 0,
            };
        }
        
        // Calculate total views and clicks for all user's bios in one go
        const totalViews = await this.statisticsService.getTotalViews(undefined, currentUser.id);
        const totalClicks = await this.statisticsService.getTotalClicks(undefined, currentUser.id);
        
        // For now, we'll keep the avgSecondsOnSites as a static value
        // In the future, this could be calculated from actual session data
        return {
            views: totalViews,
            linksClicked: totalClicks,
            avgSecondsOnSites: 40,
        };
    }

    /** Return max 5 countries */
    @Get('countries')
    async getCountries(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {};
        }
        
        // Get country distribution for all bios at once
        return await this.statisticsService.getCountryDistribution(undefined, currentUser.id);
    }

    @Get('socials')
    async getSocials(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {};
        }
        
        // Get social distribution for all bios at once
        return await this.statisticsService.getSocialDistribution(undefined, currentUser.id);
    }

    @Get('views')
    async getViews(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return Array(30).fill(0);
        }
        
        // Get views timeline for all bios at once
        return await this.statisticsService.getViewsTimeline(undefined, 30, currentUser.id);
    }

    @Get('referral-distribution')
    async getReferralDistribution(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {};
        }
        
        // Get referral distribution for all bios at once
        return await this.statisticsService.getReferralDistribution(undefined, currentUser.id);
    }

    // Bio-specific endpoints
    @Get('bio/:bioId/info')
    async getBioInfo(@Param('bioId') bioId: string, @CurrentUser() currentUser: JwtData) {
        // Verify that the bio belongs to the current user
        const bio = await this.statisticsService.getBiosByUser(currentUser.id)
            .then(bios => bios.find(b => b._id.toString() === bioId));
        
        if (!bio) {
            return {
                views: 0,
                linksClicked: 0,
                avgSecondsOnSites: 0,
            };
        }
        
        const totalViews = await this.statisticsService.getTotalViews(bioId);
        const totalClicks = await this.statisticsService.getTotalClicks(bioId);
        
        return {
            views: totalViews,
            linksClicked: totalClicks,
            avgSecondsOnSites: 40,
        };
    }

    @Get('bio/:bioId/countries')
    async getBioCountries(@Param('bioId') bioId: string, @CurrentUser() currentUser: JwtData) {
        // Verify that the bio belongs to the current user
        const bio = await this.statisticsService.getBiosByUser(currentUser.id)
            .then(bios => bios.find(b => b._id.toString() === bioId));
        
        if (!bio) {
            return {};
        }
        
        return await this.statisticsService.getCountryDistribution(bioId);
    }

    @Get('bio/:bioId/socials')
    async getBioSocials(@Param('bioId') bioId: string, @CurrentUser() currentUser: JwtData) {
        // Verify that the bio belongs to the current user
        const bio = await this.statisticsService.getBiosByUser(currentUser.id)
            .then(bios => bios.find(b => b._id.toString() === bioId));
        
        if (!bio) {
            return {};
        }
        
        return await this.statisticsService.getSocialDistribution(bioId);
    }

    @Get('bio/:bioId/views')
    async getBioViews(@Param('bioId') bioId: string, @CurrentUser() currentUser: JwtData) {
        // Verify that the bio belongs to the current user
        const bio = await this.statisticsService.getBiosByUser(currentUser.id)
            .then(bios => bios.find(b => b._id.toString() === bioId));
        
        if (!bio) {
            return Array(30).fill(0);
        }
        
        return await this.statisticsService.getViewsTimeline(bioId);
    }

    @Get('bio/:bioId/referral-distribution')
    async getBioReferralDistribution(@Param('bioId') bioId: string, @CurrentUser() currentUser: JwtData) {
        // Verify that the bio belongs to the current user
        const bio = await this.statisticsService.getBiosByUser(currentUser.id)
            .then(bios => bios.find(b => b._id.toString() === bioId));
        
        if (!bio) {
            return {};
        }
        
        return await this.statisticsService.getReferralDistribution(bioId);
    }
}
