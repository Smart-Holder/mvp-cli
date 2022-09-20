import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import Loading from '../../../deps/webpkit/lib/loading';
import { getScreenSettings, screenColor } from '../../models/device';
import NavPage from '../../nav';
import Header from '../../util/header';

import './index.scss';

const colorListConfig = [
	{ label: "#000000", color: "#000000" },
	{ label: "#ffffff", color: "#ffffff" },
	{ label: "#e6e6e6", color: "#e6e6e6" },
	{ label: "#dadada", color: "#dadada" },
	{ label: "#cdcdcd", color: "#cdcdcd" },
	{ label: "#c1c1c1", color: "#c1c1c1" },
	{ label: "#b4b4b4", color: "#b4b4b4" },
	{ label: "#a7a7a7", color: "#a7a7a7" },
	{ label: "#9a9a9a", color: "#9a9a9a" },
];

class ColorSetting extends NavPage<{ address: string }> {

	state = {
		currColor: ""
	}

	async triggerLoad() {
		let { address } = this.params;
		let l = await Loading.show(this.t('正在加载屏幕设置'));
		// 获取设备当前设置参数
		getScreenSettings(address).then(({ color }) => {
			this.setState({ currColor: color });
		}).catch((err: any) => {
			alert(err.message);
		}).finally(() => l.close());
	}

	render() {
		let { t } = this;
		let { currColor } = this.state;
		return <div className="color_page">
			<Header title={t("背景颜色")} page={this} />

			<div className="setting_box">

				<div className="setting_title">{t("选择背景颜色")}</div>

				<div className='setting_card_box color_card'>
					{colorListConfig.map(item => {
						return <div key={item.label} className="color_item" onClick={async () => {
							this.setState({ currColor: item.color });
							if (item.color !== currColor) await screenColor(this.params.address, item.color);
						}}>
							<div className="color_bg_item" style={{ backgroundColor: item.color }}></div>
							<div className="color_text">{t(item.label)}</div>
							<div className={`select_btn ${currColor === item.color && 'select_btn_active'}`} />
						</div>
					})}
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(ColorSetting);
