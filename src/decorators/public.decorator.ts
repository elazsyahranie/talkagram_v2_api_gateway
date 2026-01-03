import { SetMetadata } from '@nestjs/common';

// Required for any Public routes (add this manually to required controllers if the Auth Guard is set as global)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
