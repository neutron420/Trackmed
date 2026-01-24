import { Router } from 'express';
import type { Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

const OLA_MAPS_CLIENT_ID = process.env.OLA_MAPS_CLIENT_ID;
const OLA_MAPS_CLIENT_SECRET = process.env.OLA_MAPS_CLIENT_SECRET;

// Cache for OAuth token
let cachedToken: { token: string; expiresAt: number } | null = null;

// Get OAuth token from Ola Maps
async function getOlaToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
  
  const response = await (fetchFn as typeof fetch)(
    'https://account.olamaps.io/realms/olamaps/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: OLA_MAPS_CLIENT_ID || '',
        client_secret: OLA_MAPS_CLIENT_SECRET || '',
      }).toString(),
    }
  );

  const data: any = await response.json();
  
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || 'Failed to get OAuth token');
  }

  // Cache the token (expire 5 minutes early to be safe)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + ((data.expires_in || 3600) - 300) * 1000,
  };

  return data.access_token;
}

router.get('/search', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
      return;
    }

    if (!OLA_MAPS_CLIENT_ID || !OLA_MAPS_CLIENT_SECRET) {
      res.status(500).json({
        success: false,
        error: 'Ola Maps OAuth credentials not configured',
      });
      return;
    }

    // Get OAuth token
    const token = await getOlaToken();

    // Ola Maps Autocomplete API (works better than textsearch for places)
    const searchQuery = encodeURIComponent(`${query} pharmacy`);
    const url = `https://api.olamaps.io/places/v1/autocomplete?input=${searchQuery}`;
    
    const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
    
    const response = await (fetchFn as typeof fetch)(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: any = await response.json();

    console.log('Ola Maps response:', JSON.stringify(data).substring(0, 500));

    if (response.ok && data.status === 'ok') {
      // Map Ola Maps response to our format
      const results = (data.predictions || []).map((place: any) => ({
        place_id: place.place_id || place.reference,
        name: place.structured_formatting?.main_text || place.description?.split(',')[0] || 'Unknown',
        formatted_address: place.description || place.structured_formatting?.secondary_text || '',
        formatted_phone_number: null,
        geometry: place.geometry ? { 
          location: {
            lat: place.geometry.location?.lat,
            lng: place.geometry.location?.lng
          }
        } : undefined,
        rating: null,
        opening_hours: null,
        photos: [],
      }));

      res.json({
        success: true,
        data: results,
      });
    } else {
      console.error('Ola Maps API error:', data);
      res.status(400).json({
        success: false,
        error: data.error_message || data.message || 'Failed to search places',
        status: data.status,
      });
    }
  } catch (error: any) {
    console.error('Ola Maps search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/places/details
 * Get place details from Ola Maps
 */
router.get('/details', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const placeId = req.query.place_id as string;

    if (!placeId) {
      res.status(400).json({
        success: false,
        error: 'Place ID is required',
      });
      return;
    }

    if (!OLA_MAPS_CLIENT_ID || !OLA_MAPS_CLIENT_SECRET) {
      res.status(500).json({
        success: false,
        error: 'Ola Maps OAuth credentials not configured',
      });
      return;
    }

    const token = await getOlaToken();

    const url = `https://api.olamaps.io/places/v1/details?place_id=${placeId}`;
    
    const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;
    
    const response = await (fetchFn as typeof fetch)(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: any = await response.json();

    if (response.ok && data.status === 'ok') {
      const result = data.result || {};
      res.json({
        success: true,
        data: {
          place_id: result.place_id,
          name: result.name,
          formatted_address: result.formatted_address,
          formatted_phone_number: result.formatted_phone_number,
          geometry: result.geometry,
          rating: result.rating,
          opening_hours: result.opening_hours,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.error_message || 'Failed to get place details',
      });
    }
  } catch (error: any) {
    console.error('Ola Maps details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/places/photo
 * Note: Ola Maps may not have a direct photo API
 */
router.get('/photo', async (req: Request, res: Response): Promise<void> => {
  try {
    const photoReference = req.query.reference as string;

    if (!photoReference) {
      res.status(400).json({
        success: false,
        error: 'Photo reference is required',
      });
      return;
    }

    res.json({
      success: true,
      data: { 
        url: null,
        message: 'Photo API not available for Ola Maps'
      },
    });
  } catch (error: any) {
    console.error('Ola Maps photo error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
});

export default router;
