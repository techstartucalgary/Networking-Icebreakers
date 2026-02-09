import axios from 'axios';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo';

export interface LinkedInProfile {
  sub: string;          // LinkedIn user ID
  name: string;         // Full name
  email: string;        // Email address
  picture?: string;     // Profile picture URL
}

/**
 * Generate LinkedIn authorization URL
 */
export const getLinkedInAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
    state: state,
    scope: 'openid profile email',
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const getLinkedInAccessToken = async (code: string): Promise<string> => {
  try {
    const response = await axios.post(
      LINKEDIN_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('LinkedIn token exchange error:', error.response?.data || error.message);
    throw new Error('Failed to obtain LinkedIn access token');
  }
};

/**
 * Fetch user profile from LinkedIn using access token
 */
export const getLinkedInProfile = async (accessToken: string): Promise<LinkedInProfile> => {
  try {
    const response = await axios.get(LINKEDIN_PROFILE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.data || !response.data.sub) {
      throw new Error('Invalid LinkedIn API response format');
    }

    return {
      sub: response.data.sub,
      name: response.data.name || 'LinkedIn User',
      email: response.data.email || '',
      picture: response.data.picture,
    };
  } catch (error: any) {
    console.error('LinkedIn profile fetch error:', error.response?.data || error.message);
    throw new Error('Failed to fetch LinkedIn profile');
  }
};
