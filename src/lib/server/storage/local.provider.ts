import type { StorageProvider } from './index';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from '$env/dynamic/private';

export class LocalStorageProvider implements StorageProvider {
	private uploadDir: string;
	private publicBaseUrl: string;

	constructor() {
		this.uploadDir = env.LOCAL_STORAGE_DIR || join(process.cwd(), 'static', 'uploads');
		this.publicBaseUrl = env.LOCAL_STORAGE_BASE_URL || '/uploads';

		// We check existsSync in constructor which is fine for init,
		// but we'll ensure mkdir is recursive.
	}

	async upload(file: File | Blob, fileName: string): Promise<string> {
		if (!existsSync(this.uploadDir)) {
			console.log(`[LocalStorage] Creating directory: ${this.uploadDir}`);
			await mkdir(this.uploadDir, { recursive: true });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const timestamp = Date.now();
		const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
		const filePath = join(this.uploadDir, safeFileName);

		await writeFile(filePath, buffer);

		const url = `${this.publicBaseUrl}/${safeFileName}`;
		console.log(`[LocalStorage] Uploaded ${fileName} -> ${url}`);
		return url;
	}

	async delete(url: string): Promise<void> {
		const fileName = url.split('/').pop();
		if (!fileName) return;

		const filePath = join(this.uploadDir, fileName);
		if (existsSync(filePath)) {
			console.log(`[LocalStorage] Deleting: ${filePath}`);
			await unlink(filePath);
		} else {
			console.warn(`[LocalStorage] Not found: ${filePath}`);
		}
	}
}
