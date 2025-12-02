import { BackendMethod, remult, Allow } from 'remult';
import { File } from './s2filesEntities';

// Lazy import server-only functions to avoid importing server code in browser bundle
async function getS3Client() {
  const { getS3Client: getClient } = await import('./server/index');
  return getClient();
}

async function generateUUID(): Promise<string> {
  const { generateFileUUID } = await import('./server/index');
  return generateFileUUID();
}

export class S2FilesController {
  @BackendMethod({ allowed: Allow.authenticated })
  static async upload(
    filename: string,
    mimeType: string,
    fileData: string // base64 encoded file data
  ): Promise<File> {
    if (!remult.authenticated()) {
      throw new Error('Authentication required');
    }

    const s3Client = await getS3Client();
    const fileRepo = remult.repo(File);

    // Generate unique S3 key
    const fileExtension = filename.split('.').pop() || '';
    const uuid = await generateUUID();
    const s3Key = `files/${uuid}.${fileExtension}`;

    try {
      // Decode base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');

      // Upload to S3
      await s3Client.write(s3Key, buffer);

      // Save metadata to database
      const fileEntity = await fileRepo.save({
        filename,
        key: s3Key,
        mimeType,
        size: buffer.length,
        uploadedBy: remult.user!.id,
      } as File);

      return fileEntity;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async delete(id: string): Promise<void> {
    if (!remult.authenticated()) {
      throw new Error('Authentication required');
    }

    const s3Client = await getS3Client();
    const fileRepo = remult.repo(File);

    // Find file
    const file = await fileRepo.findId(id);
    if (!file) {
      throw new Error('File not found');
    }

    // Check permissions: admin or file owner
    const isAdmin = remult.user?.roles?.includes('S2Files.Admin') || remult.user?.roles?.includes('admin');
    const isOwner = file.uploadedBy === remult.user?.id;

    if (!isAdmin && !isOwner) {
      throw new Error('Permission denied: You can only delete your own files or must be an admin');
    }

    try {
      // Delete from S3
      await s3Client.delete(file.key);

      // Delete from database
      await fileRepo.delete(file);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async findById(id: string): Promise<File | undefined> {
    if (!remult.authenticated()) {
      throw new Error('Authentication required');
    }

    const fileRepo = remult.repo(File);
    const file = await fileRepo.findId(id);
    return file ?? undefined;
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async listAll(searchQuery?: string): Promise<File[]> {
    if (!remult.authenticated()) {
      throw new Error('Authentication required');
    }

    const fileRepo = remult.repo(File);

    if (searchQuery) {
      return await fileRepo.find({
        where: {
          filename: { $contains: searchQuery },
        },
      });
    }

    return await fileRepo.find();
  }
}

