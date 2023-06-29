import { React } from "webpkit/mobile";
import NavPage from "../nav";
import Header from "../util/header";
import "../css/index.scss";
import "../css/device.scss";
import { devices, Device } from "../models/device";

export default class extends NavPage<{ type?: "back" }> {
	title = "设备详情";

	_DeviceAdd = () => {
		this.pushPage("/device_add");
	};

	isBack() {
		return this.params.type == "back";
	}

	_DeviceNft(e: any) {
		if (this.isBack()) {
			this.popPage(true, e);
		} else {
			this.pushPage({ url: "/device_nft", params: e });
		}
	}

	async triggerShow() {
		this.setState({ devices: await devices() });
	}

	state = { devices: [] as Device[] };

	render() {
		return (
			<div className="index device">
				<Header title={this.isBack() ? "选择设备" : "设备详情"} page={this} />
				<div className="list">
					{this.isBack() ? null : (
						<div className="a" onClick={this._DeviceAdd}>
							绑定新设备
						</div>
					)}

					{this.state.devices.map((e, j) => (
						<div className="b" onClick={() => this._DeviceNft(e)} key={j}>
							<div className="more">More...</div>
							<div className="txt1">SN: {e.sn}</div>
							<div className="txt2">Address：{e.address}</div>
							<div className="txt3">
								{e.assetCount}
								<br />
								<span>NFT</span>
							</div>
						</div>
					))}

					{/* 0x137C59F4eb2BcfE409dad6C467Af90459383FA3A&c=7658 */}
					{/* test */}
					{location.href.indexOf("__test") != -1 ? (
						<div
							className="b"
							onClick={(e) =>
								this._DeviceNft({
									sn: "012018116A93CC7946",
									address: "0x137C59F4eb2BcfE409dad6C467Af90459383FA3A",
									user: "",
								})
							}
						>
							<div className="more">More...</div>
							<div className="txt1">SN: 012018116A93CC7946</div>
							<div className="txt2">
								Address：0x137C59F4eb2BcfE409dad6C467Af90459383FA3A
							</div>
							<div className="txt3">
								04
								<br />
								<span>NFT</span>
							</div>
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
