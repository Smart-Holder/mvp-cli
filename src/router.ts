
export default [
	{
		path: '/',
		page: () => import('./pages/nft'),
	},
	{
		path: '/device_add',
		page: () => import('./pages/device_add'),
	},
	{
		path: '/device_nft',
		page: () => import('./pages/device_nft'),
	},
	{
		path: '/device_set_screen',
		page: () => import('./pages/device_set_screen'),
	},
	{
		path: '/device_set_screen_img',
		page: () => import('./pages/device_set_screen_img'),
	},
	{
		path: '/device_set_screen_time',
		page: () => import('./pages/device_set_screen_time'),
	},
	{
		path: '/device_set',
		page: () => import('./pages/device_set'),
	},
	{
		path: '/device',
		page: () => import('./pages/device'),
	},
	{
		path: '/nft_add',
		page: () => import('./pages/nft_add'),
	},
	{
		path: '/nft_details',
		page: () => import('./pages/nft_details'),
	},
];
