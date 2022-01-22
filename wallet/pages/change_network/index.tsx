import NavPage from '../../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../../src/util/header';
import IconFont from '../../../src/components/icon_font';
import wallet from '../../wallet_ui';
import { initialize as initializeChain } from '../../chain';
import storage from 'somes/storage'
import { Spin } from 'antd';
import "./index.scss";
import * as config from '../../../config';

interface INetworkListItemProps {
	name: string;
	iconType: string;
	chainId: string | number;
	network: string
}

const networkList: INetworkListItemProps[] = [
	{ name: '以太坊', iconType: 'icon-ETH', chainId: 1, network: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
	{ name: 'Ethereum Testnet Rinkeby', iconType: 'icon-evm', chainId: 4, network: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
	{ name: 'Matic Testnet Mumbai', iconType: 'icon-evm', chainId: 80001, network: 'https://rpc-mumbai.maticvigil.com/v1/4ea0aeeeb8f8b2d8899acfc89e9852a361bf5b13' },
	{ name: 'BSN_TEST', iconType: 'icon-evm', chainId: 5555, network: 'https://opbtest.bsngate.com:18602/api/ac733d05c764467787cebef16f31f646/rpc' },	
]

class NetWorkChange extends NavPage {

	state = {
		network: '',
		loading: false
	}

	async triggerLoad() {
		let network = localStorage.getItem('currNetwork') || config.defaultNetwork;
		this.setState({ network });
	}

	async change(item: INetworkListItemProps) {
		this.setState({ loading: true });
		localStorage.setItem('currNetwork', item.network);
		// let new_wallet = new wallet(item.network);
		wallet.setProvider(item.network);
		await initializeChain(wallet);
		this.setState({ currNetworkIndex: item.chainId, loading: false, network: item.network });
	}

	render() {
		let { network, loading } = this.state;

		return <div className="network_change_page">
			<Spin spinning={loading}>

				<Header page={this} title="网络切换" />
				<div className="network_box">
					{networkList.map(item => {
						return <div key={item.chainId} className="network_item" onClick={this.change.bind(this, item)}>
							<div className="left_box">
								<IconFont style={{ width: '.36rem', height: '.36rem' }} type={item.iconType} />
								<div className="name">{item.name}</div>
							</div>
							{Boolean(network == item.network) && <div className="active"></div>}
						</div>
					})}
				</div>
			</Spin>
		</div>

	}
}

export default NetWorkChange;