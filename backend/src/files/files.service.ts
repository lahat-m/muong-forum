// src/files/files.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly uploadsPath = path.join(__dirname, '..', '..', 'uploads');
  private readonly baseUrl = 'http://localhost:3000'; // Adjust to your backend URL

  /**
   * Saves an uploaded file to the local disk and returns its URL.
   * @param file The Multer file object.
   * @returns The public URL of the saved file.
   * @throws BadRequestException if the file is invalid.
   */
  saveLocalFile(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }
    // Multer automatically saves the file to `dest` and assigns `filename`
    // The filename is unique by default (hash + original extension)
    const fileName = file.filename;
    // Construct the public URL for the file
    const fileUrl = `${this.baseUrl}/uploads/${fileName}`; // Assuming '/uploads' static route
    return fileUrl;
  }

  /**
   * Deletes a local file given its URL.
   * This is important for cleanup when a profile photo is updated or a student is deleted.
   * @param fileUrl The URL of the file to delete.
   */
  deleteLocalFile(fileUrl: string): void {
    try {
      const fileName = path.basename(new URL(fileUrl).pathname);
      const filePath = path.join(this.uploadsPath, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
      } else {
        console.warn(`Attempted to delete non-existent file: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting local file ${fileUrl}: ${error.message}`);
      // In a production app, you might log this more robustly or use a dedicated error handling service.
    }
  }
}