import { withTranslation } from 'react-i18next';
import { React } from 'webpkit/mobile';
import NavPage from '../../nav';
import Header from '../../util/header';

import './index.scss';
import Button from '../../components/button';
import { checkVersion, upgradeVersion } from '../../models/device';

class UpdateSetting extends NavPage<{ address: string }> {


	state = {
		hasNewAction: false,
		hasNewLoading: false,
		hasNew: false
	}

	// 检查版本更新
	async checkDeviceVersion() {
		this.setState({ hasNewLoading: true });
		checkVersion(this.params.address).then((res) => {
			this.setState({ hasNewAction: true, hasNew: res.hasNew, hasNewLoading: false });
			res.upgrading && alert(this.t('设备升级中...'));
		});
	}

	// 设置弹框中的按钮点击
	async settingModalClick() {
		let { address } = this.params;
		let { hasNew } = this.state;
		if (hasNew) {
			await upgradeVersion(address, true);
		} else {
			upgradeVersion(address, false);
		}
		this.setState({ settingModalVisible: false, hasNewAction: false });
	}

	render() {
		let { t } = this;
		let { hasNewAction, hasNewLoading, hasNew } = this.state;
		return <div className="update_page">
			<Header title={t("更新检查")} page={this} />

			<div className="setting_box">

				<div className="setting_title">
				{/* {t("检查版本更新")} */}
				</div>

				<div className="card_box">


					<div className="bottom_part">

						<div className="label">
						{/* {t("检测版本")} */}
						</div>
						<div className="action">

							{hasNewAction ?
								<Button loading={hasNewLoading} className={String(hasNew && 'hasNew')} ghost type="primary" onClick={this.settingModalClick.bind(this)}> {hasNew ? t('发现新版本') : t('已经是最新版本了')}</Button> :
								<Button loading={hasNewLoading} ghost type="primary" onClick={this.checkDeviceVersion.bind(this)} > {t("点击检查版本更新")}</Button>
							}	{/* <Button ghost type="primary" onClick={this.checkDeviceVersion.bind(this)}>{t("检查版本更新")}</Button> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	}
}

export default withTranslation('translations', { withRef: true })(UpdateSetting);
