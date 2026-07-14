import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { join } from 'path';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { db, schema } from '../../database/database';

const { documents } = schema;

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Upload a file: save to disk and persist metadata in the database
   */
  async upload(
    file: Express.Multer.File,
    userId: string,
    consultationId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Determine the relative URL path for the file
    const url = `/uploads/${file.filename}`;

    await db.insert(documents).values({
      id,
      user_id: userId,
      consultation_id: consultationId ?? null,
      filename: file.filename,
      original_name: file.originalname,
      url,
      mime_type: file.mimetype,
      size: file.size,
      type: 'general',
      created_at: now,
    });

    this.logger.log(
      `File uploaded: ${id} (${file.originalname}) by user ${userId}`,
    );

    return {
      id,
      user_id: userId,
      consultation_id: consultationId ?? null,
      filename: file.filename,
      original_name: file.originalname,
      url,
      mime_type: file.mimetype,
      size: file.size,
      type: 'general',
      created_at: now,
    };
  }

  /**
   * Delete a file: remove from disk and database (owner only)
   */
  async delete(fileId: string, userId: string) {
    const result = await db
      .select({
        id: documents.id,
        user_id: documents.user_id,
        filename: documents.filename,
        url: documents.url,
      })
      .from(documents)
      .where(eq(documents.id, fileId))
      .limit(1);

    if (!result.length) {
      throw new NotFoundException('File not found');
    }

    const doc = result[0];

    // Ensure the user owns the file
    if (doc.user_id !== userId) {
      throw new BadRequestException('You can only delete your own files');
    }

    // Remove file from disk
    const filePath = join(this.uploadDir, doc.filename);
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (err) {
      this.logger.warn(
        `Could not delete file from disk: ${filePath} (${(err as Error).message})`,
      );
    }

    // Remove record from database
    await db.delete(documents).where(eq(documents.id, fileId));

    this.logger.log(`File deleted: ${fileId} by user ${userId}`);

    return { success: true, message: 'File deleted successfully' };
  }
}
