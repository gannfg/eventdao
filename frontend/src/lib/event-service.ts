import { supabase } from './supabase';
import { Event, CreateEventData } from '@eventdao/shared';

export class EventService {
  private static extractStoragePathFromPublicUrl(url: string): string | null {
    try {
      const marker = '/object/public/event-media/';
      const idx = url.indexOf(marker);
      if (idx === -1) return null;
      return url.slice(idx + marker.length);
    } catch {
      return null;
    }
  }

  /**
   * Upload files to Supabase Storage
   */
  static async uploadFiles(files: File[], eventId: string): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('event-media')
          .upload(filePath, file);
        
        if (error) {
          console.error('Error uploading file:', error);
          continue;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('event-media')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    return uploadedUrls;
  }

  /**
   * Create a new event
   */
  static async createEvent(eventData: CreateEventData, files: File[] = []): Promise<Event> {
    try {
      // First create the event record
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_url: eventData.event_url,
          date: eventData.date,
          location: eventData.location,
          category: eventData.category,
          bond: eventData.bond,
          status: 'active',
          authentic_stake: 0,
          hoax_stake: 0,
          time_left: this.calculateTimeLeft(eventData.date),
          media_files: [],
          user_id: eventData.user_id,
        })
        .select()
        .single();

      if (eventError) {
        throw new Error(`Failed to create event: ${eventError.message}`);
      }

      // Upload files if any
      let mediaFiles: string[] = [];
      if (files.length > 0) {
        mediaFiles = await this.uploadFiles(files, event.id);
        
        // Update event with media files
        const { error: updateError } = await supabase
          .from('events')
          .update({ media_files: mediaFiles })
          .eq('id', event.id);

        if (updateError) {
          console.error('Error updating event with media files:', updateError);
        }
      }

      return {
        ...event,
        media_files: mediaFiles,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Get all events
   */
  static async getEvents(): Promise<Event[]> {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      return events || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  static async getEventById(id: string): Promise<Event | null> {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Event not found
        }
        throw new Error(`Failed to fetch event: ${error.message}`);
      }

      return event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Calculate time left until event
   */
  static calculateTimeLeft(eventDate: string): string {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Event passed';
    if (diffDays === 1) return '1d 0h';
    return `${diffDays}d 0h`;
  }

  /**
   * Update event status
   */
  static async updateEventStatus(id: string, status: 'active' | 'completed' | 'disputed'): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update event status: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  }

  /**
   * Update stakes for an event
   */
  static async updateStakes(id: string, authenticStake: number, hoaxStake: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          authentic_stake: authenticStake,
          hoax_stake: hoaxStake 
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update stakes: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating stakes:', error);
      throw error;
    }
  }

  /**
   * Permanently delete an event and its media files
   */
  static async deleteEvent(id: string): Promise<void> {
    try {
      const event = await this.getEventById(id);
      if (!event) {
        throw new Error('Event not found');
      }

      // Best-effort removal of media files from storage
      const pathsToRemove: string[] = [];
      if (Array.isArray(event.media_files)) {
        for (const url of event.media_files) {
          const path = this.extractStoragePathFromPublicUrl(url);
          if (path) pathsToRemove.push(path);
        }
      }

      if (pathsToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('event-media')
          .remove(pathsToRemove);
        if (storageError) {
          console.warn('Failed to remove some media files:', storageError.message);
        }
      }

      // Delete the event row
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
