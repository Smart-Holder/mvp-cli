import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Button from '../../../src/components/button';
import IconFont from '../../../src/components/icon_font';
import Header from '../../../src/util/header';
import native from '../../native'
import wallet from '../../ui_wallet';
import { Modal } from 'antd-mobile';
import storage from "somes/storage";
import { Root, ReactDom, Nav, dialog } from 'webpkit/mobile';
import "./index.scss";
import { MyRoot } from '../../index';
import routes from '../../router';
import _404 from '../../../src/pages/404';

const operation = Modal.operation;

export interface IAddressListItemProps {
	key: string;
	balance?: string;
	address: string
}
ReactDom.render(<MyRoot routes={routes} notFound={_404} />, document.querySelector('#app'));

class Home extends NavPage {

	state = {
		addressList: [] as IAddressListItemProps[]
	}

	async triggerShow() {

		// '0x' + '85657270cEa1B274b51e35527974dEb283e49cc7'
		// let balance = await chain.getBalance('0x' + 'b02cbeD3aC823085CfB1A667Fb1C73E19E724657');
		// console.log(balance,"balance");

		let keysNameArr = await native.getKeysName() || [];
		let new_wallet = new wallet();
		let addressList = keysNameArr.map(async (key) => {
			let data = await native.getKey(key);
			let address = '0x' + JSON.parse(String(data)).address
			let balance = Number(await new_wallet.getBalance(address)) / Math.pow(10, 18);
			return { key, balance, address };
		});
		// console.log(addressList,"addressList");
		let newAddressList = await Promise.all(addressList);
		console.log(newAddressList, "newAddressList");

		this.setState({ addressList: newAddressList });

		// console.log(data, "data");


	}

	async deviceList(item: IAddressListItemProps) {
		this.pushPage('/device');
	}


	async myNft(item: IAddressListItemProps) {
		await storage.set('currAccount', item.address);
		this.pushPage(`/my?address=${item.address}`);
	}

	render() {
		let { addressList } = this.state;
		return <div className="home_page">
			<Header page={this} title="管理密钥" />
			<img className="wallet_bg" src={require('../../../src/assets/wallet_bg.png')} alt="" />

			<div className="wallet_box">
				<div className="add_wallet" onClick={() => {
					operation([
						{ text: '导入管理密码', onPress: () => this.pushPage('/import_secret_key'), style: { textAlign: 'center' } },
						{ text: '创建管理秘钥', onPress: () => { this.pushPage('/create_account') }, style: { textAlign: 'center' } },
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
								<div className="right_box"> {item.balance} </div>
							</div>
						</div>

						<div className="bottom_part">
							<div className="left_box">
								<div className="dot1"></div>
								<div className="dot2"></div>
							</div>
							<div className="right_box">
								<Button size="small" type="primary" onClick={this.myNft.bind(this, item)} ghost style={{ marginRight: '.24rem' }}>我的藏品</Button>
								{/* <Button size="small" type="primary" onClick={this.deviceList.bind(this,item)}>设备管理</Button> */}
							</div>
						</div>
					</div>
				})}
			</div>
		</div>
	}
}

export default Home;