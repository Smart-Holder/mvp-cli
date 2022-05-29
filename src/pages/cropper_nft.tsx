import NavPage from '../../src/nav';
import { React } from 'webpkit/mobile';
import Header from '../../src/util/header';
import Cropper from 'react-cropper' // 引入Cropper
import 'cropperjs/dist/cropper.css';
import Button from '../../src/components/button';
import { Radio, Slider } from 'antd';
// import "./index.scss";
import models, { NFT } from '../../src/models';
import { RadioChangeEvent } from 'antd/lib/radio';
import { transformImage } from '../../src/models/device';
import { alert } from 'webpkit/lib/dialog';
import '../css/cropper_nft.scss';

export interface ICropConfig {
	originWidth: number;
	originHeight: number;
	cropX: number;
	cropY: number;
	cropWidth: number;
	cropHeight: number;
	targetWidth: number;
	targetHeight: number;
	zoom?: number;
	scaleType: string;
}

interface IimageTransformProps {
	originWidth: number;
	originHeight: number;
	targetWidth: number;
	targetHeight: number;
	zoom: number;
	scaleType: string;
	screenWidth: number;
	screenHeight: number;
	canvasDataLeft: number;
	canvasDataTop: number;
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
}

let canvasConfig: {
	[key: number]: {
		width: number
		height: number
		canvasWidth: number
		canvasHeight: number
		aspectRatio: number
	}
} = {
	0: { width: 1920, height: 1080, canvasWidth: 6.4, canvasHeight: 3.6, aspectRatio: 16 / 9 },
	1: { width: 1080, height: 1920, canvasWidth: 3.6 * 1.13, canvasHeight: 6.4 * 1.13, aspectRatio: 9 / 16 },
	// 1: { width: 1080, height: 1920, canvasWidth: 3.6, canvasHeight: 6.4, aspectRatio: 9 / 16 },
}

let cropBoxConfig = {
	'crop': {
		cropBoxMovable: true,
		cropBoxResizable: true,
		viewMode: 3,
		movable: true,
		loading: false,
		scaleType: 'crop',
		autoCropArea: .7,
		zoom: 1,
		aspectRatio: 16 / 9,

	},
	'zoom': {
		cropBoxMovable: true,
		cropBoxResizable: false,
		viewMode: 0,
		movable: false,
		loading: false,
		scaleType: 'zoom',
		zoom2: 10,
		aspectRatio: 0,
	}
};

export default class WalletAddress extends NavPage<{ id: string | number, address: string }> {

	cropper: any = React.createRef();

	state = {
		testUrl: '',
		zoom: 0,
		testImageList: [
			{ name: '故宫', url: 'https://nftimg.stars-mine.com/file/c4e5ec6d-d119-11ec-b88b-765b5401813b.jpg' },
			{ name: '田园', url: 'https://nftimg.stars-mine.com/file/28d4349d-c395-11ec-9069-0242ac110003.jpg' },
			{ name: '金木研', url: 'https://nftimg.stars-mine.com/file/4dc1a428-d1fc-11ec-853b-0242ac110003.jpg' },
			{ name: '最后的晚餐', url: 'https://nftimg.stars-mine.com/file/a00aa35d-d200-11ec-853b-0242ac110003.jpeg' },
		],
		currImg: {} as any,
		nft: {} as NFT,
		canvasWidth: 6.4,
		canvasHeight: 3.6,
		aspectRatio: 16 / 9,
		loading: false,
		radioVal: 0,
		cropBoxMovable: true,
		cropBoxResizable: true,
		viewMode: 3,
		movable: true,
		scaleType: 'crop' as 'crop' | 'zoom',
		limit: true,
		zoom2: 10,
		autoCropArea: .7,
		isReady: false,
		isInit: false
	}

	async getNftByScreen(screenWidth?: number, screenHeight?: number) {
		let { radioVal } = this.state;
		let nft = await models.nft.methods.getNFTById({
			id: this.params.id, owner: '', address: this.params.address,
			screenWidth: screenWidth || canvasConfig[radioVal].width,
			screenHeight: screenHeight || canvasConfig[radioVal].height
		});
		return nft[0];
	}

	async init() {
		let nft = await this.getNftByScreen();

		// setTimeout(() => {

		// (imgPreConfig.zoom && cropper.zoomTo((imgPreConfig.zoom / 100) * diviceWidth / 350, {
		// 	x: containerData.width / 2,
		// 	y: containerData.height / 2,
		// }));
		// console.log(imgPreConfig,'imgPreConfig');

		// this.setState({ zoom: imgPreConfig.zoom });

		// }, 1000);
		this.setState({ nft });
	}

	initCropBox(imageTransform: IimageTransformProps) {
		if (!imageTransform) return false;
		let diviceWidth = document.documentElement.clientWidth;
		let cropper = this.cropper.current.cropper;
		let imgPreConfig = imageTransform;
		if (!imgPreConfig) return;
		const containerData = cropper.getContainerData();
		let imageData = cropper.getImageData();
		let { scaleType, canvasDataLeft, canvasDataTop, zoom } = imgPreConfig;

		let originWidth = imageData.naturalWidth;
		let originHeight = imageData.naturalHeight;
		let imgScale = originWidth / containerData.width;
		let imgScaleY = originHeight / containerData.height;

		let cropX = Math.abs(Number(imgPreConfig.cropX));
		let cropY = Math.abs(Number(imgPreConfig.cropY));
		let cropWidth = Math.floor(Number(imgPreConfig.cropWidth));
		let cropHeight = Math.floor(Number(imgPreConfig.cropHeight));

		let isCrop = (scaleType == 'crop' && this.state.scaleType == 'crop');
		let isZoom = (scaleType == 'zoom' && this.state.scaleType == 'zoom');
		if (isCrop && zoom) {

			console.log('处理放大后的crop位置');
			(imgPreConfig.zoom && cropper.zoomTo((imgPreConfig.zoom / 100) * diviceWidth / 350, {
				x: containerData.width / 2,
				y: containerData.height / 2,
			}));
			let canvasData = cropper.getCanvasData();
			let zoomScale = canvasData.width / containerData.width;

			cropX = Math.floor(cropX * zoomScale);
			cropY = Math.floor(cropY * zoomScale);
			cropWidth = Math.floor(cropWidth * zoomScale);
			cropHeight = Math.floor(cropHeight * zoomScale);
			// console.log(cropX, cropY, cropWidth, cropHeight, zoomScale, 'old 初始化======================');
		}

		if (isCrop) {
			cropX = Math.abs(cropX) / imgScale;
			cropY = Math.abs(cropY) / imgScale;
			cropWidth = Math.floor(cropWidth / imgScale);
			cropHeight = Math.floor(cropHeight / imgScale);
			// console.log(cropX, cropY, cropWidth, cropHeight, imgScale, imgScaleY, containerData, 'new 初始化======================');


			cropper.setCropBoxData({
				left: cropX + canvasDataLeft,
				top: cropY + canvasDataTop,
				width: cropWidth,
				height: cropHeight
			});

			cropper.setCanvasData({
				left: canvasDataLeft,
				top: canvasDataTop,
			});
		} else if (isZoom) {

			(imgPreConfig.zoom && cropper.zoom((10 - zoom) / -10));
			// for (var index = 0; index < 10 - zoom; index++) {
			// 	(imgPreConfig.zoom && cropper.zoom(-0.1));
			// }
		}

		this.setState({ isInit: true, zoom: scaleType == 'crop' ? zoom : 1, zoom2: scaleType == 'zoom' ? zoom : 10 });

	}

	async triggerLoad() {
		await this.init();
	}

	sliderChange2(e: any, zoom?: number) {
		let cropper = this.cropper.current.cropper;
		let containerData = cropper.getContainerData();
		let imageData = cropper.getImageData();
		let { zoom2 } = this.state;
		this.setState({ zoom2: e });
		let isCover = ((imageData.width >= containerData.width) || (imageData.height >= containerData.height));
		// console.log(e, 'e', zoom2, 'zoom2', imageData.width, containerData.width);
		if ((e > zoom2) && isCover) {
			return false;
		} else if (!isCover && e == 10) {
			cropper.zoom(zoom || ((e - zoom2) / 10));
			this.sliderChange2(e, 0.1);
			return;
		}
		cropper.zoom((e - zoom2) / 10);
	}

	sliderChange(e: any) {
		let cropper = this.cropper.current.cropper;
		if (!cropper) return;
		let { scaleType } = this.state;


		// Zoom to 50% from the center of the container.
		// cropper.zoom(e > sliderVal ? 0.1 : -0.1);
		const containerData = cropper?.getContainerData();

		// return;
		let diviceWidth = document.documentElement.clientWidth;
		cropper.zoomTo((e / 100) * diviceWidth / 350, {
			x: containerData.width / 2,
			y: containerData.height / 2,
		});

		const canvasData = cropper.getCanvasData();
		let newCcaleType = scaleType;
		// if (e && (Math.floor(canvasData.width) > containerData.width || Math.floor(canvasData.height) > containerData.height)) {
		// 	newCcaleType = 'crop';
		// } else {
		// 	newCcaleType = 'zoom';
		// }
		this.setState({ zoom: e, scaleType: newCcaleType });

		console.log(newCcaleType, Math.floor(canvasData.width) > containerData.width, Math.floor(canvasData.height), containerData.height, canvasData);


	}

	async radioChange(e: RadioChangeEvent) {
		let val: number = e.target.value;

		this.setState({ loading: true, isReady: false, isInit: false, zoom: 0, zoom2: 10 });
		let nft = await this.getNftByScreen(canvasConfig[val].width, canvasConfig[val].height);
		setTimeout(() => {
			this.setState({ testUrl: '', nft, canvasWidth: canvasConfig[val].canvasWidth, canvasHeight: canvasConfig[val].canvasHeight, aspectRatio: canvasConfig[val].aspectRatio, radioVal: val, loading: false });
		}, 500);
	}

	maxCropBox() {
		let cropper = this.cropper.current.cropper;
		cropper.setCropBoxData({
			height: 999999,
			width: 999999
		});
	}


	getImageTransform() {
		let cropper = this.cropper.current.cropper;
		let containerData = cropper.getContainerData();
		let canvasData = cropper.getCanvasData();
		let imageData = cropper.getImageData();
		let cropBoxData = cropper.getCropBoxData();
		let { radioVal, scaleType, zoom, zoom2 } = this.state;
		// console.log(containerData, 'getContainerData', canvasData, 'getCanvasData', imageData, 'getImageData', cropBoxData, 'getCropBoxData', 'this.cropper');
		let scale = canvasConfig[radioVal].width / containerData.width;

		let originWidth = imageData.naturalWidth;
		let originHeight = imageData.naturalHeight;
		let newScaleType = scaleType;
		let imgScale = originWidth / containerData.width;
		let imgScaleY = originHeight / containerData.height;
		// imgScale = imgScale > imgScaleY? :
		let cropX = Math.floor(Number('-' + (cropBoxData.left + Math.abs(canvasData.left)) * imgScale));
		let cropY = Math.floor(Number('-' + (cropBoxData.top + Math.abs(canvasData.top)) * imgScale));
		// console.log(cropBoxData.left, Math.abs(canvasData.left), 'cropBoxData ======================');

		let cropWidth = Math.floor(cropBoxData.width * imgScale);
		let cropHeight = Math.floor(cropBoxData.height * imgScale);
		console.log(cropX, cropY, cropWidth, cropHeight, imgScale, '预览 old ===============================',);
		if (scaleType == 'crop' && zoom && (Math.floor(canvasData.width) > containerData.width || Math.floor(canvasData.height) > containerData.height)) {
			console.log('处理放大后的crop位置');
			let zoomScale = canvasData.width / containerData.width;

			cropX = Math.floor(cropX / zoomScale);
			cropY = Math.floor(cropY / zoomScale);
			cropWidth = Math.floor(cropWidth / zoomScale);
			cropHeight = Math.floor(cropHeight / zoomScale);
			// console.log(cropX, cropY, cropWidth, cropHeight, zoomScale, imgScale, '预览 new ===============================',);

			// cropWidth = cropWidth > originWidth ? originWidth : cropWidth;
			// cropHeight = cropHeight > originHeight ? originHeight : cropHeight;
			newScaleType = 'crop';
		}

		if (newScaleType == 'crop' && ((cropWidth > originWidth) || (cropHeight > originHeight))) {
			console.log(cropWidth, originWidth, cropHeight, originHeight, newScaleType, imgScale, imgScaleY);
			return alert('当前裁剪框大于图像区域,请重新裁剪');
		}

		let targetWidth = Math.floor(imageData.width * scale);
		let targetHeight = Math.floor(imageData.height * scale);

		targetWidth = targetWidth > canvasConfig[radioVal].width ? canvasConfig[radioVal].width : targetWidth;
		targetHeight = targetHeight > canvasConfig[radioVal].height ? canvasConfig[radioVal].height : targetHeight;

		console.log(
			originWidth, 'originWidth',
			originHeight, 'originHeight',
			cropX, 'cropX',
			cropY, 'cropY',
			cropWidth, 'cropWidth',
			cropHeight, 'cropHeight',
			targetWidth, 'targetWidth',
			targetHeight, 'targetHeight',
			newScaleType, 'scaleType',
			imgScale, "imgScale",
			imgScaleY, 'imgScaleY'
		);


		let imgPreConfig: any = {
			originWidth,
			originHeight,
			targetWidth,
			targetHeight,
			zoom: newScaleType == 'crop' ? zoom : zoom2,
			scaleType: newScaleType,
			screenWidth: canvasConfig[radioVal].width,
			screenHeight: canvasConfig[radioVal].height,
			canvasDataLeft: canvasData.left,
			canvasDataTop: canvasData.top,
		};

		if (newScaleType == 'crop') {
			imgPreConfig = {
				...imgPreConfig,
				cropX,
				cropY,
				cropWidth,
				cropHeight
			}
		}
		return imgPreConfig;
	}


	async modeRadioChange(e: RadioChangeEvent) {
		let val = e.target.value;
		let nft = await this.getNftByScreen();
		let { radioVal } = this.state;
		this.setState({ loading: true, isReady: false, isInit: false, nft, scaleType: val });
		if (val === 'crop') {
			setTimeout(() => {
				this.setState({ ...cropBoxConfig.crop, ...canvasConfig[radioVal] });
			}, 100);
		} else {
			setTimeout(() => {
				this.setState({ ...cropBoxConfig.zoom, ...canvasConfig[radioVal] });
			}, 100);
		}
		console.log(val);
	}

	async subImageConfig() {
		let imgPreConfig = this.getImageTransform();

		let { nft } = this.state;
		try {
			await models.nft.methods.setNFTPreview({ address: this.params.address, id: nft.id, imageTransform: imgPreConfig });
			await transformImage(this.params.address, { ...nft, imageTransform: imgPreConfig });
			// localStorage.setItem('imgPreConfig', JSON.stringify(imgPreConfig));
			alert('预览设置成功!', () => this.popPage());
		} catch (error: any) {
			alert(error.message);
		}
	}

	render() {
		let { testUrl, zoom, scaleType, nft, canvasWidth, canvasHeight, aspectRatio, loading, cropBoxMovable,
			cropBoxResizable,
			viewMode,
			movable, zoom2, autoCropArea, isReady, radioVal } = this.state;
		return <div className="cropper_page">
			<Header page={this} title='测试裁剪' actionBtn={<div className="sub_btn"><Button type="link" onClick={this.subImageConfig.bind(this)}>提交</Button></div>} />
			<div className='cropper_wapper'>

				<div className="radio_box">
					<div className="title">选择方向</div>
					<div className="body">
						<div className="item_radio">
							<Radio.Group name="radiogroup" defaultValue={0} onChange={this.radioChange.bind(this)}>
								<Radio value={0}>
									<div className="route_box">
										<img src="https://nftimg.stars-mine.com/file/3f12c11b-d1e4-11ec-853b-0242ac110003.png" />
									</div>
								</Radio>
								<Radio value={1}>
									<div className="route_box" style={{ height: '1.5rem', width: '1rem' }}>
										<img src="https://nftimg.stars-mine.com/file/3f12c11b-d1e4-11ec-853b-0242ac110003.png" />
									</div>
								</Radio>
							</Radio.Group>
						</div>
					</div>
				</div>

				<div className="cropper_box" style={{ minHeight: `${canvasHeight + 0.2}rem` }}>
					<div className="loading_text">切换...</div>
					{/* <div className="cropper_box_bg" > */}

					{!loading && <Cropper
						src={nft.image || nft.imageOrigin}
						ref={this.cropper}
						style={{ height: `${canvasHeight}rem`, width: `${canvasWidth}rem` }}
						viewMode={viewMode}
						aspectRatio={aspectRatio}
						// guides={false}
						dragMode={'move'}
						autoCropArea={autoCropArea}
						// zoomable={false}
						zoomOnTouch={false}
						zoomOnWheel={false}
						movable={movable}
						// cropBoxResizable={false}
						// wheelZoomRatio={.5}
						// background={false}
						cropBoxMovable={cropBoxMovable}
						cropBoxResizable={cropBoxResizable}
						toggleDragModeOnDblclick={false}
						responsive={false}
						restore={false}
						ready={() => {
							let { scaleType, viewMode, nft, isInit } = this.state;
							this.setState({ isReady: true });
							!isInit && this.initCropBox((nft as any).imageTransform);
							if (!viewMode && scaleType == 'zoom') {
								this.maxCropBox();
							}
						}}
					/>}
					{/* </div> */}
				</div>

				<div className="radio_box">
					<Radio.Group defaultValue={'crop'} style={{ width: '100%' }} optionType="button" onChange={this.modeRadioChange.bind(this)} options={[
						{ label: '裁剪模式', value: 'crop' },
						{ label: '缩放模式', value: 'zoom' },
					]} />
				</div>

				<div className="action_box">
					<Button disabled={!isReady} onClick={async () => {
						let cropper = this.cropper.current.cropper;
						this.getImageTransform();
						// console.log(this.params.address, { ...nft, imageTransform: imgPreConfig }, 'this.params.address, { ...nft, imageTransform: imgPreConfig }');

						// let { nft } = this.state;
						// let res = await models.nft.methods.setNFTPreview({ address: this.params.address, id: nft.id, imageTransform: imgPreConfig });
						// console.log(res);

						// try {
						// 	await transformImage(this.params.address, { ...nft, imageTransform: imgPreConfig });
						// 	localStorage.setItem('imgPreConfig', JSON.stringify(imgPreConfig));
						// 	alert('预览设置成功!');
						// } catch (error: any) {
						// 	alert(error.message);
						// }
						this.setState({ testUrl: cropper.getCroppedCanvas().toDataURL() });
					}}>预览效果</Button>

					{/* <Button onClick={() => {
					let cropper = this.cropper.current.cropper;
					cropper.setCropBoxData({
						height: 999999,
						width: 999999
					});
				}}>
					最大crop框
				</Button> */}

					<Button disabled={!isReady} onClick={() => {
						this.setState({ loading: true, isReady: false, testUrl: '' });
						setTimeout(() => {
							this.setState({ ...cropBoxConfig[scaleType] });
						}, 100);
					}}>
						重置
					</Button>

					{/* <Button onClick={() => {
					this.setState({ loading: true });
					setTimeout(() => {
						this.setState({
							cropBoxMovable: true,
							cropBoxResizable: true,
							viewMode: 3,
							movable: true,
							loading: false,
							scaleType: 'crop',
							autoCropArea: .7
						});
					}, 100);
				}}>裁剪模式</Button> */}
					{/* <Button onClick={() => {
					this.setState({ loading: true });
					setTimeout(() => {
						this.setState({
							cropBoxMovable: true,
							cropBoxResizable: false,
							viewMode: 0,
							movable: false,
							loading: false,
							scaleType: 'zoom'
						});
					}, 100);
				}}>缩放模式</Button> */}

					{/* <Button onClick={() => {
					this.setState({ viewMode: 0 });
				}}>viewMode 0</Button> */}

					{/* <Button onClick={() => {
					let cropper = this.cropper.current.cropper;
					let imageData = cropper.getImageData();
					let canvasData = cropper.getCanvasData();
					let cropBoxData = cropper.getCropBoxData();

					cropper.setCropBoxData({
						height: imageData.height,
						width: imageData.width,
						left: canvasData.left,
						top: imageData.height / 4,
					});
					console.log(imageData, 'imageData');

				}}> 限制crop框</Button> */}

					{/* <Button onClick={() => {
					let cropper = this.cropper.current.cropper;
					let imageData = cropper.getImageData();
					let canvasData = cropper.getCanvasData();
					let cropBoxData = cropper.getCropBoxData();

					let containerData = cropper.getContainerData();


					cropper.setCanvasData({
						height: containerData.height,
						width: containerData.width,
						left: 0,
						top: -10
						// top: containerData.height / 4,
					});

					this.setState({
						cropBoxMovable: true,
						cropBoxResizable: true,
					});
					console.log(cropper.setDefaults, Cropper.setDefaults);

					console.log(canvasData, 'canvasData');

				}}> setCanvasData</Button> */}

					<Button disabled={!isReady} onClick={async () => {
						this.setState({ loading: true, isReady: false });
						setTimeout(() => {
							this.setState({ ...cropBoxConfig[scaleType], ...canvasConfig[radioVal], testUrl: '' });
						}, 100);
						await transformImage(this.params.address, { ...nft, imageTransform: { scaleType: '' } as any });
						await models.nft.methods.delSetPreview({ address: this.params.address, id: nft.id, });
						alert("已切换为原图片");
					}} >使用原图</Button>
				</div>

				{scaleType === 'crop' ? <Slider disabled={!isReady} onChange={this.sliderChange.bind(this)} max={100} min={1} value={zoom} />
					: <Slider disabled={!isReady} onChange={this.sliderChange2.bind(this)} max={10} min={1} value={zoom2} />}

				<div className="pre_part">
					<div className="pre_box" style={{ height: `${canvasHeight}rem`, width: `${canvasWidth}rem` }}>
						{Boolean(testUrl) && <img src={testUrl} alt="" style={{ width: '100%', height: '100%' }} />}
					</div>
				</div>
			</div>

		</div >
	}
}