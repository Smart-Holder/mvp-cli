import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';
import { getScreenSettings, } from '../../models/device';
import Loading from '../../../deps/webpkit/lib/loading';
import SetCarousel from '../../components/set_carousel';

import './index.scss';

class ShadowSetting extends NavPage<{ address: string }> {

	state = {
		screenWidth: 1920, screenHeight: 1080, time: 10
	}

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ screenWidth, screenHeight, time }) => {
			this.setState({ screenWidth, screenHeight, time });
		}).catch((err: any) => {
			alert(err.message);
		}).finally(() => l.close());
	}


	render() {
		let { t } = this;
		let { screenWidth, screenHeight, time } = this.state;
		return <div className="shadow_page">
			<Header title={t("投屏")} page={this} />

			<div className="setting_box">


				<div className="device_set_carousel_body">


					<SetCarousel time={time} page={this} mode='shadow' address={this.params.address} screenWidth={screenWidth} screenHeight={screenHeight} />

				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(ShadowSetting);
