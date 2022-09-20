import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';
import { getScreenSettings, screenVolume, switchDetails } from '../../models/device';
import Loading from '../../../deps/webpkit/lib/loading';
import { Switch } from 'antd';
import { alert } from '../../util/tools'

import './index.scss';

class DetailSetting extends NavPage<{ address: string }> {

	state = {
		switchLoading: false,
		switchValue: false,

	}

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ switchDetails }) => {
			this.setState({ switchValue: switchDetails });
		}).catch((err: any) => {
			alert(err.message);
		}).finally(() => l.close());
	}


	render() {
		let { t } = this;
		let { switchValue, switchLoading } = this.state;
		return <div className="audio_page">
			<Header title={t("设置NFT信息")} page={this} />

			<div className="setting_box">

				<div className="setting_title">{t("NFT信息")}</div>

				<div className="card_box">
					<div className="bottom_part">
						<div style={{ width: '80%' }}>{t('开关：显示/隐藏NFT信息和详情二维码')}</div>
						<Switch onChange={async (e) => {
							this.setState({ switchValue: e, switchLoading: true });
							await switchDetails(this.params.address, e);
							this.setState({ switchLoading: false });
						}} loading={switchLoading} checked={switchValue} checkedChildren={t("开启")} unCheckedChildren={t("关闭")} />
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(DetailSetting);
