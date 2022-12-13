// Create service client module using ES6 syntax.
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'gra',
  endpoint: 'https://s3.gra.io.cloud.ovh.net/',
});

export default s3Client;
