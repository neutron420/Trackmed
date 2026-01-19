/**
 * Fetch address details from Indian pin code
 * Uses free API: https://api.postalpincode.in/
 */
export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  district: string;
  country: string;
  address: string;
}

export interface PincodeAddressOption {
  name: string;
  district: string;
  state: string;
  block?: string;
  division?: string;
  region?: string;
  circle?: string;
  country: string;
  fullAddress: string;
}

export async function getAddressFromPincode(pincode: string): Promise<{
  success: boolean;
  data?: PincodeData;
  error?: string;
}> {
  try {
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return {
        success: false,
        error: 'Invalid pincode format. Must be 6 digits.',
      };
    }

    // Fetch from free Indian postal API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to fetch address. Please try again.',
      };
    }

    const result = await response.json();
    
    // Check if API returned valid data
    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        success: false,
        error: 'Pincode not found.',
      };
    }

    const postOfficeData = result[0];
    
    if (postOfficeData.Status === 'Error' || !postOfficeData.PostOffice || postOfficeData.PostOffice.length === 0) {
      return {
        success: false,
        error: postOfficeData.Message || 'Pincode not found.',
      };
    }

    // Get first post office (usually representative of the area)
    const firstPostOffice = postOfficeData.PostOffice[0];
    
    const addressData: PincodeData = {
      pincode: pincode,
      city: firstPostOffice.District || firstPostOffice.Block || '',
      state: firstPostOffice.State || '',
      district: firstPostOffice.District || '',
      country: firstPostOffice.Country || 'India',
      address: `${firstPostOffice.Name || ''}, ${firstPostOffice.District || ''}, ${firstPostOffice.State || ''}, ${pincode}`.trim(),
    };

    return {
      success: true,
      data: addressData,
    };
  } catch (error: any) {
    console.error('Pincode lookup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch address. Please check your internet connection.',
    };
  }
}

/**
 * Get all address options from pin code (for selection)
 */
export async function getAllAddressOptionsFromPincode(pincode: string): Promise<{
  success: boolean;
  data?: PincodeAddressOption[];
  error?: string;
}> {
  try {
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return {
        success: false,
        error: 'Invalid pincode format. Must be 6 digits.',
      };
    }

    // Fetch from free Indian postal API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to fetch address. Please try again.',
      };
    }

    const result = await response.json();
    
    // Check if API returned valid data
    if (!result || !Array.isArray(result) || result.length === 0) {
      return {
        success: false,
        error: 'Pincode not found.',
      };
    }

    const postOfficeData = result[0];
    
    if (postOfficeData.Status === 'Error' || !postOfficeData.PostOffice || postOfficeData.PostOffice.length === 0) {
      return {
        success: false,
        error: postOfficeData.Message || 'Pincode not found.',
      };
    }

    // Get all post offices for this pin code
    const addressOptions: PincodeAddressOption[] = postOfficeData.PostOffice.map((po: any) => ({
      name: po.Name || '',
      district: po.District || '',
      state: po.State || '',
      block: po.Block || '',
      division: po.Division || '',
      region: po.Region || '',
      circle: po.Circle || '',
      country: po.Country || 'India',
      fullAddress: `${po.Name || ''}, ${po.District || ''}, ${po.State || ''}, ${pincode}`.trim(),
    }));

    return {
      success: true,
      data: addressOptions,
    };
  } catch (error: any) {
    console.error('Pincode lookup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch address. Please check your internet connection.',
    };
  }
}

/**
 * Format address from pincode data
 */
export function formatAddress(data: PincodeData, locationName?: string): string {
  const parts = [];
  
  if (locationName) {
    parts.push(locationName);
  }
  
  if (data.city) {
    parts.push(data.city);
  }
  
  if (data.state) {
    parts.push(data.state);
  }
  
  parts.push(data.pincode);
  parts.push(data.country);
  
  return parts.filter(Boolean).join(', ');
}
