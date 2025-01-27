import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2Output
} from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FileStorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    this.s3Client = new S3Client({
      region: config.get("S3_REGION"),
      endpoint: config.get("S3_ENDPOINT"),
      credentials: {
        accessKeyId: config.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: config.get("AWS_SECRET_ACCESS_KEY")
      }
    });
  }

  async uploadFile(buffer: Buffer, contentType: string, key: string) {
    const command = new PutObjectCommand({
      Bucket: this.config.get<string>("S3_BUCKET"),
      Key: key,
      ACL: "public-read",
      Body: buffer,
      ContentType: contentType
    });
    await this.s3Client.send(command);
  }

  /**
   * Retrieves all the keys of the files stored in the S3 bucket.
   * Note: it’s retrieved by chunks of 1000 files at a time.
   *
   * @returns {Promise<string[]>} An array of strings representing the keys of the files stored in the S3 bucket.
   */
  async getAllFileKeys() {
    let allFiles = [];
    let shouldContinue = true;
    let nextContinuationToken = null;
    let command = null;
    while (shouldContinue) {
      command = new ListObjectsV2Command({
        Bucket: this.config.get<string>("S3_BUCKET"),
        ContinuationToken: nextContinuationToken || undefined
      });

      const res: ListObjectsV2Output = await (<ListObjectsV2Output>(
        this.s3Client.send(command)
      ));
      if (!res.Contents?.length) {
        break;
      }
      allFiles = [...allFiles, ...res.Contents];
      if (res.IsTruncated) {
        nextContinuationToken = res.NextContinuationToken;
      } else {
        shouldContinue = false;
        nextContinuationToken = null;
      }
    }
    return allFiles.map((e) => e.Key);
  }

  getPublicUrl(key: string): string {
    return `${this.config.get("FRONT_BASE_URL")}/${key}}`;
  }

  async deleteStoredFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.config.get<string>("S3_BUCKET"),
      Key: key
    });

    await this.s3Client.send(command);
  }

  async deleteMultipleFiles(...keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.config.get<string>("S3_BUCKET"),
      Delete: {
        Objects: keys.map((Key) => ({ Key }))
      }
    });

    await this.s3Client.send(command);
  }

  async duplicateMultipleFiles(
    duplications: { originalKey: string; destinationKey: string }[]
  ) {
    await Promise.all(
      duplications
        .map(
          (d) =>
            new CopyObjectCommand({
              Bucket: this.config.get<string>("S3_BUCKET"),
              CopySource: encodeURIComponent(
                `/${this.config.get<string>("S3_BUCKET")}/${d.originalKey}`
              ),
              Key: d.destinationKey,
              ACL: "public-read"
            })
        )
        .map((command) => this.s3Client.send(command))
    );
  }
}
