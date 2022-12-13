import client from './s3-client';
import {
  GetBucketAclCommand,
  GetObjectAclCommand,
  // GetObjectAclCommand,
  GetObjectCommand,
  PutObjectAclCommand,
  // ListBucketsCommand,
  // PutObjectAclCommand,
} from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { writeFile } from 'node:fs/promises';

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-environment.html
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-node-examples.html

const BUCKET_NAME = 'confiture-container-prod';
const FILE_NAME = 'city.jpg';

(async () => {
  try {
    // const data = await client.send(new ListBucketsCommand({}));

    // const data = await client.send(
    //   new GetObjectCommand({
    //     Bucket: BUCKET_NAME,
    //     Key: FILE_NAME,
    //   }),
    // );
    // const fileBytes = await data.Body.transformToByteArray();
    // await writeFile(FILE_NAME, fileBytes);
    // console.log('Data saved locally ✅');

    // const command = new GetObjectCommand({
    //   Bucket: BUCKET_NAME,
    //   Key: FILE_NAME,
    // });
    // const signedUrl = await getSignedUrl(client, command);
    // console.log('🚀 ~ file: test-s3.ts:27 ~ signedUrl', signedUrl);

    // const data = await client.send(
    //   new GetObjectAclCommand({
    //     Bucket: BUCKET_NAME,
    //     Key: FILE_NAME,
    //   }),
    // );
    // console.log('Success', data.Grants);

    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/s3-example-access-permissions.html
    const data = await client.send(
      new PutObjectAclCommand({
        Bucket: BUCKET_NAME,
        Key: FILE_NAME,
        ACL: 'public-read',
      }),
    );
    console.log('Success', data);
  } catch (e) {
    console.log('ERROR', e);
  }
  return;
})();
