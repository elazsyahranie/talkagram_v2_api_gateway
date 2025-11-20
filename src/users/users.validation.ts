import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string().min(1).max(100),
    password: z.string('Password is required!').min(1).max(100),
    username: z.string('Username is required!').min(1).max(100),
    phone: z.string('Phone is required!').min(1).max(100),
    email: z.string('Email is required!').min(1).max(100),
    role: z.literal(['Admin', 'User'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
    about: z.string().min(1).max(100).optional(),
  });

  static readonly LOGIN: ZodType = z.object({
    password: z.string('Password is required!').min(1).max(100),
    email: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(100).optional(),
    username: z.string().min(1).max(100).optional(),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().min(1).max(100).optional(),
    password: z.string().min(1).max(100).optional(),
    username: z.string().min(1).max(100).optional(),
    phone: z.string().min(1).max(100).optional(),
    role: z.literal(['Admin', 'User'], 'Invalid input').optional(),
    about: z.string().min(1).max(100).optional(),
  });
}

// email: z
//   .string({
//     error: (iss) =>
//       iss.input === undefined ? 'Field is required.' : 'Invalid input.',
//   })
//   .min(1)
//   .max(100),
