import { getPropertyById } from '../../home.remote';

export const load = async (event) => {
	const property = await getPropertyById(event.params.id);
	return { property };
};
