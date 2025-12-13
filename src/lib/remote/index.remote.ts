import { query } from '$app/server';

export const test = query(() => {
	return 'test';
});
