import * as dotenv from 'dotenv';
dotenv.config();

export const USERS_SERVICE_UNAVAILABE_OR_CRASHED =
  'Users service unavailable or crashed';
export const MEDIA_SERVICE_HTTP_URL = `http://localhost:${process.env.MEDIA_SERVICE_HTTP_PORT}`;
export const MEDIA_SERVICE_UNAVAILABE_OR_CRASHED =
  'Media service unavailable or crashed';
