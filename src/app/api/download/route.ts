import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { createReadStream, statSync } from 'fs';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

export async function GET(request: NextRequest) {
  try {
    // 读取压缩包文件
    const filePath = '/workspace/projects/enterprise-project-system-6b48b3c.zip';
    const fileStats = statSync(filePath);
    const fileBuffer = Buffer.alloc(fileStats.size);
    
    const stream = createReadStream(filePath);
    let offset = 0;
    
    for await (const chunk of stream) {
      chunk.copy(fileBuffer, offset);
      offset += chunk.length;
    }
    
    // 上传到对象存储
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: 'downloads/enterprise-project-system-6b48b3c.zip',
      contentType: 'application/zip',
    });
    
    // 生成下载链接（7天有效期）
    const downloadUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 604800, // 7天
    });
    
    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: 'enterprise-project-system-6b48b3c.zip',
      fileSize: fileStats.size,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download link' },
      { status: 500 }
    );
  }
}
