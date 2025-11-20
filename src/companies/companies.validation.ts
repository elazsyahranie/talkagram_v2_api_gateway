import { z, ZodType } from 'zod';

export class CompanyValidation {
  static readonly CREATE: ZodType = z.object({
    // user_id: z.string('Password is required!').min(1).max(100),
    code: z.string('Phone is required!').min(1).max(100),
    name: z.string('Email is required!').min(1).max(100),
  });

  //   static readonly LOGIN: ZodType = z.object({
  //     password: z.string('Password is required!').min(1).max(100),
  //     email: z.string().min(1).max(100).optional(),
  //     phone: z.string().min(1).max(100).optional(),
  //     username: z.string().min(1).max(100).optional(),
  //   });

  //   static readonly UPDATE: ZodType = z.object({
  //     name: z.string().min(1).max(100).optional(),
  //     email: z.string().min(1).max(100).optional(),
  //     password: z.string().min(1).max(100).optional(),
  //     username: z.string().min(1).max(100).optional(),
  //     phone: z.string().min(1).max(100).optional(),
  //     role: z.literal(['Admin', 'User'], 'Invalid input').optional(),
  //     about: z.string().min(1).max(100).optional(),
  //   });
}
