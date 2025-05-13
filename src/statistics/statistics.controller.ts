import { Controller, Get } from '@nestjs/common';

@Controller('statistics')
export class StatisticsController {
    @Get('info')
    async getInfo() {
        return {
            views: 6969,
            linksClicked: 420,
            avgSecondsOnSites: 40,
        }
    }

    /** Return max 5 countries */
    @Get('countries')
    async getCountries() {
        return {
            'hungary': 503,
            'germany': 42,
            'nether': 1,
        }
    }

    @Get('socials')
    async getSocials() {
        return {
            'youtube': 120,
            'instagram': 53,
            'steam': 28,
            'github': 12,
            'facebook': 4,
        }
    }

    @Get('views')
    async getViews() {
        return (new Array(30)).map(() => Math.ceil(Math.random() * 10));
    }

    @Get('referral-distribution')
    async getReferralDistribution() {
        return {
            'referral1': 40,
            'referral2': 30,
            'referral3': 20,
            'referral4': 10,
        }
    }
}
