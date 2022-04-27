import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';

import Button from '../../../src/components/button';
import native from '../../util/prefix_native';
import { copyText } from '../../../src/util/tools';
import { confirm ,alert,show} from 'webpkit/lib/dialog';
import buffer, { IBuffer } from 'somes/buffer';

import { inputPasswordModal } from '../../util/tools';
import { decryptPrivateKey } from 'webpkit/deps/crypto-tx/keystore';
import { Modal } from 'antd-mobile';
import "./index.scss";
import models from '../../../src/models';
import { INftItem } from '../../../src/pages/interface';
import { Device, devices } from '../../../src/models/device';

export default class Account extends NavPage<{ key: string }> {

	state = {
		addressInfo: { address: '', key: '' },
		visible:false
	}

	async triggerLoad() {
		let { key } = this.params;
		// key = (key);
		console.log(key);

		let data = await native.getKey(key);
		this.setState({ addressInfo: { address: '0x' + JSON.parse(String(data)).address, key } });
	}

	async myNft() {
		let { address } = this.state.addressInfo;
		this.pushPage(`/my?address=${address}`);
	}

	async deviceList() {
		this.pushPage('/device');
	}

	// 删除事件
	async deleteAddress() {
		let { addressInfo } = this.state;
		let currAddress = addressInfo.address.toUpperCase();
		let nftList: INftItem[] = (await models.nft.methods.getNFTByOwner({ owner: addressInfo.address }));
		let deviceList: Device[] = await devices();
		
		let isHasNft = nftList.length;
		let isHasBindDevice = deviceList.some(item => item.owner?.toUpperCase() === currAddress);
		if (isHasNft || isHasBindDevice) {
			show({
				title: <div><img style={{height:'0.3rem',width:'0.3rem'}} src={require('../../../src/assets/dangerous.png')} alt=""/> 重要提示</div>,
				text: '您的管理秘钥有绑定设备/数字藏品，暂不能删除',
				buttons: {
					'@确定':() => {}
				}
			})
		} else {
			
			confirm('确定删除当前密钥?', async (isOk) => {
				if (isOk) {
					await native.deleteKey(this.params.key);
					this.setState({ visible: false });
					this.popPage();
				};
			});
		}
	}

	// 导出私钥
	async exportSecretKey() {
		let { key } = this.params;
		let keystore = await native.getKey(key);
		let pwd = await inputPasswordModal();
		try {
			let priv = decryptPrivateKey(JSON.parse(String(keystore)), pwd);
			console.log(priv.toString('hex'), "privateKey");
			let hex_priv = `0x` + priv.toString('hex');
			this.pushPage(`/safety_tips?pushUrl=export_secret_key&secret_key=${hex_priv}`);
		} catch (error) {
			throw Error.new('密钥密码输入错误!');
		}
	}


	render() {
		let { addressInfo, visible } = this.state;
		return <div className="wallet_setting_page">
			<Header page={this} title="设置" />
			<div className="account_item">
				<div className="right_box">
					<div className="account_name">{addressInfo.key}</div>
					<div className="account_address_box" onClick={() => copyText(addressInfo.address)}>
						<div className="account_address textNoWrap" >{addressInfo.address}</div>
						<div className="copy_btn"><IconFont style={{ width: '.36rem', height: '.36rem', marginLeft: '.1rem' }} type="icon-fuzhi" /> </div>
					</div>
				</div>
			</div>

			<div className="setting_item" onClick={this.myNft.bind(this)} >
				<div className="setting_title">我的数字收藏品</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="setting_item" onClick={this.exportSecretKey.bind(this)} style={{ marginBottom: '.3rem' }}>
				<div className="setting_title">导出私钥</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="setting_item" onClick={() => this.pushPage(`/wallet_setting_password?key=${this.params.key}&type=modify`)}>
				<div className="setting_title">修改解锁密码</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="setting_item" onClick={() => this.pushPage(`/wallet_setting_password?key=${this.params.key}&type=reset`)}>
				<div className="setting_title">重置解锁密码</div>
				<div className="setting_icon"> <IconFont type="icon-houtui" style={{ width: '.36rem', height: '.36rem' }} /></div>
			</div>

			<div className="btn_box">
				<Button type="primary" className="width_btn" danger onClick={() => this.setState({ visible:true})}>删除管理密钥</Button>
			</div>

			<Modal
				className='remove_modal'
				transparent
				closable
				title={<div><IconFont style={{ color: 'red' }} type='icon-weixian' /> 重要提示</div>}
				visible={visible}
				footer={[
					{ text: '确认删除', onPress: this.deleteAddress.bind(this) },
					{ text: '取消删除', onPress: () => this.setState({ visible:false}) }
				]}
				onClose={() => this.setState({visible:false})}
			>
					
				<div style={{ overflow: 'scroll' }}>
					&nbsp;&nbsp;&nbsp;&nbsp; 删除后该管理密钥将从该APP消失，删除前请妥善保管好您的私钥，<IconFont style={{ color: 'red' ,fontSize:'0.25rem'}} type='icon-weixian' />切勿丢失！
				</div>
			</Modal>
		</div>
	}
}