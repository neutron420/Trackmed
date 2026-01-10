import { LocationMessage } from '../types/websocket';
import { clientManager } from './client-manager';
import prisma from '../config/database';

export async function handleLocationMessage(
  message: LocationMessage,
  senderUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { payload } = message;

    if (!payload.batchId || !payload.lat || !payload.lng) {
      return {
        success: false,
        error: 'Missing required fields: batchId, lat, lng',
      };
    }

    if (typeof payload.lat !== 'number' || typeof payload.lng !== 'number') {
      return {
        success: false,
        error: 'lat and lng must be numbers',
      };
    }

    if (payload.lat < -90 || payload.lat > 90 || payload.lng < -180 || payload.lng > 180) {
      return {
        success: false,
        error: 'Invalid coordinates',
      };
    }

    const locationData = {
      type: 'LOCATION' as const,
      payload: {
        batchId: payload.batchId,
        warehouseId: payload.warehouseId,
        lat: payload.lat,
        lng: payload.lng,
        timestamp: payload.timestamp || new Date().toISOString(),
      },
    };

    const superAdminClients = clientManager.getSuperAdminClients();

    if (superAdminClients.length === 0) {
      console.log('No SUPERADMIN clients connected to receive location update');
    } else {
      const messageStr = JSON.stringify(locationData);
      superAdminClients.forEach((client) => {
        if (client.socket.readyState === 1) {
          client.socket.send(messageStr);
        }
      });
      console.log(`Location update forwarded to ${superAdminClients.length} SUPERADMIN client(s)`);
    }

    storeLatestLocation(payload.batchId, payload.warehouseId);

    return { success: true };
  } catch (error: any) {
    console.error('Error handling location message:', error);
    return {
      success: false,
      error: error.message || 'Failed to process location update',
    };
  }
}

async function storeLatestLocation(
  batchId: string,
  warehouseId: string | undefined
): Promise<void> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return;
    }

    if (warehouseId) {
      await prisma.batch.update({
        where: { id: batchId },
        data: {
          warehouseLocation: warehouseId,
        },
      });
    }
  } catch (error) {
    console.error('Error storing location:', error);
  }
}

export function validateLocationMessage(message: any): message is LocationMessage {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (message.type !== 'LOCATION') {
    return false;
  }

  if (!message.payload || typeof message.payload !== 'object') {
    return false;
  }

  const { payload } = message;

  return (
    typeof payload.batchId === 'string' &&
    typeof payload.lat === 'number' &&
    typeof payload.lng === 'number'
  );
}
