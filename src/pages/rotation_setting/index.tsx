import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';
import { screenOrientation, screenWiFi } from '../../models/device';
import { confirm } from '../../util/tools'
import './index.scss';
import Button from '../../components/button';

const rotationConfig = [
	{ label: "向左旋转90°", value: "left", img: ('left') },
	{ label: "旋转180°", value: "reverse", img: ('180') },
	{ label: "向右旋转90°", value: "right", img: ('right') },
];

class Rotation extends NavPage<{ address: string }> {

	state = {
		volume: 0,
		dsq_id: 0,
		currRotation: ''
	}

	async openWifiModal() {
		await screenWiFi(this.params.address);
	}

	render() {
		let { t } = this;
		let { currRotation } = this.state;
		return <div className="rotation_page">
			<Header title={t("设置屏幕角度")} page={this} />

			<div className="setting_box">

				<div className="setting_title">{t("屏幕角度")}</div>

				<div className="card_box">

					<div className="bottom_part">

						<div className="rotation_icon_box">


							{rotationConfig.map(item => {
								return <div key={item.value} className="rotation_item" onClick={() => {
									this.setState({ currRotation: item.value });
								}}>
									<img src={require(`../../assets/${item.img + (currRotation === item.value ? '_active' : '')}.png`)} alt="" />
									<div className="label">{t(item.label)}</div>
								</div>
							})}
						</div>

						<Button type="primary" onClick={() => {
							confirm(t('调整屏幕角度将重启设备，确定调整屏幕角度吗？'), async (isok) => {
								console.log(this.params.address, currRotation, 'this.params.address, currRotation');

								isok && await screenOrientation(this.params.address, currRotation);
							})
						}}>确定</Button>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(Rotation);
