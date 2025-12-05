import { diskStorage } from 'multer';
import { extname } from 'path';

export function multerImageConfig(path: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${path}`,
      filename: (_req, file, callback) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, name + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  };
}
