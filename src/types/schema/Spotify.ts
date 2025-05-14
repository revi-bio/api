export interface TrackItem {
  track: {
    name: string;
    artists: {
      name: string;
      external_urls: {
        spotify: string;
      };
    }[];
    album: {
      images: {
        url: string;
        height: number;
        width: number;
      }[];
    };
    external_urls: {
      spotify: string;
    };
  };
}

export interface SpotifyPlaylistData {
  playlistId: string;
  image: string;
  playlistName: string;
  owner?: {
    href: string;
    displayName: string;
  };
  tracks?: {
    items: TrackItem[];
  };
  playlistUrl?: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
