export interface S3Object {
  key: string;
  lastModified: Date;
  size: number;
  bucket: string;
}

export interface S3ListResult {
  objects: S3Object[];
  isTruncated: boolean;
  nextContinuationToken?: string;
} 