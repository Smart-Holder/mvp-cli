import NavPage from '../../../src/nav';
import { React, ReactDom } from 'webpkit/mobile';
import Button from '../../../src/components/button';
import IconFont from '../../../src/components/icon_font';
import Header from '../../../src/util/header';
import native from '../../util/prefix_native'
import wallet from '../../wallet_ui';
import storage from 'somes/storage';
import "./index.scss";
import { Modal } from 'antd-mobile';
import "../../util/wallet_ui.scss";
import _404 from '../../../src/pages/404';
import routes from '../../router';
import { MyRoot } from '../..';
import { getParams } from '../../util/tools';
// import prefix_native from '../../util/prefix_native'
const operation = Modal.operation;
export interface IAddressListItemProps {
	key: string;
	balance?: string;
	address: string
}


class Home extends NavPage {

	state = {
		addressList: [] as IAddressListItemProps[]
	}

	async triggerLoad() {
		let keysNameArr = await native.getKeysName() || [];
		if (!keysNameArr.length) {
			this.replacePage('/secretkey'); return
		};
		this.getKeyNameList(keysNameArr);
		ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));

	}

	async triggerShow() {
		let keysNameArr = await native.getKeysName() || [];
		this.getKeyNameList(keysNameArr);
	}

	async getKeyNameList(keysNameArr:string[]) {
		// let keyname = await prefix_native.getKeysName()
		// console.log(keyname,"keyname");
		
		// let keysNameArr = await native.getKeysName() || [];
		// let new_wallet = new wallet();
		let addressList = keysNameArr.map(async (key) => {
			let data = await native.getKey(key);
			let address = '0x' + JSON.parse(String(data)).address
			let balance = Number(await wallet.getBalance(address)) / Math.pow(10, 18);
			return { key, balance, address };
		});
		// console.log(addressList,"addressList");
		let newAddressList = await Promise.all(addressList);
		console.log(newAddressList, "newAddressList");

		this.setState({ addressList: newAddressList });
	}

	async deviceList(item: IAddressListItemProps) {
		wallet.setCurrentKey(item.key);
		this.pushPage(`/device?address=${item.address}&keyName=${item.key}`, false);
	}


	async myNft(item: IAddressListItemProps) {
		wallet.setCurrentKey(item.key);
		await storage.set('currAccount', item.address);
		this.pushPage(`/my?address=${item.address}`, false);
	}

	async scanNftInfo() {
		let href = await native.scan();
		if (href?.startsWith('http')) {
			let { token, tokenId } = getParams(href);
			this.pushPage(`/nft_detail?token=${token}&tokenId=${tokenId}`);
		}
	}

	// 密钥地址页面
	walletAddress(item:IAddressListItemProps) {
		this.pushPage(`/wallet_address?address=${item.address}`);
	}

	render() {
		let { addressList } = this.state;
		return <div className="home_page">
			<Header hiddenBtn={true} page={this} title="管理密钥" actionBtn={<IconFont type="icon-saoma" style={{width:'.48rem',height:'.48rem'}} onClick={this.scanNftInfo.bind(this)} />} />

			<div className="wallet_part">

			<img className="wallet_bg" src={require('../../../src/assets/wallet_bg.png')} alt="" />

			<div className="wallet_box">
				<div className="add_wallet" onClick={() => {
					operation([
						{ text: '导入管理密钥', onPress: () => this.pushPage('/import_secret_key'), style: { textAlign: 'center' } },
						{ text: '创建管理密钥', onPress: () => { this.pushPage('/create_account') }, style: { textAlign: 'center' } },
						{ text: '取消', style: { textAlign: 'center', color: '#1677ff' } },
					]);
				}}>
					<IconFont type='icon-chuangjianguanlimiyue' style={{ width: '.48rem', height: '.48rem' }} />
					<span>管理密钥</span>
				</div>
				{addressList.map(item => {
					return <div className="wallet_item" key={item.address}>

						<div className='push_page_part' onClick={() => this.pushPage(`/wallet_setting?key=${(item.key)}`)}>
							<div className="top_part">
								<div className="left_box">
									{item.key}
								</div>
								<div className="right_box"> <IconFont style={{ width: '.36rem', height: '.36rem' }} type='icon-youjiantou' /> </div>
							</div>

							<div className="mid_part">
								<div className="left_box">POWER</div>
								<div className="right_box"> {(String(item.balance).split('.')[1]?.length > 4) ? Number(item.balance).toFixed(4) : item.balance} </div>
							</div>
						</div>

						<div className="bottom_part">
							<div className="left_box">
								<Button className="address_btn" type="link" onClick={this.walletAddress.bind(this, item)} ghost style={{ marginRight: '.24rem' }}>地址</Button>
								<div className="dot_box">
								<div className="dot1"></div>
								<div className="dot2"></div>
								</div>
							</div>
							<div className="right_box">
								<Button type="primary" onClick={this.myNft.bind(this, item)} ghost style={{ marginRight: '.24rem' }}>我的藏品</Button>
								<Button type="primary" onClick={this.deviceList.bind(this, item)}>设备管理</Button>
							</div>
						</div>
					</div>
				})}
			</div>
			</div>

			</div>
	}
}

export default Home;