import { Device } from "../../models"
import * as device from '../../models/device';
import Button from "../button";
import { React } from 'webpkit/mobile';
import { show } from "../../../deps/webpkit/lib/dialog";
import { copyText, getSubStr } from "../../util/tools";
import { useTranslation } from 'react-i18next';
import { alert } from '../../util/tools'
import "./index.scss";

interface IDeviceItemProps {
	deviceInfo: Device;
	showArrow?: boolean;
	showActionBtn?: boolean
	onClick?: () => void;
	onOk?: () => void;
	onUnbindDevice?: () => void;
	loading?: boolean;
	isCopy?: boolean
}

export const DeviceItem = (props: IDeviceItemProps) => {
	const { deviceInfo, showArrow = true, onClick, showActionBtn = false, onOk, onUnbindDevice, loading, isCopy = true } = props;
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

	return <div className={`device_item  ${showActionBtn && 'device_info_box'}`} onClick={onClick && onClick}>
		{/* {showArrow && <img className="right_arrow" src={require("../../assets/right_arrow.png")} alt=">" />} */}
		<div className={`device_desc_box`}>
			<div className="desc_box">
				<div className="top_part">
					<div className="left_box">
						<img src={(deviceInfo).screen <= 1 ? require('../../assets/device2.png') : require('../../assets/device1.png')} alt="" />
					</div>
					<div className="right_box">
						<div className="sn_box">
							<div className="sn_title">SN</div>
							<div className="sn" onClick={() => {
								isCopy && copyText(deviceInfo.sn);
							}}>{(deviceInfo.sn)}</div>
						</div>
						<div className="address_box">
							<div className="address_title">Address</div>
							<div className="address" onClick={() => {
								isCopy && copyText(deviceInfo.address);
							}}>{getSubStr(deviceInfo.address, 10)}</div>
						</div>
					</div>
				</div>

				<div className="arrow_box">
					{showArrow && <img className="right_arrow" src={require("../../assets/right_arrow.png")} alt=">" />}
				</div>
			</div>

			<div className="bottom_part">
				<div className="nft_title">NFT</div>
				<div className="nft_price">{deviceInfo.assetCount || (deviceInfo as any).nft || 0}</div>
			</div>

		</div>

		{showActionBtn && <div className="action_btn_box">
			<Button loading={loading} ghost className="unbind_btn" onClick={unbind_device}>{t('解绑设备')}</Button>
			<Button disabled={loading} type="primary" className="setting_btn" onClick={onOk} >{t('设置')}</Button>
		</div>}
	</div>
}