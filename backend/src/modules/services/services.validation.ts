import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  description: z.string().trim().optional(),
  durationMinutes: z
    .number({ invalid_type_error: 'durationMinutes must be a number' })
    .int('durationMinutes must be a whole number')
    .positive('durationMinutes must be greater than 0'),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').trim().optional(),
  description: z.string().trim().optional(),
  durationMinutes: z
    .number({ invalid_type_error: 'durationMinutes must be a number' })
    .int()
    .positive()
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
