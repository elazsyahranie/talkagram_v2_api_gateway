import { HttpException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export function fileFilter(file: any) {
  console.log('-FILE FILTER-');
  console.dir(file, { depth: null });
}

// Enter the directory of the folder to store the file
export function multerImageConfig(path: string) {
  return {
    storage: diskStorage({
      destination: `./uploads/${path}`,
      filename: (_req, file, callback) => {
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, name + extname(file.originalname));
      },
    }),

    // Type Validation
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (!allowedTypes.includes(file.mimetype)) {
        cb(
          new HttpException(
            'Only JPEG, JPG, and PNG formats are allowed!',
            400,
          ),
          false,
        );
      } else {
        cb(null, true);
      }
    },

    limits: { fileSize: 5 * 1024 * 1024 },
  };
}
