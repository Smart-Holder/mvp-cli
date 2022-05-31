import models, { NFT } from "../../models";
import { React, Component } from 'webpkit/mobile';
import { Tabs } from 'antd-mobile';
import { Empty } from 'antd';
import * as device from '../../models/device';

import './index.scss';
import NavPage from "../../nav";
import ImageMogr from "../image_mogr";
import { LoadingOutlined } from '@ant-design/icons';
import chain from "../../chain";

// previewNftCard
interface IPreviewNftCardProps {
	page: NavPage<device.Device>;
	screenWidth?: number;
	screenHeight?: number;

}
class PreviewNftCard extends Component<IPreviewNftCardProps> {
	t = this.props.page.t;

	tabsConfig = [
		{ title: this.t('我的NFT'), index: 0 }, { title: this.t('设备NFT'), index: 1 }
	];
	state = {
		tabs: this.tabsConfig,
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		tabIndex: 0,
		loading: false
	}

	componentDidMount() {
		this.getNftList();
	}

	// 获取nft列表
	async getNftList(list?: NFT[], mode?: number) {
		this.setState({ loading: true, rightNftList: [], leftNftList: [] });
		let { address } = this.props.page.params;
		let { screenWidth, screenHeight } = this.props;
		let owner = await chain.getDefaultAccount();
		let ownerAddress = !mode ? owner : address;
		let nftList: NFT[] = list?.length ? list : await models.nft.methods.getNFTByOwner({
			owner: ownerAddress, screenWidth, screenHeight
		});
		let leftNftList: NFT[] = [];
		let rightNftList: NFT[] = [];
		let videoNftList: NFT[] = [];
		let imgNftList: NFT[] = [];

		nftList.forEach(item => {
			let { image, imageOrigin, media, mediaOrigin } = item;
			if (image && imageOrigin) {
				// item.media.match(/\.mp4/i) ? videoNftList.push(item) : imgNftList.push(item)
				(!item.media.match(/\.mp4/i) && !item.image.match(/\.gif/i)) && imgNftList.push(item)

				// imgNftList.push(item);
			}
		});

		imgNftList.forEach((item, index) => {
			!Boolean(index % 2) ? leftNftList.push(item) : rightNftList.push(item);
		});

		let newState: any = { leftNftList, rightNftList, videoNftList, loading: false };


		this.setState({ ...newState });
		return nftList;
	}

	nftItemClick(nft: NFT) {
		let { screenHeight, screenWidth } = this.props;
		this.props.page.pushPage(`/cropper_nft?id=${nft.id}&screenWidth=${screenWidth}&screenHeight=${screenHeight}&address=${this.props.page.params.address}&token=${nft.token}&tokenId=${nft.tokenId}`);
	}

	rendNftItem(nft: NFT) {
		return <div key={nft.id} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
			{nft.media.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image}></video> :
				<ImageMogr className="nft_img" src={nft.image} nft={nft} /> || <img src={nft.image} alt="" />}
		</div>
	}


	render() {
		let t = this.t;
		let { tabs, leftNftList, rightNftList, loading } = this.state;
		return <div className="setting_card_box pre_nftlist_page">

			<Tabs animated={false} onChange={(e) => {
				// this.setState({ tabIndex: e.index });
				this.getNftList(undefined, e.index);
			}} tabBarActiveTextColor={'#1677ff'} tabs={tabs} initialPage={0}>
				<div className="item_page">
					{leftNftList.length && !loading ? <div className="nft_list">
						<div className="left_box">
							{leftNftList.map(item => this.rendNftItem(item))}
						</div>

						<div className="right_box">
							{rightNftList.map(item => this.rendNftItem(item))}
						</div>
					</div> : !loading && <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../../assets/empty_img.png')} description={t("暂无数字藏品，请添加数字藏品至密钥")} />}

					{loading && <div className="list_loading">
						<LoadingOutlined />
					</div>}
				</div>
				{/* <div>666</div> */}

				{/* <div className="item_page">
					{leftNftList.length ? <div className="nft_list">
						<div className="left_box">
							{leftNftList.map(item => this.rendNftItem(item))}
						</div>

						<div className="right_box">
							{rightNftList.map(item => this.rendNftItem(item))}
						</div>
					</div> : <Empty style={{ marginTop: '2rem', color: '#ccc' }} image={require('../../assets/empty_img.png')} description={t("暂无数字藏品，请添加数字藏品至密钥")} />}
				</div> */}
			</Tabs>
		</div>;
	}

}


export default PreviewNftCard;