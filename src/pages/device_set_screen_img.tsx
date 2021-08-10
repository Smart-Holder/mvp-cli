
import { React } from 'webpkit/mobile';
import NavPage from '../nav';
import Header from '../util/header';
import '../css/device_set_screen_img.scss';
import * as device from '../models/device';
import models,{NFTPlus} from '../models';
import {renderNft} from '../util/media';

export default class extends NavPage<device.Device&{type: 'single' | 'multi' | 'video'}> {

	title = '选择轮播项目';

	state = { save: device.get_screen_save(this.params.address), list: [] as NFTPlus[] };

	get_cls(nft: NFTPlus) {
		var save = this.state.save;
		var ok = save.data?.find(e=>(e.token==nft.token&&e.tokenId==nft.tokenId));
		return `item ${ok ? 'on': ''}`;
	}

	async triggerLoad() {
		this.setState({ list: await models.nft.methods.getNftByOwner({owner:this.params.address}) });
	}

	async _Handle(nft: NFTPlus) {
		var type = this.params.type;
		var save = this.state.save;

		if (type == 'multi') {
			var data = save.data.filter(e=>!(e.token==nft.token&&e.tokenId==nft.tokenId))
			if (data.length == save.data.length) {
				save.data.push(nft);
			} else {
				save.data = data;
			}
		} else {
			save.data = [nft];
		}

		this.setState({save});

		await device.set_screen_save(this.params.address, { ...save, type });

		this.popPage();
	}

	render() {
		return (
			<div className="device_set_screen_img">
				<Header title="选择轮播项目" page={this} />

				<div className="list">
					{this.state.list.map((e,j)=>
						<div className={this.get_cls(e)} key={j} onClick={()=>this._Handle(e)}>
							<div className="img">
								{renderNft(e)}
							</div>
							<div className="checkbox"></div>
						</div>
					)}
				</div>
			</div>
		);
	}

}