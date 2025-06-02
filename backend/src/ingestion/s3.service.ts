import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Object, S3ListResult } from './interfaces/s3-object.interface';
import { Readable } from 'stream';
import * as zlib from 'zlib';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const awsConfig = this.configService.get('aws');
    
    this.s3Client = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
      ...(awsConfig.s3.endpoint && { endpoint: awsConfig.s3.endpoint }),
      ...(awsConfig.s3.forcePathStyle && { forcePathStyle: awsConfig.s3.forcePathStyle }),
    });

    this.bucketName = awsConfig.s3.bucketName;
    
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }

    this.logger.log(`S3Service initialized for bucket: ${this.bucketName}`);
  }

  /**
   * Lists all objects in the S3 bucket with optional prefix filtering
   */
  async listObjects(prefix?: string, maxKeys?: number): Promise<S3ListResult> {
    try {
      this.logger.log(`Listing objects in bucket ${this.bucketName} with prefix: ${prefix}`);
      
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000,
      });

      const response = await this.s3Client.send(command);
      
      const objects: S3Object[] = (response.Contents || []).map(item => ({
        key: item.Key!,
        lastModified: item.LastModified!,
        size: item.Size!,
        bucket: this.bucketName,
      }));

      this.logger.log(`Found ${objects.length} objects`);

      return {
        objects,
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
      };
    } catch (error) {
      this.logger.error(`Failed to list objects: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lists objects with pagination support
   */
  async listObjectsPaginated(
    prefix?: string, 
    continuationToken?: string,
    maxKeys?: number
  ): Promise<S3ListResult> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000,
        ContinuationToken: continuationToken,
      });

      const response = await this.s3Client.send(command);
      
      const objects: S3Object[] = (response.Contents || []).map(item => ({
        key: item.Key!,
        lastModified: item.LastModified!,
        size: item.Size!,
        bucket: this.bucketName,
      }));

      return {
        objects,
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
      };
    } catch (error) {
      this.logger.error(`Failed to list objects with pagination: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Downloads an object from S3 and returns its content as string
   */
  async downloadObject(key: string): Promise<string> {
    try {
      this.logger.log(`Downloading object: ${key}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error(`No body returned for object ${key}`);
      }

      // Convert Node.js stream to string
      const content = await this.streamToString(response.Body as Readable, key);
      
      this.logger.log(`Successfully downloaded object ${key}, size: ${content.length} bytes`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to download object ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Downloads an object and returns it as a stream for large files
   */
  async downloadObjectAsStream(key: string): Promise<Readable> {
    try {
      this.logger.log(`Downloading object as stream: ${key}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error(`No body returned for object ${key}`);
      }

      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Failed to download object stream ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Gets metadata for a specific object
   */
  async getObjectMetadata(key: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get object metadata ${key}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Utility method to convert a Node.js stream to string with gzip support
   */
  private async streamToString(stream: Readable, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      // Check if the file is gzipped
      const isGzipped = key.endsWith('.gz');
      
      let processStream = stream;
      
      if (isGzipped) {
        // Create gunzip stream for compressed files
        processStream = stream.pipe(zlib.createGunzip());
      }
      
      processStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      processStream.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const content = buffer.toString('utf8');
          resolve(content);
        } catch (error) {
          reject(new Error(`Failed to convert stream to string: ${error.message}`));
        }
      });
      
      processStream.on('error', (error) => {
        reject(new Error(`Stream error: ${error.message}`));
      });
      
      // Handle errors on the original stream too
      stream.on('error', (error) => {
        reject(new Error(`Original stream error: ${error.message}`));
      });
    });
  }
} 