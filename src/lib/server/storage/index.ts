export interface StorageProvider {
	upload(file: File | Blob, fileName: string): Promise<string>;
	delete(url: string): Promise<void>;
}

import { LocalStorageProvider } from './local.provider';
import { S3StorageProvider } from './s3.provider';
import { R2StorageProvider } from './r2.provider';
import { env } from '$env/dynamic/private';

let localProvider: StorageProvider | null = null;

/**
 * Get storage provider based on environment
 * @param platform - SvelteKit platform (for Cloudflare R2 binding)
 */
export function getStorageProvider(platform?: App.Platform): StorageProvider {
	// Cloudflare Workers with R2 binding
	if (platform?.env?.R2_BUCKET) {
		const publicUrl = env.R2_PUBLIC_URL || '';
		return new R2StorageProvider(platform.env.R2_BUCKET, publicUrl);
	}

	// Local development or Node.js deployment
	if (localProvider) return localProvider;

	const type = env.STORAGE_TYPE || 'local';

	if (type === 's3' || type === 'r2-s3') {
		// S3 or R2 via S3-compatible API (for external access outside Workers)
		localProvider = new S3StorageProvider();
	} else {
		localProvider = new LocalStorageProvider();
	}

	return localProvider;
}

// Legacy export for backward compatibility
export { getStorageProvider as getProvider };

// Create a lazy-loading storage object for backward compatibility
// This works in local dev where platform is not needed
export const storage = getStorageProvider();
