//import adapter from '@sveltejs/adapter-auto';
//import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		//adapter: adapter(),
		adapter: adapter({ out: './build' }),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
			resolve: {
				browser: true,
				dedupe: ['svelte', '@fullcalendar/common']
			},
			optimizeDeps: {
				include: ['@fullcalendar/common']
			}
		}
	}
};

export default config;
