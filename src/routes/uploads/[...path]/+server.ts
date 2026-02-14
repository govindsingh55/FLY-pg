import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { existsSync, createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { env } from '$env/dynamic/private';
import { Readable } from 'stream';

const UPLOAD_DIR = env.LOCAL_STORAGE_DIR || join(process.cwd(), 'static', 'uploads');

const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function getMimeType(filePath: string): string {
    const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
}

export const GET: RequestHandler = async ({ params }) => {
    const filePath = join(UPLOAD_DIR, params.path);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(UPLOAD_DIR)) {
        throw error(403, 'Forbidden');
    }

    if (!existsSync(filePath)) {
        throw error(404, 'File not found');
    }

    const fileStat = await stat(filePath);
    const mimeType = getMimeType(filePath);

    const stream = createReadStream(filePath);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new Response(webStream, {
        headers: {
            'Content-Type': mimeType,
            'Content-Length': fileStat.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    });
};
