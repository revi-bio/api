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
        
        // Get visit containers for all user's bios
        const bioIds = userBios.map(bio => bio._id);
        
        // Calculate total views and clicks for user's bios
        let totalViews = 0;
        let totalClicks = 0;
        
        for (const bioId of bioIds) {
            totalViews += await this.statisticsService.getTotalViews(bioId);
            totalClicks += await this.statisticsService.getTotalClicks(bioId);
        }
        
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
        
        // Combine country distributions from all user's bios
        const countryDistribution: Record<string, number> = {};
        
        for (const bio of userBios) {
            const bioDist = await this.statisticsService.getCountryDistribution(bio._id);
            
            for (const [country, count] of Object.entries(bioDist)) {
                countryDistribution[country] = (countryDistribution[country] || 0) + count;
            }
        }
        
        // Sort by count in descending order and limit to top 5
        return Object.fromEntries(
            Object.entries(countryDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
        );
    }

    @Get('socials')
    async getSocials(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {};
        }
        
        // Combine social distributions from all user's bios
        const socialDistribution: Record<string, number> = {};
        
        for (const bio of userBios) {
            const bioDist = await this.statisticsService.getSocialDistribution(bio._id);
            
            for (const [social, count] of Object.entries(bioDist)) {
                socialDistribution[social] = (socialDistribution[social] || 0) + count;
            }
        }
        
        // Sort by count in descending order
        return Object.fromEntries(
            Object.entries(socialDistribution)
                .sort(([, a], [, b]) => b - a)
        );
    }

    @Get('views')
    async getViews(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return Array(30).fill(0);
        }
        
        // Combine view timelines from all user's bios
        const combinedTimeline = Array(30).fill(0);
        
        for (const bio of userBios) {
            const bioTimeline = await this.statisticsService.getViewsTimeline(bio._id);
            
            for (let i = 0; i < bioTimeline.length; i++) {
                combinedTimeline[i] += bioTimeline[i];
            }
        }
        
        return combinedTimeline;
    }

    @Get('referral-distribution')
    async getReferralDistribution(@CurrentUser() currentUser: JwtData) {
        // Get all bios owned by the current user
        const userBios = await this.statisticsService.getBiosByUser(currentUser.id);
        
        if (!userBios || userBios.length === 0) {
            return {};
        }
        
        // Combine referral distributions from all user's bios
        const referralDistribution: Record<string, number> = {};
        
        for (const bio of userBios) {
            const bioDist = await this.statisticsService.getReferralDistribution(bio._id);
            
            for (const [referrer, count] of Object.entries(bioDist)) {
                referralDistribution[referrer] = (referralDistribution[referrer] || 0) + count;
            }
        }
        
        // Sort by count in descending order
        return Object.fromEntries(
            Object.entries(referralDistribution)
                .sort(([, a], [, b]) => b - a)
        );
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
