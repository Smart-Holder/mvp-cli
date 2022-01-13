
export default [
	{
		path: '/',
		page: () => import('./pages/nft'),
	},
	{
		path: '/login',
		page: () => import('./pages/wallet/login'),
	},

	{
		path: '/safety_tips',
		page: () => import('./pages/wallet/safety_tips'),
	},

	{
		path: '/create_account',
		page: () => import('./pages/wallet/create_account'),
	},
	{
		path: '/secretkey',
		page: () => import('./pages/wallet/secret_key'),
	},
	{
		path: '/import_secret_key',
		page: () => import('./pages/wallet/import_secret_key'),
	},
	{
		path: '/register',
		page: () => import('./pages/wallet/register'),
	},
	{
		path: '/device',
		page: () => import('./pages/nft'),
	},
	{
		path: '/transfer_nft',
		page: () => import('./pages/transfer_nft'),
	},
	{
		path: '/nft_detail',
		page: () => import('./pages/nft_detail'),
	},
	{
		path: '/device_set_carousel',
		page: () => import('./pages/device_set_carousel'),
	},
	{
		path: '/my',
		page: () => import('./pages/my'),
	},
	{
		path: '/device_info',
		page: () => import('./pages/device_info'),
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
	// {
	// 	path: '/device',
	// 	page: () => import('./pages/device'),
	// },
	{
		path: '/nft_add',
		page: () => import('./pages/nft_add'),
	},
	{
		path: '/nft_details',
		page: () => import('./pages/nft_details'),
	},
];
