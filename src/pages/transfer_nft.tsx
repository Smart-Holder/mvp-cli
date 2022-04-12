import chain from '../chain';
import NavPage from '../nav';
import { React } from 'webpkit/mobile';
import Header from '../util/header';
import { Input } from 'antd';
import NftCard from '../components/nft_card';
import { INftItem } from './interface';
import models, { AssetType } from '../models';
import Loading from '../../deps/webpkit/lib/loading';
import { show } from '../../deps/webpkit/lib/dialog';
import { alert } from '../util/tools'
import { removeNftDisabledTimeItem, setNftDisabledTime } from '../util/tools';
import erc721 from '../chain/erc721';
import erc1155 from '../chain/erc1155';
import '../css/transfer_nft.scss';
import { withTranslation } from 'react-i18next';
import nft_proxy, { proxyAddress } from '../chain/nftproxy';
import { TextAreaRef } from 'antd/lib/input/TextArea';

const tp = require('tp-js-sdk');

class TransferNft extends NavPage<INftItem> {
	state = { nftItem: this.props.params as INftItem, owner: "", inputToken: '' }

	inputRef = React.createRef<TextAreaRef>();

	async triggerLoad() {
		let owner = await chain.getDefaultAccount(); // '0xD6188Da7d84515ad4327cd29dCA8Adc1B1DABAa3'
		this.getNFTInfo(owner);
		this.setState({ owner });

		models.msg.addEventListener('UpdateNFT', (e) => {
			let data: INftItem = e.data;
			if (!data.ownerBase) {
				console.log(e.data, "--------ws-------");
				removeNftDisabledTimeItem(data, "nftDisabledTime");
			}
		}, this);
	}

	async getNFTInfo(owner: string) {
		let nftList: INftItem[] = await models.nft.methods.getNFTByOwner({ owner });
		let nftItem = this.props.params;
		nftList.forEach(item => item.tokenId === nftItem.tokenId && (nftItem = item));
		this.setState({ nftItem });
	}

	transfer_nft() {
		tp.invokeQRScanner().then((address: string) => {
			// this.transferAction(nft, address);
			this.setState({ inputToken: address });
		});
	}

	async transferAction(nft: INftItem, address: string) {
		const { t } = this;
		var l = await Loading.show(t('正在转移,请勿操作'));
		try {
			if (address.includes(':')) address = address.split(':')[1];
			if (address && address?.startsWith("0x")) {
				setNftDisabledTime(nft, "nftDisabledTime", undefined, 'toWallets');
				await this._transferToWallets(nft, address);
				let btnText = t('我知道了');

				show({
					buttons: { [btnText]: () => { } },
					title: t('NFT存入已发起申请'), text: <div className="transferToDeviceTipBox">
						<div>{t('请耐心等待，交易进行中...请您刷新页面进行获取最新交易进程。')}</div>
						<div className="tip_img_box">

							<div className="tip_img_box_text">{t('请点击页面右下角“…”找到“重新加载”更新该页面')}</div>
							<img src={localStorage.getItem('language') === 'ZH' ? require("../assets/ref_bg.png") : require("../assets/ref_bg_en.jpg")} alt="" />
						</div>
					</div>
				});
				if (this.nav.length > 1) {
					this.popPage();
				} else {
					this.replacePage('/my');
				}
			} else {
				alert(t('请复制或扫码输入钱包地址'), () => this.inputRef.current?.focus());
			}

		} catch (error: any) {
			// window.alert((error.message));
			removeNftDisabledTimeItem(nft, "nftDisabledTime");

			let errorText = error;
			let errorCode = error.msg || error.message || error.description;

			if (error?.code == 4001 || error.errno == -30000) errorText = t('已取消存储操作');
			if (error?.errno == 100400) errorText = error.description;

			(error?.code != 4001 && errorCode !== 'cancel') && (errorText += ' ' + errorCode);

			if (error?.code == -32000) errorText = 'Gas费用不足，请充值';

			let btnText = t('我知道了');
			show({ text: <div className="tip_box"><img className="tip_icon" src={require('../assets/error.jpg')} alt="" /> {t(errorText)}</div>, buttons: { [btnText]: () => { } } });
		} finally {
			l.close();
		}
	}


	async _transferToWallets(nft: INftItem, address: string) {
		const { token, tokenId, ownerBase } = nft;
		const { owner } = this.state;
		return new Promise(async (resolve, reject) => {

			try {
				if (nft.type == AssetType.ERC721) { // erc721
					chain.assetChain(nft.chain, '请切换至对应链的钱包');
					if (ownerBase) {
						await erc721.safeTransferToProxy( // 转移给代理协约
							nft.token, [address], BigInt(nft.tokenId), proxyAddress(AssetType.ERC721, nft.chain));
					} else {
						await erc721.safeTransferFrom(token, owner, address, BigInt(tokenId));
					}
					resolve('');
				} else if (nft.type == AssetType.ERC1155) {
					chain.assetChain(nft.chain, '请切换至对应链的钱包');
					if (ownerBase) {
						await nft_proxy.New(nft.owner, nft.chain)
							.withdraw(address, nft.token, BigInt(nft.tokenId), BigInt(nft.count));
					} else {
						await erc1155.safeTransferFrom(token, owner, address, BigInt(tokenId), BigInt(nft.count));
					}
					resolve('');
				} else {
					// reject(t('暂时不支持这种类型的NFT存入到设备'));
				}
			} catch (error: any) {
				reject(error);
			}
		});

	};

	render() {
		const { t } = this;
		// const nftItem = this.props.params;
		const { nftItem, inputToken } = this.state;

		return <div className="transfer_nft_page">
			<Header title={t("转移NFT")} page={this} />

			<div className="transfer_nft_page_content">
				<div className="transfer_input_card">
					<div className='input_box'>
						<div className="label" >{t("转移到")}: </div>
						<Input.TextArea ref={this.inputRef} required value={inputToken} onChange={(e) => {
							this.setState({ inputToken: e.target.value });
						}} placeholder={t("请复制或扫码输入钱包地址")} allowClear />
						<div><img onClick={this.transfer_nft.bind(this)} src={require('../assets/qr_icon2.png')} /> </div>
					</div>
				</div>

				<div className="nft_card_part">
					<div className="nft_card_part_title">{t('转移内容')}</div>

					<NftCard showTransferBtn={false} key={nftItem.id} btnClick={this.transferAction.bind(this, nftItem, inputToken)} nft={nftItem} btnText={t("下一步")} />
				</div>
			</div>

		</div>;
	}
}

export default withTranslation('translations', { withRef: true })(TransferNft);
