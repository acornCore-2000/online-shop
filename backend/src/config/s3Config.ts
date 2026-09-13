import AWS from "aws-sdk";
import { fileTypeFromBuffer } from "file-type";

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true,
  region: process.env.S3_REGION_CODE,
});

export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  folder: string = "avatars",
) => {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME is not defined");
  }
  const type = await fileTypeFromBuffer(file);

  if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type.mime)) {
    throw new Error("Invalid image file");
  }

  const key = `${folder}/avatar${Date.now()}-${type.ext}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file,
    ContentType: type.mime,
    ACL: "public-read",
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      key,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const deleteFromS3 = async (key: string) => {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME is not defined");
  }

  try {
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    throw error;
  }
};

export default s3;
