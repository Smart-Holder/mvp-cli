import { NFT } from "../../models";
import { React } from "webpkit/mobile";
import { Tabs } from "antd-mobile";
import { Empty } from "antd";
import * as device from "../../models/device";
import Header from "../../util/header";

import "./index.scss";
import NavPage from "../../nav";
import { LoadingOutlined } from "@ant-design/icons";
import chain from "../../chain";
import InfiniteScroll from "react-infinite-scroll-component";
import { getNFTByOwnerPage, getNFTByOwner } from "../../models/nft";
import { withTranslation } from "react-i18next";
import ImageMogr from "../../components/image_mogr";
import Loading from "../../../deps/webpkit/lib/loading";
import { getScreenSettings } from "../../models/device";

class PreviewNftCard extends NavPage<{ address: string }> {
	tabsConfig = [
		{ title: this.t("我的NFT"), index: 0 },
		{ title: this.t("设备NFT"), index: 1 },
	];
	state = {
		tabs: this.tabsConfig,
		leftNftList: [] as NFT[],
		rightNftList: [] as NFT[],
		tabIndex: 0,
		loading: false,
		mode: 0,
		hasMore: true,
		curPage: 1,
		nftList: [] as NFT[],
		screenWidth: 1920,
		screenHeight: 1080,
	};

	async triggerLoad() {
		let { address } = this.params;

		let l = await Loading.show(this.t("正在加载屏幕设置"));

		// 获取设备当前设置参数
		getScreenSettings(address)
			.then(({ screenHeight, screenWidth }) => {
				this.setState({ screenHeight, screenWidth }, () => {
					this.getNftList(undefined, 0);
				});
			})
			.catch((err: any) => {
				alert(err.message);
			})
			.finally(() => l.close());
	}

	// 获取nft列表
	async getNftList(list?: NFT[], mode?: number) {
		this.setState({ loading: true });
		let { address } = this.params;
		let { screenHeight, screenWidth } = this.state;
		// let { screenWidth, screenHeight } = this.props;

		let owner = await chain.getDefaultAccount();
		let ownerAddress = !mode ? owner : address;
		let { curPage, nftList: preNftList } = this.state;
		let nftList: NFT[] = list?.length
			? list
			: await getNFTByOwnerPage({
					owner: ownerAddress,
					screenWidth,
					screenHeight,
					curPage,
					pageSize: 999,
					address: this.params.address,
			  });
		let leftNftList: NFT[] = [];
		let rightNftList: NFT[] = [];
		let videoNftList: NFT[] = [];
		let imgNftList: NFT[] = [];
		let allNftList: NFT[] = [];
		nftList.forEach((item) => {
			let { image, imageOrigin, media, mediaOrigin } = item;
			if (image && imageOrigin) {
				// item.media.match(/\.mp4/i) ? videoNftList.push(item) : imgNftList.push(item)
				!media.match(/\.mp4/i) && !image.match(/\.gif|svg/i) && imgNftList.push(item);

				// imgNftList.push(item);
			}
		});

		allNftList = [...preNftList, ...imgNftList];

		allNftList.forEach((item, index) => {
			!Boolean(index % 2) ? leftNftList.push(item) : rightNftList.push(item);
		});

		// let hasMore = Boolean((!mode ? imgNftList?.length : nftList?.length) >= 16);
		let hasMore = Boolean(nftList?.length >= 999);

		// console.log(nftList.length, 'nftList', nftList?.length >= 16, hasMore, 'hasMore');

		let newState: any = { leftNftList, rightNftList, videoNftList, loading: false, nftList: allNftList, hasMore };

		this.setState({ ...newState, mode });
		return allNftList;
	}

	nftItemClick(nft: NFT) {
		let { screenHeight, screenWidth } = this.state;
		let { mode } = this.state;
		this.pushPage(`/cropper_nft?id=${nft.id}&mode=${mode}&screenWidth=${screenWidth}&screenHeight=${screenHeight}&address=${this.params.address}&token=${nft.token}&tokenId=${nft.tokenId}`);
	}

	rendNftItem(nft: NFT) {
		return (
			<div key={nft.id} onClick={this.nftItemClick.bind(this, nft)} className="nft_item">
				{nft.media.match(/\.mp4/i) ? <video controls src={nft.media} poster={nft.image||nft.imageOrigin}></video> : <ImageMogr className="nft_img" src={nft.image||nft.imageOrigin} nft={nft} /> || <img src={nft.image||nft.imageOrigin} alt="" />}
			</div>
		);
	}

	// 下拉加载
	loadMoreData() {
		let { curPage, mode } = this.state;
		this.setState({ curPage: curPage + 1 }, () => {
			this.getNftList(undefined, mode);
		});
	}

	render() {
		let t = this.t;
		let { tabs, leftNftList, rightNftList, loading, hasMore, nftList } = this.state;
		let loader = (
			<div className="bottom_box">
				{" "}
				<LoadingOutlined className="loading_icon" />
			</div>
		);

		let endMessage = <div className="bottom_box">{t("已经是全部数据了")}</div>;

		return (
			<div className="setting_card_box pre_nftlist_page">
				<Header title={t("预览设置")} page={this} />

				<div className="nft_list_page">
					<div className="nft_list_box">
						<Tabs
							tabBarBackgroundColor={"transparent"}
							tabBarUnderlineStyle={{ border: 0, height: "3px", background: "linear-gradient(90deg, #4881FA, #6ED6F5)", borderRadius: "3px" }}
							animated={false}
							onChange={(e) => {
								this.setState({ curPage: 1, nftList: [], rightNftList: [], leftNftList: [] }, () => {
									this.getNftList(undefined, e.index);
								});
							}}
							tabBarActiveTextColor={"#1677ff"}
							tabs={tabs}
							initialPage={0}
						>
							<div className="item_page" id="preview_scroll_box">
								<InfiniteScroll key={"preview_scroll_box"} dataLength={nftList.length} next={this.loadMoreData.bind(this)} hasMore={hasMore} loader={loader} endMessage={nftList.length ? endMessage : ""} scrollableTarget={"preview_scroll_box"} scrollThreshold={"300px"}>
									{nftList.length ? (
										<div className="nft_list">
											<div className="left_box">{leftNftList.map((item) => this.rendNftItem(item))}</div>

											<div className="right_box">{rightNftList.map((item) => this.rendNftItem(item))}</div>
										</div>
									) : (
										!loading && <Empty style={{ marginTop: "2rem", color: "#ccc" }} image={require("../../assets/empty_img.png")} description={t("暂无NFT，请添加NFT至设备")} />
									)}
								</InfiniteScroll>
								{/* {loading && <div className="list_loading">
						<LoadingOutlined />
					</div>} */}
							</div>
						</Tabs>
					</div>
				</div>
			</div>
		);
	}
}

// export default PreviewNftCard;
export default withTranslation("translations", { withRef: true })(PreviewNftCard);
