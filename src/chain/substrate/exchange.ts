
import * as ex from '../exchange';
import user from './user';
import vp from './vote_pool';
import substrate, {decodeParameters} from '.';

export class ApiIMPL implements ex.APIExchange {

	contractAddress = '';

	private async _assetOf(token: string, tokenId: bigint, orderId?: bigint) {
		var nftid = Number(tokenId);
		var nft = (await substrate.query.nfts(nftid)).toJSON() as any;
		var {title,url,desc} = nft;
		var [category,flags] = desc && desc.substr(0,2) == '0x' ? decodeParameters(['uint16', 'uint16', 'uint256'], '0x' + desc): [0,0];
		var owner = (await substrate.query.nftAccount(nftid)).toJSON() as any;
		return {
			tokenURI: url,
			asset: {
				owner: owner,
				artist: 'None',
				status: orderId === undefined ? ex.AssetStatus.List: ex.AssetStatus.Selling,
				category: Number(category),
				flags: Number(flags),
				name: title,
				lastOrderId: BigInt(0),
				lastDealOrderId: BigInt(0),
				arrayIndex: BigInt(0),
			},
		}
	}

	async _assetSellingOf(token: string, tokenId: bigint, orderId?: bigint, order?: ex.SellStore, totalVotes?: bigint): Promise<ex.NFTAsset> {
		var {asset,tokenURI} = await this._assetOf(token, tokenId, orderId);
		var r: ex.NFTAsset = {
			asset: asset,
			token: token,
			tokenId: tokenId,
			tokenURI: tokenURI,
			selling: orderId === undefined ? undefined: {
				orderId: orderId,
				totalVotes: totalVotes !== undefined ? totalVotes: await vp.orderTotalVotes(orderId),
				order: order ? order: await this.bids(orderId),
			},
		};
		return r;
	}

	async assetSellingOf(token: string, tokenId: bigint): Promise<ex.NFTAsset> {
		var nftid = Number(tokenId);
		var orderId = (await substrate.query.nftOrder(nftid)).toJSON() as any;
		var r: ex.NFTAsset = await this._assetSellingOf(token, tokenId, orderId === null ? undefined: orderId);
		return r;
	}

	// 返回当前拍卖排名最高的101个
	async getNFT101(): Promise<ex.NFTAsset[]> {
		var keys = await substrate.query.orders.keys();
		var nfts = [] as ex.NFTAsset[];
		var count = 0;
		for (var key of keys) {
			if (count < 101) {
				var orderId = BigInt(Number((key.toHuman() as any)[0]));
				var order = await this.bids(orderId);
				var {token, tokenId} = order;
				var totalVotes = await vp.orderTotalVotes(orderId);
				if (totalVotes) {
					nfts.push(await this._assetSellingOf(String(token), tokenId, orderId, order, totalVotes));
				}
			} else {
				break;
			}
			count++;
		}
		return nfts.sort((a, b)=>Number((b.selling as any).totalVotes - (a.selling as any).totalVotes));
	}

	// 返回我的资产列表
	async myNFTs(): Promise<ex.NFTAsset[]> {
		var address = user.addressNoJump();
		var nftids = await substrate.query.nftAccount.keys();
		var nfts = [] as ex.NFTAsset[];
		for (var id of nftids) {
			var nftid_ = Number((id.toHuman() as any)[0]);
			var account = await substrate.query.nftAccount(nftid_);
			if (account.toJSON() == address) {
				nfts.push(await this.assetSellingOf(this.contractAddress, BigInt(nftid_)));
			}
		}
		return nfts;
	}

	// 订单信息
	async bids(orderId: bigint): Promise<ex.SellStore> {
		var order = (await substrate.query.orders(Number(orderId))).toJSON() as any;
		var bid = (await substrate.query.bids(Number(orderId))).toJSON() as any;
		var buyPrice = BigInt(0);
		var bigBuyer = '';
		if (bid) {
			buyPrice = BigInt(bid.price);
			bigBuyer = bid.owner;
		}
		return {
			token: this.contractAddress,
			tokenId: BigInt(order.nft_id),
			minSellPrice: BigInt(order.start_price) * BigInt(1e6),
			maxSellPrice: BigInt(order.end_price) * BigInt(1e6),
			lifespan: BigInt(Math.round(order.keep_block_num * 6 / 24 / 3600)), // day
			expiry: BigInt(order.keep_block_num + order.create_block), // 需要转换为时间
			expiryBlock: order.keep_block_num + order.create_block,
			buyPrice: BigInt(buyPrice) * BigInt(1e6),
			bigBuyer: bigBuyer,
		};
	}

	// 拍卖资产
	async sell(order: ex.SellOrder): Promise<{ token: string; tokenId: bigint; seller: string; orderId: bigint }> {
		var address = await user.address();
		var nft_id = Number(order.tokenId);
		var start_price = Number(order.minSellPrice) / 1e6;
		var end_price = Number(order.maxSellPrice) / 1e6;
		var keep_block_num = Number(order.lifespan) * 24 * 3600 / 6;

		var minimumPrice = substrate.consts.minimumPrice;
		console.log('MinimumPrice', minimumPrice.toJSON());

		var [[, order_id]] = await substrate.methods.orderSell(nft_id, start_price, end_price, keep_block_num).post('OrderSell');

		return {
			token: this.contractAddress,
			tokenId: order.tokenId,
			seller: address,
			orderId: BigInt(order_id),
		};
	}

	// 拍卖出价
	async buy(orderId: bigint, price: bigint): Promise<{ buyer: string; orderId: bigint; price: bigint }> {
		var address = await user.address();
		await substrate.methods.orderBuy(Number(orderId), Number(price) / 1e6).post();
		return {
			buyer: address,
			orderId: orderId,
			price: price,
		};
	}

	// 历史购买记录
	historyBuys(orderId: bigint): Promise<ex.BuyRecord[]> {
		return Promise.resolve([]);
	}

	// 尝试结束一个拍卖订单
	async tryEndBid(orderId: bigint): Promise<{ orderId: bigint; winner: string; price: bigint; } | null> {
		var order = await this.bids(orderId);
		var [e] = await substrate.methods.orderSettlement(Number(orderId)).post('OrderComplete');
		return e ? {// OrderComplete
			orderId,
			winner: e[0],
			price: BigInt(order.buyPrice) * BigInt(1e6),
		}: {// OrderCancel
			orderId,
			winner: '',
			price:BigInt(0),
		};
	}

	// 查看订单状态
	async orderStatus(orderId: bigint): Promise<ex.OrderStatus> {
		var order = await this.bids(orderId);
		if (order.buyPrice >= order.maxSellPrice) {
			return ex.OrderStatus.DealDone;
		} else {
			var currentBlockNumber = (await substrate.api.derive.chain.bestNumberFinalized()).toBigInt();
			if (currentBlockNumber > order.expiryBlock) {
				return ex.OrderStatus.Expired;
			}
		}
		return ex.OrderStatus.Ing;
	}

	// 查看资产信息
	async assetOf(token: string, tokenId: bigint): Promise<ex.Asset> {
		var nftid = Number(tokenId);
		var orderId = (await substrate.query.nftOrder(nftid)).toJSON() as any;
		return (await this._assetOf(token, tokenId, orderId)).asset;
	}

}

export default new ApiIMPL;