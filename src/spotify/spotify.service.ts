import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SpotifyPlaylistData, SpotifyTokenResponse, TrackItem } from '../types/schema/Spotify';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string = '';
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {}

  private get hasValidToken(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt;
  }

  private setToken(token: string, expiresIn: number): void {
    this.accessToken = token;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
  }

  async getAccessToken(): Promise<string> {
    if (this.hasValidToken) {
      return this.accessToken;
    }

    try {
      const clientId = this.configService.get<string>('spotify.clientId');
      const clientSecret = this.configService.get<string>('spotify.clientSecret');
      const tokenUrl = this.configService.get<string>('spotify.tokenUrl');

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await axios.post<SpotifyTokenResponse>(
        tokenUrl,
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in } = response.data;
      this.setToken(access_token, expires_in);

      return access_token;
    } catch (err) {
      const errorMsg = 'Failed to get Spotify access token';
      this.logger.error(errorMsg, err);
      throw new Error(errorMsg);
    }
  }

  async getPlaylistTracks(playlistId: string): Promise<{ items: TrackItem[] } | null> {
    if (!playlistId) {
      throw new Error('Missing playlist ID');
    }

    try {
      const token = await this.getAccessToken();
      const apiBaseUrl = this.configService.get<string>('spotify.apiBaseUrl');
      
      const response = await axios.get(`${apiBaseUrl}/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          fields: 'items(track(name,artists(name,external_urls),album(images),external_urls))',
        },
      });

      return { items: response.data.items };
    } catch (err) {
      this.logger.error(`Error while fetching playlist tracks: ${err.message}`, err.stack);
      throw new Error(`Failed to fetch playlist tracks: ${err.message}`);
    }
  }

  async getPlaylist(playlistId: string): Promise<SpotifyPlaylistData | null> {
    if (!playlistId) {
      throw new Error('Missing playlist ID');
    }

    try {
      const token = await this.getAccessToken();
      const apiBaseUrl = this.configService.get<string>('spotify.apiBaseUrl');
      
      const response = await axios.get(`${apiBaseUrl}/playlists/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          fields: 'id,name,images,owner(display_name,external_urls),external_urls',
        },
      });

      const data = response.data;
      const tracksData = await this.getPlaylistTracks(playlistId);

      const playlistData: SpotifyPlaylistData = {
        playlistId: data.id,
        playlistName: data.name,
        image: data.images[0]?.url || '',
        owner: {
          displayName: data.owner.display_name,
          href: data.owner.external_urls.spotify,
        },
        playlistUrl: data.external_urls.spotify,
        tracks: tracksData || undefined,
      };

      return playlistData;
    } catch (err) {
      this.logger.error(`Error while fetching spotify data: ${err.message}`, err.stack);
      throw new Error(`Failed to fetch playlist: ${err.message}`);
    }
  }

  async refreshSpotifyData(playlistId: string): Promise<SpotifyPlaylistData | null> {
    return await this.getPlaylist(playlistId);
  }
}
