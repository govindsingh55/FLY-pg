import type { PageServerLoad } from './$types';
import { getHomeData } from '../home.remote';

export const load: PageServerLoad = async () => {
	const homeData = await getHomeData();

	// Always return properties array for list page
	return {
		properties: homeData.mode === 'multiple' ? homeData.properties : [homeData.property]
	};
};
