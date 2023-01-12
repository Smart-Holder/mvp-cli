import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';
import { getScreenSettings, screenVolume } from '../../models/device';
import Loading from '../../../deps/webpkit/lib/loading';
import { Slider } from 'antd';

import './index.scss';

class AudioSetting extends NavPage<{ address: string, env: string }> {

	state = {
		volume: 0,
		dsq_id: 0
	}

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ volume, env }) => {
			let unit = env.includes('t982') ? 20 : 3;
			volume = volume / unit;

			this.setState({ volume });
		}).catch((err: any) => {
			alert(err.message);
		}).finally(() => l.close());
	}

	sliderChange(e: number) {


		let { address, env } = this.params;
		let unit = env.includes('t982') ? 20 : 3;
		let volume = e * unit;
		let { dsq_id } = this.state;
		// let dsq_id = 0;
		clearTimeout(dsq_id);
		let newDsqId = setTimeout(() => {
			screenVolume(address, { volume, volumeScale: ((100 / 5) * e) / 100 });
		}, 500);
		this.setState({ volume: e, dsq_id: newDsqId });

	}

	render() {
		let { t } = this;
		let { volume } = this.state;
		return <div className="audio_page">
			<Header title={t("音量")} page={this} />

			<div className="setting_box">

				<div className="setting_title">{t("调整音量")}</div>

				<div className="card_box">


					<div className="bottom_part">
						<img className="voice_low_img" src={require('../../assets/voice_low.png')} />
						<div className="slider_box">
							<Slider trackStyle={{ background: 'linear-gradient(-89deg, #3076F5, #5DB7F7)', height: '.1rem' }} handleStyle={{ backgroundColor: '#fff', border: 0, boxShadow: '0px 5px 32px 0px #131212' }} max={5} min={0} value={volume} dots step={1} onChange={this.sliderChange.bind(this)} />
						</div>
						<img className="voice_height_img" src={require('../../assets/voice_high.png')} />
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(AudioSetting);
