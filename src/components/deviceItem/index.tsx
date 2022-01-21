import { Device } from "../../models"
import * as device from '../../models/device';
import Button from "../button";
import { React } from 'webpkit/mobile';
import { show, alert } from "../../../deps/webpkit/lib/dialog";
import { getSubStr } from "../../util/tools";
import { useTranslation } from 'react-i18next';
import "./index.scss";

interface IDeviceItemProps {
	deviceInfo: Device;
	showArrow?: boolean;
	showActionBtn?: boolean
	onClick?: () => void;
	onOk?: () => void;
	onUnbindDevice?: () => void;
	loading?: boolean
}

export const DeviceItem = (props: IDeviceItemProps) => {
	const { deviceInfo, showArrow = true, onClick, showActionBtn = false, onOk, onUnbindDevice, loading } = props;
	const { t } = useTranslation();
	// 解绑设备按钮点击
	const unbind_device = () => {
		if (onUnbindDevice) {
			onUnbindDevice();
		} else {
			let cancel = t('取消');
			let confim = t('确认解绑');
			show({
				id: 'bind_device', title: t("是否解绑设备"), text: t("请确认是否解绑设备，确认则解除对设备解绑。"), buttons: {
					[cancel]: () => { }, ['@' + confim]: async () => {
						await device.unbind(deviceInfo.address);
						alert(t('解绑设备成功'), () => window.history.back());
					}
				}
			});
		}

	}

	return <div className="device_item" onClick={onClick && onClick}>
		{showArrow && <img className="right_arrow" src={require("../../assets/right_arrow.png")} alt=">" />}
		<div className="device_desc_box" >
			{(deviceInfo as any).key && <div className="wallet_name">{(deviceInfo as any).key}</div>}
			<div className="top_part">
				<div className="left_box">
					<img src={(deviceInfo).screen <= 1 ? require('../../assets/screen_icon.jpg') : require('../../assets/test_device.png')} alt="" />
				</div>
				<div className="right_box">
					<div className="sn_box">
						<div className="sn_title">SN</div>
						<div className="sn">{(deviceInfo.sn)}</div>
					</div>
					<div className="address_box">
						<div className="address_title">Address</div>
						<div className="address">{getSubStr(deviceInfo.address)}</div>
					</div>
				</div>
			</div>
			<div className="bottom_part">
				{/* <div className="nft_count_box"> */}
					<div className="nft_title">NFT</div>
					<div className="nft_price">{deviceInfo.assetCount || (deviceInfo as any).nft || 0}</div>
				{/* </div> */}
				{/* <div className="wallet_box">
					<div className="nft_title">所属钱包</div>
					<div className="nft_price">{(deviceInfo as any).key}</div>
				</div> */}
			</div>
		</div>

		{showActionBtn && <div className="action_btn_box">
			<Button loading={loading} ghost className="unbind_btn" onClick={unbind_device}>{t('解绑设备')}</Button>
			<Button disabled={loading} type="primary" className="setting_btn" onClick={onOk} >{t('设置')}</Button>
		</div>}
	</div>
}