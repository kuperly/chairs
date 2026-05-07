import { z } from 'zod';

/**
 * Event status enum - Broadcast status only
 * Purchase availability is determined by time windows, not status
 */
export const eventStatusEnum = z.enum([
  'draft',      // Created, not ready to broadcast
  'scheduled',  // Ready to go live at scheduled time
  'live',       // Currently broadcasting
  'ended',      // Broadcast finished (products may still be purchasable)
]);

/**
 * Validation schema for creating an event
 */
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  scheduledStartTime: z.string().datetime('Invalid start time'),
  scheduledEndTime: z.string().datetime('Invalid end time'),
  thumbnailUrl: z.string().url().optional().nullable(),
  manufacturerId: z.string().uuid('Invalid manufacturer ID'),
  featuredProductIds: z.array(z.string().uuid()).optional().default([]),
}).refine(
  (data) => new Date(data.scheduledEndTime) > new Date(data.scheduledStartTime),
  {
    message: 'End time must be after start time',
    path: ['scheduledEndTime'],
  }
);

/**
 * Validation schema for updating an event
 */
export const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  scheduledStartTime: z.string().datetime().optional(),
  scheduledEndTime: z.string().datetime().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  featuredProductIds: z.array(z.string().uuid()).optional(),
  status: eventStatusEnum.optional(),
});

/**
 * Validation schema for starting a broadcast
 */
export const startBroadcastSchema = z.object({
  agoraChannelName: z.string().optional(),
});

/**
 * Query parameters for listing events
 */
export const listEventsQuerySchema = z.object({
  status: eventStatusEnum.optional(),
  manufacturerId: z.string().uuid().optional(),
  upcoming: z.enum(['true', 'false']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type StartBroadcastInput = z.infer<typeof startBroadcastSchema>;
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;
