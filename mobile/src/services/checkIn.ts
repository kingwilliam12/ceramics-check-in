import { supabase } from './supabase';
import { useOfflineQueue } from '@hooks/useOfflineQueue';

export type CheckInData = {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  created_at: string;
  updated_at: string;
};

class CheckInService {
  private queue = useOfflineQueue();

  // Check in with offline support
  async checkIn(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<CheckInData> {
    const location = { latitude, longitude };
    
    // First try to check in online
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .insert([
          {
            user_id: userId,
            check_in_time: new Date().toISOString(),
            location: `POINT(${longitude} ${latitude})`,
            status: 'CHECKED_IN'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      // If successful, return the check-in data
      return {
        ...data,
        location: { latitude, longitude }
      };
    } catch (error) {
      // If offline or error, add to queue
      console.log('Offline or error, adding to queue', error);
      await this.queue.enqueue('CHECK_IN', { latitude, longitude });
      
      // Return a local version that will be synced later
      return {
        id: `local-${Date.now()}`,
        user_id: userId,
        check_in_time: new Date().toISOString(),
        location: { latitude, longitude },
        status: 'CHECKED_IN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  // Check out with offline support
  async checkOut(userId: string): Promise<CheckInData> {
    try {
      // First, get the latest check-in
      const { data: latestCheckIn, error: fetchError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      if (!latestCheckIn) {
        throw new Error('No active check-in found');
      }

      // Update the check-out time
      const { data, error: updateError } = await supabase
        .from('check_ins')
        .update({
          check_out_time: new Date().toISOString(),
          status: 'CHECKED_OUT',
          updated_at: new Date().toISOString()
        })
        .eq('id', latestCheckIn.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      return data;
    } catch (error) {
      // If offline or error, add to queue
      console.log('Offline or error during checkout, adding to queue', error);
      await this.queue.enqueue('CHECK_OUT');
      
      // Return a local version that will be synced later
      return {
        id: `local-checkout-${Date.now()}`,
        user_id: userId,
        check_in_time: new Date().toISOString(),
        check_out_time: new Date().toISOString(),
        status: 'CHECKED_OUT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  // Get current check-in status
  async getCurrentCheckIn(userId: string): Promise<CheckInData | null> {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting current check-in:', error);
      return null;
    }
  }

  // Get check-in history
  async getCheckInHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<CheckInData[]> {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('check_in_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting check-in history:', error);
      return [];
    }
  }
}

export const checkInServices = new CheckInService();
