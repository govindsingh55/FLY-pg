import type { StorageProvider } from './index';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

/**
 * S3-compatible Storage Provider
 * Works with AWS S3, Cloudflare R2 (via S3 API), MinIO, and other S3-compatible services
 */
export class S3StorageProvider implements StorageProvider {
	private client: S3Client;
	private bucket: string;
	private publicUrl: string;

	constructor() {
		this.bucket = env.S3_BUCKET || '';
		this.publicUrl = env.R2_PUBLIC_URL || env.S3_PUBLIC_URL || '';

		this.client = new S3Client({
			region: env.S3_REGION || 'auto',
			endpoint: env.S3_ENDPOINT,
			credentials: {
				accessKeyId: env.S3_ACCESS_KEY || '',
				secretAccessKey: env.S3_SECRET_KEY || ''
			}
		});
	}

	async upload(file: File | Blob, fileName: string): Promise<string> {
		const timestamp = Date.now();
		const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: safeFileName,
				Body: buffer,
				ContentType: file.type || 'application/octet-stream'
			})
		);

		// Return public URL if configured, otherwise construct from bucket
		if (this.publicUrl) {
			return `${this.publicUrl}/${safeFileName}`;
		}
		return `https://${this.bucket}.s3.amazonaws.com/${safeFileName}`;
	}

	async delete(url: string): Promise<void> {
		const fileName = url.split('/').pop();
		if (!fileName) return;

		await this.client.send(
			new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: fileName
			})
		);
	}
}
