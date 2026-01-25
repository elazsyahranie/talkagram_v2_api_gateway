import { z, ZodType } from 'zod';

export class StaffValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string('Name is required!').min(1, 'Name is required!').max(100),
    password: z.string('Password is required!').min(1).max(100),
    username: z.string('Username is required!').min(1).max(100),
    phone: z.string('Phone is required!').min(1).max(100),
    email: z.string('Email is required!').min(1).max(100),
    role: z.literal(['Admin', 'Staff'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
    about: z.string().min(1).max(100).optional(),
  });
}
