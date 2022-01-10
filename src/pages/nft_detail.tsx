import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import index, { AssetOrder, chainTraits, NFT } from '../models';
import { Image, Spin } from 'antd';
import { Tabs } from 'antd-mobile';

import { copyText, getSubStr, unitLabel } from '../util/tools';
import { withTranslation } from 'react-i18next';
// import moment from "moment";

import '../css/nft_detail.scss';
const moment = require('moment');

class NftDetail extends NavPage<{ token: string, tokenId: string }> {

	state = {
		nft: {} as NFT,
		nftOrderList: [] as AssetOrder[],
		tabsCurrent: 0,
		loading: true
	}

	tabsConfig = [
		{ title: this.t('基本信息'), index: 0 }, { title: this.t('交易历史'), index: 1 }, { title: this.t('NFT介绍'), index: 2 }
	];


	async triggerLoad() {
		let { token, tokenId } = this.params;
		let data = await index.nft.methods.getNFT({ token, tokenId });
		let orderData = await index.utils.methods.assetOrders({ token, tokenId });
		this.setState({ nft: data[0], nftOrderList: orderData, loading: false });

	}

	render() {
		let { t } = this;
		let { nft, nftOrderList, loading } = this.state;
		return <div className='nft_detail_page'>
			<Header title={t("NFT详情")} page={this} />

			<div className="nft_detail_page_card_box">
				<Spin spinning={loading}>

					<div className="nft_detail_page_card">
						<div className="nft_card">
							<div className="nft_info_box">
								{Boolean(nft.tokenId) && <div className="nft_img_box">
									{Boolean(Number(nft.count) > 1) && <div className="nft_count">{nft.count}</div>}
									{nft.media?.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image}></video> : <Image width='100%' src={nft.image} alt="loading" placeholder={
										<Image
											preview={false}
											src={`${nft.image}?imageMogr2/thumbnail/!200x200r/blur/3x5`}
											width='100%'
										/>
									} />}
								</div>}

								<Tabs tabBarActiveTextColor={'#1677ff'} tabs={this.tabsConfig}
									initialPage={0}
								>
									<div className="item_page" >
										<div className="nft_address_box">
											<div className="nft_address_title">Token ID</div>
											<div className="nft_address textNoWrap" onClick={() => {
												copyText(nft.tokenId);
											}}>{getSubStr(nft.tokenId, 18)}</div>
										</div>

										<div className="nft_address_box">
											<div className="nft_hash_title">Address</div>
											<div className="nft_hash textNoWrap" onClick={() => {
												copyText(nft.token);
											}}>{getSubStr(nft.token, 18)}</div>
										</div>

										<div className="nft_address_box">
											<div className="nft_hash_title">{t("元数据")}</div>
											<div className="nft_hash textNoWrap" onClick={() => {
												copyText(nft.uri);
											}}>{getSubStr(nft.uri, 22)}</div>
										</div>

									</div>
									<div className="item_page" >
										{nftOrderList.map(item => {
											let { fromAddres, value, toAddress, date } = item;
											// let 
											let unit = (chainTraits as any)[unitLabel[String(nft?.chain)]][2]
											return <div className="order_item" key={item.id}>

												<div className='order_row'>
													<div className="label letter_space">{t("事件")}</div>
													<div className="value">{t(fromAddres ? "购买" : "上架")}</div>
												</div>

												<div className='order_row'>
													<div className="label letter_space">{t("价格")}</div>
													<div className="value">{Number(value) / Math.pow(10, 18)} {unit}</div>
												</div>

												<div className='order_row'>
													<div className="label">{t("发送方")}</div>
													<div className="value textNoWrap">{fromAddres}</div>
												</div>

												<div className='order_row'>
													<div className="label">{t("接收方")}</div>
													<div className="value textNoWrap">{toAddress}</div>
												</div>

												<div className='order_row'>
													<div className="label letter_space">{t("日期")}</div>
													<div className="value">{moment(date).fromNow()}</div>
												</div>
											</div>
										})}

									</div>
									<div className="item_page">
										<div className="nft_info_box" dangerouslySetInnerHTML={{ __html: nft.info }}></div>
									</div>
								</Tabs>
							</div>
						</div>
					</div>
				</Spin>
			</div>

		</div>
	}
};

export default withTranslation('translations', { withRef: true })(NftDetail);