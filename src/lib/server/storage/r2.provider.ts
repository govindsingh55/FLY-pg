import type { StorageProvider } from './index';

/**
 * R2 Storage Provider for Cloudflare Workers
 * Uses the R2 bucket binding directly (no AWS SDK needed in Workers)
 */
export class R2StorageProvider implements StorageProvider {
	private bucket: R2Bucket;
	private publicUrl: string;

	constructor(bucket: R2Bucket, publicUrl: string) {
		this.bucket = bucket;
		this.publicUrl = publicUrl;
	}

	async upload(file: File | Blob, fileName: string): Promise<string> {
		const timestamp = Date.now();
		const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

		const arrayBuffer = await file.arrayBuffer();

		await this.bucket.put(safeFileName, arrayBuffer, {
			httpMetadata: {
				contentType: file.type || 'application/octet-stream'
			}
		});

		return `${this.publicUrl}/${safeFileName}`;
	}

	async delete(url: string): Promise<void> {
		const fileName = url.split('/').pop();
		if (!fileName) return;

		await this.bucket.delete(fileName);
	}
}
