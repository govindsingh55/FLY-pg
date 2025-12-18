import { getHomeData } from './home.remote';

export const load = async () => {
	return await getHomeData();
};
