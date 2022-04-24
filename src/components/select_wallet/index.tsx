
import { React } from 'webpkit/mobile';
// import NavPage from '../../nav';
import { Modal } from 'antd-mobile';
import { ModalProps } from 'antd-mobile/lib/modal/Modal';
import IconFont from '../icon_font';
import "./index.scss";
import native from '../../../wallet/util/prefix_native';
const { useState, useEffect } = React;

interface ISelectWalletProps extends ModalProps {
	modalOk?: (currKey: string) => void
}

const SelectWallet = (props: ISelectWalletProps) => {

	const [visible, setvisible] = useState<boolean>(props.visible);

	const [currKey, setcurrKey] = useState<string>('');

	const [keysName, setkeysName] = useState<string[]>([]);

	const { modalOk, onClose, ...rest } = props;

	useEffect(() => {
		getKeysName();
	}, []);

	useEffect(() => {
		setvisible(props.visible);
	}, [props.visible]);

	const getKeysName = async () => {
		let keysName = await native.getKeysName('',true) || [];
		setkeysName(keysName);
	}

	const walletModalOk = () => {
		modalOk && modalOk(currKey);
	}

	return <Modal
		transparent
		title={'选择管理密钥'}
		closable
		className="select_wallet_box"
		footer={[
			{
				text: '取消', onPress: () => {
					setvisible(false);
					onClose && onClose()
				}
			},
			{ text: '确定', onPress: walletModalOk }
		]}
		{...rest}
		visible={visible}
		onClose={() => {
			setvisible(false);
			onClose && onClose();
		}}
	>
		{keysName.map(key => {
			return <div key={key} className={`wallet_item ${currKey == key && 'active'}`} onClick={() => setcurrKey(key == currKey ? '' : key)}>
				<IconFont type="icon-qianbao" />
				<div className="name">{key}</div>
			</div>
		})}

	</Modal>
}

export default SelectWallet;