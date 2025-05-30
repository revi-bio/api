import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpotifyPlaylistData } from '../types/schema/Spotify';
import { Public } from '../auth/public.decorator';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Public()
  @Get('playlist/:id')
  async getPlaylist(
    @Param('id') playlistId: string,
    @Query('refresh') refresh?: string,
  ): Promise<SpotifyPlaylistData> {
    if (refresh === 'true') {
      return await this.spotifyService.refreshSpotifyData(playlistId);
    }
    return await this.spotifyService.getPlaylist(playlistId);
  }

  @Public()
  @Get('playlist/:id/tracks')
  async getPlaylistTracks(@Param('id') playlistId: string) {
    return await this.spotifyService.getPlaylistTracks(playlistId);
  }
}
