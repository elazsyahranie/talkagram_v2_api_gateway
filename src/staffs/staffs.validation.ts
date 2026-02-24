import { z, ZodType } from 'zod';

export class StaffValidation {
  static readonly createSchema: ZodType = z.object({
    user: z.string('User is required').min(1).max(100),
    role: z.literal(['Admin', 'Staff'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
  });
  static readonly CREATE: ZodType = z.array(this.createSchema);

  static readonly updateSchema: ZodType = z.object({
    user: z.string('User is required').min(1).max(100),
    role: z.literal(['Admin', 'Staff'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
  });
  static readonly UPDATE: ZodType = z.array(this.updateSchema);
}
