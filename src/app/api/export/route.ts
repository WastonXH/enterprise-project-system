import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { readFileSync } from 'fs';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    if (action === 'download') {
      // 从对象存储读取文件并返回下载链接
      const key = searchParams.get('key');
      if (!key) {
        return NextResponse.json({ error: '缺少文件 key' }, { status: 400 });
      }
      
      const downloadUrl = await storage.generatePresignedUrl({
        key: key,
        expireTime: 3600, // 1小时有效
      });
      
      return NextResponse.json({ downloadUrl });
    }
    
    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('导出错误:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'export') {
      // 创建项目压缩包并上传
      const { execSync } = await import('child_process');
      
      // 创建 tar.gz 压缩包
      const tarFile = '/tmp/project_export.tar.gz';
      execSync(`cd /workspace && tar --exclude='projects/node_modules' --exclude='projects/.next' --exclude='projects/.git' --exclude='projects/*.zip' --exclude='projects/*.tar.gz' -czvf ${tarFile} projects 2>/dev/null`);
      
      // 读取文件
      const fileBuffer = readFileSync(tarFile);
      
      // 上传到对象存储
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `exports/project-${timestamp}.tar.gz`;
      
      const key = await storage.uploadFile({
        fileContent: fileBuffer,
        fileName: fileName,
        contentType: 'application/gzip',
      });
      
      // 生成下载链接
      const downloadUrl = await storage.generatePresignedUrl({
        key: key,
        expireTime: 86400, // 24小时有效
      });
      
      return NextResponse.json({
        success: true,
        key: key,
        fileName: fileName,
        downloadUrl: downloadUrl,
        size: fileBuffer.length,
        expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
      });
    }
    
    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('导出错误:', error);
    return NextResponse.json({ 
      error: '导出失败', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
