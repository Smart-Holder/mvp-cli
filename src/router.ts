
export default [
	// {
	// 	path: '/',
	// 	page: () => import('./pages/nft'),
	// },



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
