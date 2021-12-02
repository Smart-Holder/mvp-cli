
import { React, Nav } from 'webpkit/mobile';
import { ViewController } from 'webpkit/lib/ctr';
import IconFont from '../components/icon_font';
import "./tools.scss"
import { NFT } from '../models';

export default class extends ViewController<{ nav: () => Nav }> {
	state = {
		current: 0
	}

	m_click_1 = () => {
		this.setState({ current: 0 });
		this.props.nav().replace('/device', false, 0);
	};
	m_click_2 = () => {
		this.setState({ current: 1 });
		this.props.nav().replace('/my', false, 0);
	};


	render() {
		// console.log(location.pathname, "this.props");
		let { current } = this.state;
		return (
			<div className="_tools">
				<div className="btn" onClick={this.m_click_1}>
					{/* <div className="icon a"></div> */}
					{(current === 0 && location.pathname.startsWith("/device")) ? <IconFont type="icon-shouyexuanzhong" /> : <IconFont type="icon-shouye" />}
					<div className="txt">首页</div>
				</div>
				<div className="btn" onClick={this.m_click_2}>
					{/* <div className="icon b"></div> */}
					{(current === 1 || location.pathname.startsWith("/my")) ? <IconFont type="icon-wodexuanzhong" /> : <IconFont type="icon-wode" />}
					<div className="txt">我的</div>
				</div>
			</div>
		);
	}
}

export type IDisabledType = 'draw' | 'transfer';

// 设置记录当前nft 存入设备操作时间
export const setNftDisabledTime = (nft: NFT, type: IDisabledType) => {
	let nftDisabledTimeStr = localStorage.getItem('nftDisabledTime');
	let nftDisabledTime: { [key: string]: { date: string, type: IDisabledType } } = nftDisabledTimeStr ? JSON.parse(nftDisabledTimeStr) : {};
	nftDisabledTime[nft.tokenId] = { date: String(Date.now()), type };
	localStorage.setItem('nftDisabledTime', JSON.stringify(nftDisabledTime));
}


