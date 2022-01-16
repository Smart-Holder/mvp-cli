
module.exports = {
	host: 'https://mvp.stars-mine.com',
	sdk: 'https://mvp.stars-mine.com/service-api',
	platform: 'eth',
	env: 'prod',
	defaultNetwork: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
	contracts: {
		ETHEREUM_ERC721Proxy: '0xA9764A2A4AE8E772275f8bc75E8AA7d74e1E4525',
		ETHEREUM_ERC1155Proxy: '0xA532D68894B6d61b86F0807c5C24aA649d92Bd25',
		MATIC_ERC721Proxy: '0xf5c7c334257e4F2514Ab34DD1620Bc8B9d4911B8',
		MATIC_ERC1155Proxy: '0x8c51a0B1Fe8995E7f5b968b0e9b1AD4f50b91B68',
		MUMBAI_ERC721Proxy: '0xFAC173DCbd94b8b4Fd956889E5fac080281102Ac',
		MUMBAI_ERC1155Proxy: '0x6c9021d6A182A8CdCd312df52b9E1E97Cd3d3E2c',
		RINKEBY_ERC721Proxy: '0xD7697b54A2285F859b373a6A7990e1B89810DC4B',
		RINKEBY_ERC1155Proxy: '0x23e58Cef10Fdd4CAb805F167b8FC64fedc27F6BE',
	},
	app: {
		name: "mvp-cli",
		displayName: "MVP Dapp",
	},
}