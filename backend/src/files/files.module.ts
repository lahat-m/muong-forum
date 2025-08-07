// src/files/files.module.ts

import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express'; // Import MulterModule
import * as path from 'path'; // Node.js path module
import * as fs from 'fs'; // Node.js file system module

// Define the uploads directory path
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    // Configure Multer to store files on local disk
    MulterModule.register({
      dest: uploadsDir, // Destination directory for uploaded files
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit (adjust as needed)
      },
      fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  ],
  providers: [FilesService],
  exports: [FilesService], // Export FilesService so it can be injected elsewhere
})
export class FilesModule {}
