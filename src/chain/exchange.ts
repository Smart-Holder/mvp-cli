
import { Address, Uint256 } from 'web3z/solidity_types';

export interface AssetID {
	token: Address;
	tokenId: Uint256;
}

export interface SellOrder {
	token: Address;
	tokenId: Uint256;
	maxSellPrice: Uint256;
	minSellPrice: Uint256;
	lifespan: Uint256;
}

export enum OrderStatus { Ing, Expired, DealDone }

export interface SellStore {
	token: Address;
	tokenId: Uint256;
	maxSellPrice: Uint256;
	minSellPrice: Uint256;
	lifespan: Uint256;
	expiry: Uint256;
	expiryBlock: Uint256;
	buyPrice: Uint256;
	bigBuyer: Address;
}

export enum AssetStatus {
	List,
	Selling,
}

export interface SellingNFTData {
	orderId: Uint256;
	totalVotes: Uint256;
	order: SellStore;
}

export interface Asset {
	owner: Address;
	artist: Address;
	status: AssetStatus;
	category: number;
	flags: number;
	name: string;
	lastOrderId: Uint256;
	lastDealOrderId: Uint256;
	arrayIndex: Uint256;
}

export interface NFTAsset {
	asset: Asset;
	token: Address;
	tokenId: Uint256;
	tokenURI: string;
	selling?: SellingNFTData;
}

export interface BuyRecord {
	orderId: Uint256;
	price: bigint;
	buyer: Address;
}

export interface APIExchange {

	contractAddress: string;

	assetSellingOf(token: string, tokenId: bigint): Promise<NFTAsset>;

	// 返回当前拍卖排名最高的101个
	getNFT101(): Promise<NFTAsset[]>;

	// 返回我的资产列表
	myNFTs(): Promise<NFTAsset[]>;

	// 订单信息
	bids(orderId: bigint): Promise<SellStore>;

	// 拍卖资产
	sell(order: SellOrder): Promise<{ token: string; tokenId: bigint; seller: string; orderId: bigint }>;

	// 拍卖出价
	buy(orderId: bigint, price: bigint): Promise<{ buyer: string; orderId: bigint; price: bigint }>;

	// 历史购买记录
	historyBuys(orderId: bigint): Promise<BuyRecord[]>;

	// 尝试结束一个拍卖订单
	tryEndBid(orderId: bigint): Promise<{
		orderId: bigint;
		winner: string;
		price: bigint;
	} | null>;

	// 查看订单状态
	orderStatus(orderId: bigint): Promise<OrderStatus>;

	// 查看资产信息
	assetOf(token: string, tokenId: bigint): Promise<Asset>;

}