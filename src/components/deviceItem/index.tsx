import { Device } from "../../models"
import Button from "../button";
import { React } from 'webpkit/mobile';

import "./index.scss";

interface IDeviceItemProps {
	deviceInfo: Device;
	showArrow?: boolean;
	showActionBtn?: boolean
	onClick?: () => void;
}

export const DeviceItem = (props: IDeviceItemProps) => {
	const { deviceInfo, showArrow = true, onClick, showActionBtn = false } = props;
	return <div className="device_item" onClick={onClick && onClick}>
		{showArrow && <img className="right_arrow" src={require("../../assets/right_arrow.png")} alt=">" />}
		<div className="device_desc_box" >
			<div className="top_part">
				<div className="left_box">
					<img src={require('../../assets/test_device.png')} alt="" />
				</div>
				<div className="right_box">
					<div className="sn_box">
						<div className="sn_title">SN</div>
						<div className="sn">{deviceInfo.sn}</div>
					</div>
					<div className="address_box">
						<div className="address_title">Address</div>
						<div className="address">{deviceInfo.address}</div>
					</div>
				</div>
			</div>
			<div className="bottom_part">
				<div className="nft_title">NFT</div>
				<div className="nft_price">{deviceInfo.assetCount || (deviceInfo as any).nft || 0}</div>
			</div>
		</div>

		{showActionBtn && <div className="action_btn_box">
			<Button ghost className="unbind_btn">解绑设备</Button>
			<Button type="primary" className="setting_btn" >设置</Button>
		</div>}
	</div>
}