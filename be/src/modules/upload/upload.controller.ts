import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload
   * Upload a file (multipart form data)
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file',
    description:
      'Uploads a file to the server. Max file size: 10MB. Allowed types: PDF, JPEG, PNG.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The file to upload (PDF, JPEG, PNG)',
        },
      },
    },
  })
  @ApiQuery({
    name: 'consultation_id',
    required: false,
    description: 'Optional consultation ID to link the file to',
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Query('consultation_id') consultationId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.uploadService.upload(
      file,
      user.id ?? user.sub,
      consultationId,
    );

    return {
      success: true,
      data: result,
      message: 'File uploaded successfully',
    };
  }

  /**
   * DELETE /upload/:id
   * Delete an uploaded file (owner only)
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete uploaded file',
    description:
      'Deletes a previously uploaded file from disk and database. Only the file owner can delete.',
  })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.uploadService.delete(id, user.id ?? user.sub);
  }
}
