import { z, ZodType } from 'zod';

export class StoreValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string('Name is required!').min(1, 'Name is required!').max(100),
    address: z.string('Address is required!').min(1).max(100),
  });
}
