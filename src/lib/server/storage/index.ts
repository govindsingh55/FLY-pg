export interface StorageProvider {
	upload(file: File | Blob, fileName: string): Promise<string>;
	delete(url: string): Promise<void>;
}

import { LocalStorageProvider } from './local.provider';
import { S3StorageProvider } from './s3.provider';
import { env } from '$env/dynamic/private';

let provider: StorageProvider;

export function getStorageProvider(): StorageProvider {
	if (provider) return provider;

	const type = env.STORAGE_TYPE || 'local';

	if (type === 's3') {
		provider = new S3StorageProvider();
	} else {
		provider = new LocalStorageProvider();
	}

	return provider;
}
