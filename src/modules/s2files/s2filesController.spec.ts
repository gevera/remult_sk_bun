import { describe, it, expect, beforeEach, vi } from 'vitest';
import { remult, InMemoryDataProvider } from 'remult';
import { S2FilesController } from './s2filesController';

// Mock Bun S3Client
const mockS3Client = {
  write: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
};

const mockS3Presign = vi.fn();

vi.mock('bun', () => ({
  S3Client: vi.fn().mockImplementation(() => mockS3Client),
  s3: {
    presign: mockS3Presign,
  },
}));

// Mock the S3 client helper
vi.mock('./server/index', () => ({
  getS3Client: vi.fn(() => mockS3Client),
  generateFileUUID: vi.fn(() => 'test-uuid'),
}));

// Mock crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-uuid'),
}));

describe('S2FilesController', () => {
  const mockFileRepo = {
    save: vi.fn(),
    findId: vi.fn(),
    find: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configure Remult with in-memory data provider for tests
    // This allows @BackendMethod methods to execute directly without HTTP calls
    remult.dataProvider = new InMemoryDataProvider();
    
    // Mock the repository methods
    vi.spyOn(remult, 'repo').mockReturnValue(mockFileRepo as any);
    vi.spyOn(remult, 'authenticated').mockReturnValue(true);
    remult.user = { id: 'user-id', name: 'Test User', roles: [] };
  });

  describe('upload', () => {
    it('should upload a file successfully and save metadata to database', async () => {
      // Arrange
      const filename = 'test.txt';
      const mimeType = 'text/plain';
      const fileData = Buffer.from('test content').toString('base64');
      const savedFile = {
        id: 'test-id',
        filename: 'test.txt',
        mimeType: 'text/plain',
        key: 'files/test-uuid.txt',
        size: 12,
        uploadedBy: 'user-id',
      };
      
      mockFileRepo.save.mockResolvedValue(savedFile);
      mockS3Client.write.mockResolvedValue(undefined);

      // Act - Call the method directly (bypassing Remult HTTP layer for unit tests)
      // In a real scenario, this would be called via remult.call() or directly from the server
      const result = await S2FilesController.upload(filename, mimeType, fileData);

      // Assert
      expect(mockS3Client.write).toHaveBeenCalledWith(
        expect.stringContaining('files/'),
        expect.any(Buffer)
      );
      expect(mockFileRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'test.txt',
          mimeType: 'text/plain',
          uploadedBy: 'user-id',
        })
      );
      expect(result).toEqual(savedFile);
    });

    it('should require signed-in user', async () => {
      // Arrange
      vi.spyOn(remult, 'authenticated').mockReturnValue(false);

      // Act & Assert
      await expect(
        S2FilesController.upload('test.txt', 'text/plain', 'dGVzdA==')
      ).rejects.toThrow('Authentication required');
    });

    it('should handle S3 upload errors', async () => {
      // Arrange
      mockS3Client.write.mockRejectedValue(new Error('S3 error'));

      // Act & Assert
      await expect(
        S2FilesController.upload('test.txt', 'text/plain', 'dGVzdA==')
      ).rejects.toThrow('S3 error');
    });
  });

  describe('delete', () => {
    it('should delete a file from S3 and database', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        key: 'test-key',
        uploadedBy: 'user-id',
      };
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      mockFileRepo.delete.mockResolvedValue(undefined);
      mockS3Client.delete.mockResolvedValue(undefined);

      // Act
      await S2FilesController.delete(fileId);

      // Assert
      expect(mockFileRepo.findId).toHaveBeenCalledWith(fileId);
      expect(mockS3Client.delete).toHaveBeenCalledWith('test-key');
      expect(mockFileRepo.delete).toHaveBeenCalledWith(mockFile);
    });

    it('should require admin role or file owner', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        key: 'test-key',
        uploadedBy: 'other-user-id',
      };
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      remult.user = { id: 'user-id', name: 'Test User', roles: [] };

      // Act & Assert
      await expect(S2FilesController.delete(fileId)).rejects.toThrow('Permission denied');
    });

    it('should allow admin to delete any file', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        key: 'test-key',
        uploadedBy: 'other-user-id',
      };
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      mockFileRepo.delete.mockResolvedValue(undefined);
      mockS3Client.delete.mockResolvedValue(undefined);
      remult.user = { id: 'admin-id', name: 'Admin', roles: ['admin'] };

      // Act
      await S2FilesController.delete(fileId);

      // Assert
      expect(mockS3Client.delete).toHaveBeenCalled();
      expect(mockFileRepo.delete).toHaveBeenCalled();
    });

    it('should throw error if file not found', async () => {
      // Arrange
      const fileId = 'non-existent-id';
      mockFileRepo.findId.mockResolvedValue(undefined);

      // Act & Assert
      await expect(S2FilesController.delete(fileId)).rejects.toThrow('File not found');
    });
  });

  describe('findById', () => {
    it('should find a file by ID', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        filename: 'test.txt',
        key: 'test-key',
        mimeType: 'text/plain',
        size: 100,
      };
      
      mockFileRepo.findId.mockResolvedValue(mockFile);

      // Act
      const result = await S2FilesController.findById(fileId);

      // Assert
      expect(mockFileRepo.findId).toHaveBeenCalledWith(fileId);
      expect(result).toEqual(mockFile);
    });

    it('should require signed-in user', async () => {
      // Arrange
      const fileId = 'test-id';
      vi.spyOn(remult, 'authenticated').mockReturnValue(false);

      // Act & Assert
      await expect(S2FilesController.findById(fileId)).rejects.toThrow('Authentication required');
    });

    it('should return undefined if file not found', async () => {
      // Arrange
      const fileId = 'non-existent-id';
      mockFileRepo.findId.mockResolvedValue(null);

      // Act
      const result = await S2FilesController.findById(fileId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('listAll', () => {
    it('should list all files', async () => {
      // Arrange
      const mockFiles = [
        { id: '1', filename: 'file1.txt' },
        { id: '2', filename: 'file2.txt' },
      ];
      
      mockFileRepo.find.mockResolvedValue(mockFiles);

      // Act
      const result = await S2FilesController.listAll();

      // Assert
      expect(mockFileRepo.find).toHaveBeenCalled();
      expect(result).toEqual(mockFiles);
    });

    it('should support filtering by search query', async () => {
      // Arrange
      const searchQuery = 'test';
      const mockFiles = [{ id: '1', filename: 'test.txt' }];
      
      mockFileRepo.find.mockResolvedValue(mockFiles);

      // Act
      const result = await S2FilesController.listAll(searchQuery);

      // Assert
      expect(mockFileRepo.find).toHaveBeenCalledWith({
        where: {
          filename: { $contains: 'test' },
        },
      });
      expect(result).toEqual(mockFiles);
    });

    it('should require signed-in user', async () => {
      // Arrange
      vi.spyOn(remult, 'authenticated').mockReturnValue(false);

      // Act & Assert
      await expect(S2FilesController.listAll()).rejects.toThrow('Authentication required');
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate presigned URL for valid file', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        filename: 'test.txt',
        key: 'files/test-uuid.txt',
        mimeType: 'text/plain',
        size: 100,
      };
      const expectedPresignedUrl = 'https://example.com/presigned-url?signature=abc123';
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      mockS3Presign.mockReturnValue(expectedPresignedUrl);

      // Act
      const result = await S2FilesController.getDownloadUrl(fileId);

      // Assert
      expect(mockFileRepo.findId).toHaveBeenCalledWith(fileId);
      expect(mockS3Presign).toHaveBeenCalledWith('files/test-uuid.txt', {
        expiresIn: 3600,
        method: 'GET',
      });
      expect(result).toBe(expectedPresignedUrl);
    });

    it('should require signed-in user', async () => {
      // Arrange
      const fileId = 'test-id';
      vi.spyOn(remult, 'authenticated').mockReturnValue(false);

      // Act & Assert
      await expect(S2FilesController.getDownloadUrl(fileId)).rejects.toThrow('Authentication required');
    });

    it('should throw error if file not found', async () => {
      // Arrange
      const fileId = 'non-existent-id';
      mockFileRepo.findId.mockResolvedValue(null);

      // Act & Assert
      await expect(S2FilesController.getDownloadUrl(fileId)).rejects.toThrow('File not found');
    });

    it('should use correct S3 key from file entity', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        filename: 'document.pdf',
        key: 'files/custom-key.pdf',
        mimeType: 'application/pdf',
        size: 5000,
      };
      const expectedPresignedUrl = 'https://example.com/presigned-url';
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      mockS3Presign.mockReturnValue(expectedPresignedUrl);

      // Act
      await S2FilesController.getDownloadUrl(fileId);

      // Assert
      expect(mockS3Presign).toHaveBeenCalledWith('files/custom-key.pdf', {
        expiresIn: 3600,
        method: 'GET',
      });
    });

    it('should handle S3 presigning errors', async () => {
      // Arrange
      const fileId = 'test-id';
      const mockFile = {
        id: fileId,
        filename: 'test.txt',
        key: 'files/test-uuid.txt',
        mimeType: 'text/plain',
        size: 100,
      };
      
      mockFileRepo.findId.mockResolvedValue(mockFile);
      mockS3Presign.mockImplementation(() => {
        throw new Error('S3 presigning error');
      });

      // Act & Assert
      await expect(S2FilesController.getDownloadUrl(fileId)).rejects.toThrow('Failed to generate download URL');
    });
  });
});
