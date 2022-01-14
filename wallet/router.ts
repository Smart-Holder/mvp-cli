
import router from '../src/router';

export default [
	{
		path: '/home',
		page: () => import('./pages/home'),
	},
	{
		path: '/account',
		page: () => import('./pages/account'),
	},
	{
		path: '/',
		page: () => import('./pages/login'),
	},
	{
		path: '/login',
		page: () => import('./pages/login'),
	},
	{
		path: '/safety_tips',
		page: () => import('./pages/safety_tips'),
	},
	{
		path: '/create_account',
		page: () => import('./pages/create_account'),
	},
	{
		path: '/secretkey',
		page: () => import('./pages/secret_key'),
	},
	{
		path: '/import_secret_key',
		page: () => import('./pages/import_secret_key'),
	},
	{
		path: '/register',
		page: () => import('./pages/register'),
	},
	...router,
];
