
module.exports = {
	sdk: 'https://mvp-dev.stars-mine.com/service-api',
	platform: 'eth',
	env: 'dev',
	contracts: {
		ERC721: '0xb57C79944EE0E33F24E90213AD6E4D04CE4d2ED7',
		ERC1155: '0x88B48F654c30e99bc2e4A1559b4Dcf1aD93FA656',
		// ERC721Proxy: '0x8c51a0B1Fe8995E7f5b968b0e9b1AD4f50b91B68', // old eth 721 proxy 
		// ERC1155Proxy: '0xf5c7c334257e4F2514Ab34DD1620Bc8B9d4911B8', // old eth 1155 proxy 
		ERC721Proxy: '0xD7697b54A2285F859b373a6A7990e1B89810DC4B', // eth 721 proxy
		ERC1155Proxy: '0x23e58Cef10Fdd4CAb805F167b8FC64fedc27F6BE', // eth 1155 proxy
		ERC721Proxy_MATIC: '0xFAC173DCbd94b8b4Fd956889E5fac080281102Ac', // matic 721 proxy
		ERC1155Proxy_MATIC: '0x6c9021d6A182A8CdCd312df52b9E1E97Cd3d3E2c', // matic 1155 proxy
	},
}