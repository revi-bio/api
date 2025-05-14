const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000'; // Change if your API is running on a different URL
const EMAIL = 'tatraidominikoszkar@turr.hu';
const PASSWORD = 'Tarrmaci1!';
const PLAYLIST_ID = '6el3eI1j7EpF2xNpgxUtGj';

// Main test function
async function testSpotifyIntegration() {
  try {
    console.log('Starting Spotify integration test...');
    
    // Step 1: Login to get JWT token
    console.log('\n1. Authenticating user...');
    const authResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    const token = authResponse.data.jwt;
    console.log('✅ Authentication successful! JWT token received.');
    
    // Configure axios for authenticated requests
    const authAxios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Step 2: Get playlist data
    console.log('\n2. Fetching playlist data...');
    const playlistResponse = await authAxios.get(`${API_URL}/spotify/playlist/${PLAYLIST_ID}`);
    
    console.log('✅ Playlist data retrieved successfully!');
    console.log('Playlist name:', playlistResponse.data.playlistName);
    console.log('Owner:', playlistResponse.data.owner?.displayName);
    console.log('Image URL:', playlistResponse.data.image);
    
    // Step 3: Get playlist tracks
    console.log('\n3. Fetching playlist tracks...');
    const tracksResponse = await authAxios.get(`${API_URL}/spotify/playlist/${PLAYLIST_ID}/tracks`);
    
    console.log('✅ Playlist tracks retrieved successfully!');
    console.log('Number of tracks:', tracksResponse.data.items.length);
    
    // Display first 3 tracks
    console.log('\nFirst 3 tracks:');
    tracksResponse.data.items.slice(0, 3).forEach((item, index) => {
      console.log(`${index + 1}. ${item.track.name} - ${item.track.artists.map(a => a.name).join(', ')}`);
    });
    
    console.log('\n✅ All tests passed! Spotify integration is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. Is the server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testSpotifyIntegration();
