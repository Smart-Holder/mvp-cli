
import router from '../src/router';

export default [
	{
		path: '/login',
		page: () => import('../src/pages/wallet/login'),
	},
	...router,
];
