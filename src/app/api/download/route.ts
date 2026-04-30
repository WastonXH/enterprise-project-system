import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { createReadStream, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

async function createAndUploadZip(commitHash: string, fileName: string) {
  // 创建临时目录
  const tempDir = `/tmp/${fileName.replace('.zip', '')}`;
  const zipPath = `/tmp/${fileName}`;
  
  // 删除已存在的文件
  try {
    execSync(`rm -rf ${tempDir} ${zipPath}`);
  } catch {}
  
  // 导出指定版本的代码
  execSync(`cd /workspace/projects && git archive --format=zip --prefix=${fileName.replace('.zip', '')}/ ${commitHash} -o ${zipPath}`);
  
  // 读取文件
  const fileStats = statSync(zipPath);
  const fileBuffer = Buffer.alloc(fileStats.size);
  
  const stream = createReadStream(zipPath);
  let offset = 0;
  
  for await (const chunk of stream) {
    chunk.copy(fileBuffer, offset);
    offset += chunk.length;
  }
  
  // 上传到对象存储
  const fileKey = await storage.uploadFile({
    fileContent: fileBuffer,
    fileName: `downloads/${fileName}`,
    contentType: 'application/zip',
  });
  
  // 生成下载链接（7天有效期）
  const downloadUrl = await storage.generatePresignedUrl({
    key: fileKey,
    expireTime: 604800, // 7天
  });
  
  // 清理临时文件
  try {
    execSync(`rm -rf ${tempDir} ${zipPath}`);
  } catch {}
  
  return { downloadUrl, fileSize: fileStats.size };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const version = searchParams.get('version') || 'latest';
    
    let commitHash: string;
    let fileName: string;
    
    if (version === 'latest') {
      // 获取最新提交的 hash
      commitHash = execSync('cd /workspace/projects && git rev-parse HEAD', { encoding: 'utf-8' }).trim();
      // 获取最新的提交信息
      const commitInfo = execSync('cd /workspace/projects && git log -1 --oneline', { encoding: 'utf-8' }).trim();
      fileName = `enterprise-project-system-latest.zip`;
      
      const result = await createAndUploadZip(commitHash, fileName);
      
      return NextResponse.json({
        success: true,
        downloadUrl: result.downloadUrl,
        fileName,
        fileSize: result.fileSize,
        commitHash,
        commitInfo,
        version: 'latest',
      });
    } else if (version === '6b48b3c') {
      fileName = 'enterprise-project-system-6b48b3c.zip';
      // 检查是否已存在
      const existingPath = '/workspace/projects/enterprise-project-system-6b48b3c.zip';
      
      if (existsSync(existingPath)) {
        const fileStats = statSync(existingPath);
        const fileBuffer = Buffer.alloc(fileStats.size);
        
        const stream = createReadStream(existingPath);
        let offset = 0;
        
        for await (const chunk of stream) {
          chunk.copy(fileBuffer, offset);
          offset += chunk.length;
        }
        
        const fileKey = await storage.uploadFile({
          fileContent: fileBuffer,
          fileName: `downloads/${fileName}`,
          contentType: 'application/zip',
        });
        
        const downloadUrl = await storage.generatePresignedUrl({
          key: fileKey,
          expireTime: 604800,
        });
        
        return NextResponse.json({
          success: true,
          downloadUrl,
          fileName,
          fileSize: fileStats.size,
          version: '6b48b3c',
        });
      } else {
        const result = await createAndUploadZip(version, fileName);
        return NextResponse.json({
          success: true,
          downloadUrl: result.downloadUrl,
          fileName,
          fileSize: result.fileSize,
          version,
        });
      }
    } else {
      // 尝试使用给定的版本作为 commit hash
      commitHash = version;
      fileName = `enterprise-project-system-${version.substring(0, 7)}.zip`;
      const result = await createAndUploadZip(commitHash, fileName);
      
      return NextResponse.json({
        success: true,
        downloadUrl: result.downloadUrl,
        fileName,
        fileSize: result.fileSize,
        commitHash,
        version,
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download link', details: String(error) },
      { status: 500 }
    );
  }
}
