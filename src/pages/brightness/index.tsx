import { withTranslation } from "react-i18next";
import { React } from "webpkit/mobile";
import NavPage from "../../nav";
import Header from "../../util/header";
import { Slider, Switch } from "antd";
import {
	getScreenSettings,
	screenLight,
	switchAutoLight,
} from "../../models/device";
import "./index.scss";
import Loading from "../../../deps/webpkit/lib/loading";

class AudioSetting extends NavPage<{ address: string; env: string }> {
	state = {
		light: 0,
		dsq_id: 0,
		autoLightLoading: false,
		autoLight: false,
	};

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t("正在加载屏幕设置"));
		// 获取设备当前设置参数
		getScreenSettings(address)
			.then(({ light, switchAutoLight, env }) => {
				let unit = env.includes("t982") ? 20 : 51;
				console.log(light, "light");
				light = parseInt(String(light / unit));
				this.setState({ light, autoLight: switchAutoLight });
			})
			.catch((err: any) => {
				alert(err.message);
			})
			.finally(() => l.close());
	}

	sliderChange(e: number) {
		let { address, env } = this.params;
		let unit = env.includes("t982") ? 20 : 51;
		let light = e * unit;

		let { dsq_id } = this.state;
		// let dsq_id = 0;
		clearTimeout(dsq_id);
		let newDsqId = setTimeout(() => {
			screenLight(address, {
				light: light ? light : 1,
				lightScale: ((100 / 5) * e) / 100,
			});
		}, 500);
		this.setState({ light: e, dsq_id: newDsqId });
	}

	render() {
		let { t } = this;
		let { light, autoLightLoading, autoLight } = this.state;
		return (
			<div className="brightness_page">
				<Header title={t("亮度")} page={this} />

				<div className="setting_box">
					<div className="setting_title">{t("调整亮度")}</div>

					<div className="card_box">
						<div className="top_part">
							<div className="label">{t("开启/关闭自动调整屏幕亮度")}</div>
							<div className="action_box">
								<Switch
									onChange={async (e) => {
										this.setState({ autoLight: e, autoLightLoading: true });
										await switchAutoLight(this.params.address, e);
										this.setState({ autoLightLoading: false });
									}}
									loading={autoLightLoading}
									checked={autoLight}
									checkedChildren={t("开启")}
									unCheckedChildren={t("关闭")}
								/>
							</div>
						</div>

						<div
							className="bottom_part"
							style={{
								visibility: autoLight ? "hidden" : "visible",
								width: "100%",
								textAlign: "center",
							}}
						>
							<img
								className="voice_low_img"
								src={require("../../assets/light_low.png")}
							/>
							<div className="slider_box">
								<Slider
									trackStyle={{
										background: "linear-gradient(-89deg, #3076F5, #5DB7F7)",
										height: ".1rem",
									}}
									handleStyle={{
										backgroundColor: "#fff",
										border: 0,
										boxShadow: "0px 5px 32px 0px #131212",
									}}
									max={5}
									min={0}
									value={light}
									dots
									step={1}
									onChange={this.sliderChange.bind(this)}
								/>
							</div>
							<img
								className="voice_height_img"
								src={require("../../assets/light_high.png")}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withTranslation("translations", { withRef: true })(AudioSetting);
