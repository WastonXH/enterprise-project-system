import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";

async function uploadProjectFiles() {
  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: "",
    secretKey: "",
    bucketName: process.env.COZE_BUCKET_NAME,
    region: "cn-beijing",
  });

  // 读取打包文件
  const fileContent = readFileSync("/workspace/projects/public/project-files.tar.gz");
  
  console.log("正在上传文件...");
  
  // 上传文件
  const key = await storage.uploadFile({
    fileContent: fileContent,
    fileName: "project-files.tar.gz",
    contentType: "application/gzip",
  });
  
  console.log("上传成功！文件 key:", key);
  
  // 生成预签名 URL（有效期 7 天）
  const signedUrl = await storage.generatePresignedUrl({
    key: key,
    expireTime: 604800, // 7 天
  });
  
  console.log("\n========================================");
  console.log("📥 下载链接（有效期 7 天）：");
  console.log(signedUrl);
  console.log("========================================\n");
}

uploadProjectFiles().catch(console.error);
