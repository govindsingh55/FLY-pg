import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getMediaType(url: string | null | undefined): 'image' | 'video' {
	if (!url) return 'image';
	// Handle query parameters or fragments if present
	const cleanUrl = url.split('?')[0].split('#')[0];
	const extension = cleanUrl.split('.').pop()?.toLowerCase();
	const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

	if (extension && videoExtensions.includes(extension)) {
		return 'video';
	}
	return 'image';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
