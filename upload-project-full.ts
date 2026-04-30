import { S3Storage } from "coze-coding-dev-sdk";
import { readFileSync } from "fs";

async function uploadProject() {
  console.log("正在初始化对象存储...");
  
  const storage = new S3Storage({
    endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
    accessKey: "",
    secretKey: "",
    bucketName: process.env.COZE_BUCKET_NAME,
    region: "cn-beijing",
  });

  console.log("正在读取打包文件...");
  const fileContent = readFileSync("/workspace/enterprise-project-full.tar.gz");
  
  console.log("正在上传到对象存储...");
  const fileKey = await storage.uploadFile({
    fileContent,
    fileName: "enterprise-project-full.tar.gz",
    contentType: "application/gzip",
  });

  console.log("上传成功！文件Key:", fileKey);
  
  console.log("正在生成下载链接...");
  const downloadUrl = await storage.generatePresignedUrl({
    key: fileKey,
    expireTime: 86400 * 7, // 7天有效期
  });

  console.log("\n✅ 上传成功！");
  console.log("📦 文件名: enterprise-project-full.tar.gz");
  console.log("📏 文件大小: 1.8 MB");
  console.log("🔗 下载链接:", downloadUrl);
  console.log("\n⚠️  链接有效期: 7天");
  console.log("📋 说明: 包含完整的Next.js项目代码（含数据库功能）");
}

uploadProject().catch(console.error);
