import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileStorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get('S3_REGION'),
      endpoint: config.get('S3_ENDPOINT'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadFile(buffer: Buffer, contentType: string, key: string) {
    const command = new PutObjectCommand({
      Bucket: this.config.get<string>('S3_BUCKET'),
      Key: key,
      ACL: 'public-read',
      Body: buffer,
      ContentType: contentType,
    });
    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    return `${this.config.get('S3_VIRTUAL_HOST')}${key}`;
  }

  async deleteStoredFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.get<string>('S3_BUCKET'),
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async deleteMultipleFiles(...keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.config.get<string>('S3_BUCKET'),
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
      },
    });

    await this.s3Client.send(command);
  }
}
