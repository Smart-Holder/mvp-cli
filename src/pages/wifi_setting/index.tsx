import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';
import { screenWiFi } from '../../models/device';

import './index.scss';
import Button from '../../components/button';

class Wifi extends NavPage<{ address: string }> {

	state = {
		volume: 0,
		dsq_id: 0
	}

	async openWifiModal() {
		await screenWiFi(this.params.address);
	}

	render() {
		let { t } = this;
		return <div className="audio_page">
			<Header title={t("WIFI设置")} page={this} />

			<div className="setting_box">

				<div className="setting_title">
					{/* {t("wifi")} */}
				</div>

				<div className="card_box">

					<div className="bottom_part">
						<div className="label">{t("开启wifi设置")}</div>
						<div className="action"> <Button onClick={() => this.openWifiModal()}>{t("唤起WIFI")}</Button> </div>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(Wifi);
