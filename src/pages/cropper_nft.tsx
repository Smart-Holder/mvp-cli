import NavPage from "../../src/nav";
import { React } from "webpkit/mobile";
import Header from "../../src/util/header";
import Cropper from "react-cropper"; // 引入Cropper
import "cropperjs/dist/cropper.css";
import Button from "../../src/components/button";
import { Radio, Slider } from "antd";
import { NoticeBar } from "antd-mobile";
import models, { NFT } from "../../src/models";
import { RadioChangeEvent } from "antd/lib/radio";
import { getScreenSettings, transformImage } from "../../src/models/device";
import { CloseOutlined } from "@ant-design/icons";
import "../css/cropper_nft.scss";
import { alert, confirm } from "../util/tools";
import { withTranslation } from "react-i18next";
import Loading from "../../deps/webpkit/lib/loading";

export interface IImgPreConfigProps {
	originWidth: number;
	originHeight: number;
	targetWidth?: number;
	targetHeight?: number;
	scaleType: string;
	zoom: number;
	screenWidth?: number;
	screenHeight?: number;
	canvasDataLeft: number;
	canvasDataTop: number;
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
}
// type IImgPreConfigKey = "originWidth" | "originHeight" | "targetWidth" | "targetHeight" | "zoom" | "scaleType" | "screenWidth" | "screenHeight" | "canvasDataLeft" | "canvasDataTop" | "cropX" | "cropY" | "cropWidth" | "cropHeight";
type IImgPreConfigKey = keyof IImgPreConfigProps;

// const a: IImgPreConfigKey = ""

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
		width: number;
		height: number;
		canvasWidth: number;
		canvasHeight: number;
		aspectRatio: number;
	};
} = {
	0: { width: 1920, height: 1080, canvasWidth: 6.4, canvasHeight: 3.6, aspectRatio: 16 / 9 },
	1: { width: 1080, height: 1920, canvasWidth: 3.6 * 1.13, canvasHeight: 6.4 * 1.13, aspectRatio: 9 / 16 },
};

interface IMultiplyConfigProps {
	[key: number]: { multiple: number; original: number };
}

const multiplyConfig: IMultiplyConfigProps = {
	3840: { multiple: 2, original: 0.5 },
	2160: { multiple: 2, original: 0.5 },
	1920: { multiple: 1, original: 1 },
	1080: { multiple: 1, original: 1 },
};

let cropBoxConfig = {
	crop: {
		cropBoxMovable: true,
		cropBoxResizable: true,
		viewMode: 3,
		movable: true,
		loading: false,
		scaleType: "crop",
		autoCropArea: 0.7,
		zoom: 0,
		aspectRatio: 16 / 9,
	},
	zoom: {
		cropBoxMovable: true,
		cropBoxResizable: false,
		viewMode: 0,
		movable: false,
		loading: false,
		scaleType: "zoom",
		zoom2: 10,
		aspectRatio: 0,
	},
};

interface ICropNftProps extends NFT {
	imageTransform: IImgPreConfigProps;
}

class CropImage extends NavPage<{ id: string | number; mode: number | string; address: string; screenWidth: string | number; screenHeight: string | number }> {
	cropper: any = React.createRef();

	state = {
		testUrl: "",
		zoom: 0,
		testImageList: [
			{ name: "故宫", url: "https://nftimg.stars-mine.com/file/c4e5ec6d-d119-11ec-b88b-765b5401813b.jpg" },
			{ name: "田园", url: "https://nftimg.stars-mine.com/file/28d4349d-c395-11ec-9069-0242ac110003.jpg" },
			{ name: "金木研", url: "https://nftimg.stars-mine.com/file/4dc1a428-d1fc-11ec-853b-0242ac110003.jpg" },
			{ name: "最后的晚餐", url: "https://nftimg.stars-mine.com/file/a00aa35d-d200-11ec-853b-0242ac110003.jpeg" },
		],
		currImg: {} as any,
		nft: {} as ICropNftProps,
		canvasWidth: 6.4,
		canvasHeight: 3.6,
		aspectRatio: 16 / 9,
		loading: true,
		radioVal: 0,
		cropBoxMovable: true,
		cropBoxResizable: true,
		viewMode: 3,
		movable: true,
		scaleType: "crop" as "crop" | "zoom",
		limit: true,
		zoom2: 10,
		autoCropArea: 0.7,
		isReady: false,
		isInit: false,
		screenWidth: 1920,
		screenHeight: 1080,
		originScreenWidth: 1920,
		originScreenHeight: 1080,
		preLoading: false,
		cropper: undefined,
		canvasConfig,
	};

	async getNftByScreen(screenWidth?: number, screenHeight?: number) {
		let { radioVal, canvasConfig } = this.state;
		let nft = await models.nft.methods.getNFTById({
			id: this.params.id,
			owner: "",
			address: this.params.address,
			screenWidth: screenWidth || canvasConfig[radioVal].width,
			// screenWidth: radioVal ? originScreenWidth : originScreenHeight,
			screenHeight: screenHeight || canvasConfig[radioVal].height,
			// screenHeight: radioVal ? originScreenHeight : originScreenWidth
		});
		return nft[0];
	}

	async init() {
		// const { canvasConfig } = this.state;
		// 获取设备当前设置参数
		let l = await Loading.show(this.t("正在加载屏幕设置"));
		getScreenSettings(this.params.address)
			.then(async ({ screenWidth, screenHeight, screenOriLand, env }) => {
				// let { screenWidth, screenHeight } = this.params;
				// console.log(screenWidth, screenHeight, '--------------------->origin');
				// if (!screenOriLand && env.includes('t982')) [screenWidth, screenHeight] = [screenHeight, screenWidth];
				console.log(screenWidth, "screenWidth", screenHeight, "screenHeight", screenOriLand);

				let originScreenWidth = screenWidth;
				let originScreenHeight = screenHeight;

				let newCanvasConfig = canvasConfig;
				if (screenWidth === 3840 || screenWidth === 2160) {
					newCanvasConfig = { 0: { ...canvasConfig[0], width: 3840, height: 2160 }, 1: { ...canvasConfig[1], width: 2160, height: 3840 } };
					screenWidth = screenWidth / 2;
					screenHeight = screenHeight / 2;
				}

				let nft = await this.getNftByScreen(Number(originScreenWidth), Number(originScreenHeight));
				// console.log(nft.imageTransform, "nft.imageTransform1");
				nft.imageTransform && (nft.imageTransform = this.formatImgPreConfig(nft.imageTransform, multiplyConfig[originScreenWidth].original));
				// console.log(nft.imageTransform, "nft.imageTransform");

				let val = 0;

				if (Boolean(screenWidth == 1080 && screenHeight == 1920)) val = 1;

				// console.log(screenWidth, canvasConfig[val]);
				let canvasCfg = { canvasWidth: canvasConfig[val].canvasWidth, canvasHeight: canvasConfig[val].canvasHeight, aspectRatio: canvasConfig[val].aspectRatio, radioVal: val };
				this.setState({ nft, ...canvasCfg, canvasConfig: newCanvasConfig, loading: false, screenWidth, screenHeight, originScreenWidth, originScreenHeight });
			})
			.catch((err: any) => {
				alert(err.message);
			})
			.finally(() => l.close());
	}

	initCropBox(imageTransform: IImgPreConfigProps) {
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
		// let imgScaleX = originWidth / containerData.width;
		// let imgScaleY = originHeight / containerData.height;
		// let imgScale = imgScaleX;
		// imgScale = ((originWidth >= originHeight && containerData.width < containerData.height) ? imgScaleY : imgScaleX);
		let imgScale = this.getImgScale(originWidth, originHeight, containerData.width, containerData.height);

		let cropX = Math.abs(Number(imgPreConfig.cropX));
		let cropY = Math.abs(Number(imgPreConfig.cropY));
		let cropWidth = Math.floor(Number(imgPreConfig.cropWidth));
		let cropHeight = Math.floor(Number(imgPreConfig.cropHeight));

		let isCrop = scaleType == "crop" && this.state.scaleType == "crop";
		let isZoom = scaleType == "zoom" && this.state.scaleType == "zoom";
		if (isCrop && zoom) {
			console.log("处理放大后的crop位置");
			imgPreConfig.zoom &&
				cropper.zoomTo(((imgPreConfig.zoom / 100) * diviceWidth) / 350, {
					x: containerData.width / 2,
					y: containerData.height / 2,
				});
			let canvasData = cropper.getCanvasData();

			// let zoomScale = canvasData.width / containerData.width;
			let zoomScale = this.getZoomScale(canvasData.width, canvasData.height, containerData.width, containerData.height);

			cropX = Math.floor(cropX * zoomScale);
			cropY = Math.floor(cropY * zoomScale);
			cropWidth = Math.floor(cropWidth * zoomScale);
			cropHeight = Math.floor(cropHeight * zoomScale);
			console.log(cropX, cropY, cropWidth, cropHeight, zoomScale, "old 初始化======================");
		}
		// console.log(canvasData, "canvasData", containerData, "containerData");

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
				height: cropHeight,
			});

			cropper.setCanvasData({
				left: canvasDataLeft,
				top: canvasDataTop,
			});
		} else if (isZoom) {
			imgPreConfig.zoom && cropper.zoom((10 - zoom) / -10);
			// for (var index = 0; index < 10 - zoom; index++) {
			// 	(imgPreConfig.zoom && cropper.zoom(-0.1));
			// }
		}

		this.setState({ isInit: true, zoom: scaleType == "crop" ? zoom : 1, zoom2: scaleType == "zoom" ? zoom : 10 });
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
		let isCover = imageData.width >= containerData.width || imageData.height >= containerData.height;
		// console.log(e, 'e', zoom2, 'zoom2', imageData.width, containerData.width);
		if (e > zoom2 && isCover) {
			return false;
		} else if (!isCover && e == 10) {
			cropper.zoom(zoom || (e - zoom2) / 10);
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
		cropper.zoomTo(((e / 100) * diviceWidth) / 350, {
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
	}

	async radioChange(val: number) {
		// let val: number = e.target.value;
		let { scaleType, canvasConfig, originScreenWidth } = this.state;
		this.setState({ loading: true, isReady: false, isInit: false, zoom: 0, zoom2: 10 });
		let nft = await this.getNftByScreen(canvasConfig[val].width, canvasConfig[val].height);
		nft.imageTransform && (nft.imageTransform = this.formatImgPreConfig(nft.imageTransform, multiplyConfig[originScreenWidth].original));

		setTimeout(() => {
			let aspectRatio = val == 1 && scaleType == "zoom" ? 0 : canvasConfig[val].aspectRatio;
			this.setState({ testUrl: "", nft, canvasWidth: canvasConfig[val].canvasWidth, canvasHeight: canvasConfig[val].canvasHeight, aspectRatio, radioVal: val, loading: false });
		}, 500);
	}

	maxCropBox() {
		let cropper = this.cropper.current.cropper;
		cropper.setCropBoxData({
			height: 999999,
			width: 999999,
		});
	}

	getImgScale(originWidth: number, originHeight: number, containerWidth: number, containerHeight: number) {
		let imgScaleX = originWidth / containerWidth;
		let imgScaleY = originHeight / containerHeight;
		let imgScale = imgScaleX;
		// console.log('==================================================', originWidth > originHeight);

		// imgScale = ((originWidth > originHeight && containerWidth < containerHeight) ? imgScaleY : imgScaleX);
		// imgScale = ((originWidth > originHeight || containerWidth < containerHeight) ? imgScaleY : imgScaleX);
		// imgScale = ((containerWidth < containerHeight) ? imgScaleY : imgScaleY);
		imgScale = imgScaleY < imgScaleX ? imgScaleY : imgScaleX;

		// if (containerWidth < containerHeight) {
		// 	if (originWidth > originHeight) {
		// 		imgScale = imgScaleX;
		// 	} else {
		// 		imgScale = imgScaleY;
		// 	}
		// } else {
		// 	if (originWidth > originHeight) {
		// 		imgScale = imgScaleX;
		// 	} else {
		// 		imgScale = imgScaleY;
		// 	}
		// }
		console.log(imgScaleX, "imgScaleX", imgScaleY, "imgScaleY", imgScale, "imgScale");

		return imgScale;
	}

	getScale(originWidth: number, originHeight: number, containerWidth: number, containerHeight: number) {
		let { radioVal, canvasConfig } = this.state;
		let scaleX = canvasConfig[radioVal].width / containerWidth;
		let scaleY = canvasConfig[radioVal].height / containerHeight;
		let scale = scaleX;
		scale = containerWidth < containerHeight ? scaleY : scaleX;
		return scale;
	}

	getZoomScale(canvasWidth: number, canvasHeight: number, containerWidth: number, containerHeight: number) {
		let zoomScaleX = canvasWidth / containerWidth;
		let zoomScaleY = canvasHeight / containerHeight;
		let cropper = this.cropper.current.cropper;
		let imageData = cropper.getImageData();
		let originWidth = imageData.naturalWidth;
		let originHeight = imageData.naturalHeight;

		let zoomScale = zoomScaleY;
		// zoomScale = ((containerWidth < containerHeight) ? zoomScaleY : zoomScaleX);
		zoomScale = zoomScaleY < zoomScaleX ? zoomScaleY : zoomScaleX;

		// zoomScale = ((originWidth > originHeight && containerWidth < containerHeight) ? zoomScaleY : zoomScaleX);
		// 如果竖屏
		// if (containerWidth < containerHeight) {
		// 	// 如果竖图
		// 	if (originWidth > originHeight) {
		// 		zoomScale = zoomScaleY
		// 	} else {
		// 		zoomScale = zoomScaleX
		// 	}
		// } else {
		// 	if (originWidth > originHeight) {
		// 		zoomScale = zoomScaleX
		// 	} else {
		// 		zoomScale = zoomScaleY
		// 	}
		// }
		console.log(zoomScaleX, "zoomScaleX", zoomScaleY, "zoomScaleY");
		return zoomScale;
	}

	getImageTransform() {
		let cropper = this.cropper.current.cropper;

		let containerData = cropper.getContainerData();
		let canvasData = cropper.getCanvasData();
		let imageData = cropper.getImageData();
		let cropBoxData = cropper.getCropBoxData();
		let { radioVal, scaleType, zoom, zoom2, canvasConfig } = this.state;
		// console.log(containerData, 'getContainerData', canvasData, 'getCanvasData', imageData, 'getImageData', cropBoxData, 'getCropBoxData', 'this.cropper');
		let scaleX = canvasConfig[radioVal].width / containerData.width;
		let scaleY = canvasConfig[radioVal].height / containerData.height;
		let scale = scaleX;

		let originWidth = imageData.naturalWidth;
		let originHeight = imageData.naturalHeight;
		scale = containerData.width < containerData.height ? scaleY : scaleX;

		let newScaleType = scaleType;
		// let imgScaleX = originWidth / containerData.width;
		// let imgScaleY = originHeight / containerData.height;
		// let imgScale = imgScaleX;
		// imgScale = ((originWidth > originHeight) ? imgScaleY : imgScaleX);

		// imgScale = imgScale > imgScaleY? :
		let imgScale = this.getImgScale(originWidth, originHeight, containerData.width, containerData.height);
		let cropX = Math.floor(Number("-" + (cropBoxData.left + Math.abs(canvasData.left)) * imgScale));
		let cropY = Math.floor(Number("-" + (cropBoxData.top + Math.abs(canvasData.top)) * imgScale));
		// console.log(cropBoxData.left, Math.abs(canvasData.left), 'cropBoxData ======================');

		let cropWidth = Math.floor(cropBoxData.width * imgScale);
		let cropHeight = Math.floor(cropBoxData.height * imgScale);
		console.log(cropX, cropY, cropWidth, cropHeight, imgScale, zoom, "预览 old ===============================", cropBoxData, "cropBoxData");
		if (scaleType == "crop" && zoom && (Math.floor(canvasData.width) > containerData.width || Math.floor(canvasData.height) > containerData.height)) {
			// let zoomScaleX = canvasData.width / containerData.width;
			// let zoomScaleY = canvasData.height / containerData.height;
			// let zoomScale = zoomScaleY;
			let zoomScale = this.getZoomScale(canvasData.width, canvasData.height, containerData.width, containerData.height);
			console.log("处理放大后的crop位置===============================", zoomScale);

			cropX = Math.floor(cropX / zoomScale);
			cropY = Math.floor(cropY / zoomScale);
			cropWidth = Math.floor(cropWidth / zoomScale);
			cropHeight = Math.floor(cropHeight / zoomScale);
			newScaleType = "crop";
		}

		if (newScaleType == "crop" && (cropWidth > originWidth || cropHeight > originHeight)) {
			console.log(cropWidth, originWidth, cropHeight, originHeight, newScaleType, cropBoxData);
			return alert(this.t("当前裁剪框大于图像区域,请重新裁剪"));
		}

		let targetWidth = Math.floor(imageData.width * scale);
		let targetHeight = Math.floor(imageData.height * scale);

		targetWidth = targetWidth > canvasConfig[radioVal].width ? canvasConfig[radioVal].width : targetWidth;
		targetHeight = targetHeight > canvasConfig[radioVal].height ? canvasConfig[radioVal].height : targetHeight;

		// console.log(
		// 	originWidth, 'originWidth',
		// 	originHeight, 'originHeight',
		// 	cropX, 'cropX',
		// 	cropY, 'cropY',
		// 	cropWidth, 'cropWidth',
		// 	cropHeight, 'cropHeight',
		// 	targetWidth, 'targetWidth',
		// 	targetHeight, 'targetHeight',
		// 	newScaleType, 'scaleType',
		// 	imgScale, "imgScale",
		// );

		let imgPreConfig: IImgPreConfigProps = {
			originWidth,
			originHeight,
			scaleType: newScaleType,
			canvasDataLeft: canvasData.left,
			canvasDataTop: canvasData.top,
			zoom: newScaleType == "crop" ? zoom : zoom2,
		};

		if (newScaleType == "crop") {
			imgPreConfig = {
				...imgPreConfig,
				cropX,
				cropY,
				cropWidth,
				cropHeight,
			};
		}
		let { originScreenWidth } = this.state;

		imgPreConfig = this.formatImgPreConfig(imgPreConfig, multiplyConfig[originScreenWidth].multiple);
		// 不用处理的数据
		imgPreConfig = {
			...imgPreConfig,
			screenWidth: canvasConfig[radioVal].width,
			screenHeight: canvasConfig[radioVal].height,
			targetWidth,
			targetHeight,
		};

		return imgPreConfig;
	}

	formatImgPreConfig(imgPreConfig: IImgPreConfigProps, multiplyNumber: number): IImgPreConfigProps {
		// return imgPreConfig;
		// let { originScreenWidth } = this.state;
		let newImgPreConfig = Object.keys(imgPreConfig).reduce((pre: IImgPreConfigProps, cur) => {
			// console.log(imgPreConfig[cur], cur, pre, 'imgPreConfig[cur]');
			let item = imgPreConfig[cur as IImgPreConfigKey]!;
			// if (item === 1080) { item = item - 56 }
			return { ...pre, [cur]: isNaN(Number(item)) ? item : Number(item) * multiplyNumber };
		}, imgPreConfig);

		// console.log(newImgPreConfig, 'imgPreConfig');
		return newImgPreConfig;
	}

	async modeRadioChange(e: RadioChangeEvent) {
		let val = e.target.value;
		let { originScreenWidth } = this.state;
		let nft = await this.getNftByScreen();
		nft.imageTransform = this.formatImgPreConfig(nft.imageTransform, multiplyConfig[originScreenWidth].original);

		let { radioVal, canvasConfig } = this.state;
		this.setState({ loading: true, isReady: false, isInit: false, nft, scaleType: val });
		if (val === "crop") {
			setTimeout(() => {
				this.setState({ ...cropBoxConfig.crop, ...canvasConfig[radioVal] });
			}, 100);
		} else {
			setTimeout(() => {
				this.setState({ ...cropBoxConfig.zoom, ...canvasConfig[radioVal], aspectRatio: 0 });
			}, 100);
		}
		console.log(val);
	}

	async subImageConfig() {
		let imgPreConfig = this.getImageTransform();

		let { nft, radioVal, screenHeight, screenWidth } = this.state;
		let { mode } = this.params;
		try {
			let newNft: any = { ...nft, imageTransform: imgPreConfig };
			mode == "0" && (newNft.shadow = 1);
			await transformImage(this.params.address, newNft);
			await models.nft.methods.setNFTPreview({ address: this.params.address, id: nft.id, imageTransform: imgPreConfig });
			// if (screenWidth == canvasConfig[radioVal].width && screenHeight == canvasConfig[radioVal].height) {
			// }
			// localStorage.setItem('imgPreConfig', JSON.stringify(imgPreConfig));
			alert(this.t("预览设置成功!"), () => this.popPage());
		} catch (error: any) {
			if (error.code == -10001) return alert(this.t(`系统检测到您的设备目前是${!radioVal ? "竖屏" : "横屏"}，无法保存${!radioVal ? "横屏" : "竖屏"}设置`));
			alert(error.message);
		}
	}

	// 使用原图
	async removeImagePreview() {
		let { scaleType, nft, radioVal, screenWidth, screenHeight, canvasConfig, originScreenWidth, originScreenHeight } = this.state;
		let { mode } = this.params;
		confirm(this.t(`确定退出设置使用原图吗？退出后您可在“设置-${this.params.mode == "0" ? "投屏" : "轮播图"}”将原图显示在设备上`), async () => {
			this.setState({ loading: true, isReady: false });
			setTimeout(() => {
				let aspectRatio = radioVal == 1 && scaleType == "zoom" ? 0 : canvasConfig[radioVal].aspectRatio;
				this.setState({ ...cropBoxConfig[scaleType], ...canvasConfig[radioVal], aspectRatio, testUrl: "" });
			}, 100);
			try {
				if (originScreenWidth == canvasConfig[radioVal].width && originScreenHeight == canvasConfig[radioVal].height) {
					let newNft: any = { ...nft, imageTransform: { scaleType: "", screenWidth: canvasConfig[radioVal].width, screenHeight: canvasConfig[radioVal].height } as any };
					mode == "0" && (newNft.shadow = 1);
					delete newNft.imageTransformList;
					await transformImage(this.params.address, newNft);
					console.log("transformImage", newNft, newNft.shadow, mode);
				}
				await models.nft.methods.delSetPreview({ address: this.params.address, id: nft.id, screenWidth: canvasConfig[radioVal].width, screenHeight: canvasConfig[radioVal].height });
				alert(this.t("已切换为原图片"), () => this.popPage());
			} catch (error: any) {
				if (error.code == -10001) {
					alert(this.t(`系统检测到您的设备目前是${!radioVal ? "竖屏" : "横屏"}，无法保存${!radioVal ? "横屏" : "竖屏"}设置`));
					return;
				}
				alert(error.message);
			}
		});
	}

	render() {
		let { testUrl, zoom, scaleType, nft, canvasWidth, canvasHeight, aspectRatio, loading, cropBoxMovable, cropBoxResizable, viewMode, movable, zoom2, autoCropArea, isReady, radioVal, preLoading } = this.state;
		let { screenWidth, screenHeight, originScreenHeight, originScreenWidth, canvasConfig } = this.state;
		let { t } = this;
		return (
			<div className="cropper_page">
				<Header
					page={this}
					title={t("图片裁剪")}
					actionBtn={
						<div className="sub_btn">
							<Button disabled={!isReady} type="link" onClick={this.subImageConfig.bind(this)}>
								{t("提交")}
							</Button>
						</div>
					}
				/>
				<div className="cropper_root_box">
					<div className="cropper_wapper">
						<div className="radio_box">
							{!Boolean(originScreenWidth == canvasConfig[radioVal].width && originScreenHeight == canvasConfig[radioVal].height) && <NoticeBar marqueeProps={{ loop: true, text: t("当前裁剪比例与设备比例不符合,提交将不生效") }}></NoticeBar>}
							<div className="title">{t("选择方向")}</div>
							<div className="body">
								<div className="item_radio">
									<div className="select_radio_box">
										<div className="radio_select_box">
											<div className="radio_transverse" onClick={this.radioChange.bind(this, 0)}>
												<div className="label">{t("选择横屏")}</div>
												<div className={`value ${radioVal == 0 && "active"}`}>
													<div className={`image_box pre_box${0}`} style={{ height: "56%", width: "80%" }}>
														<img src={nft.image || nft.imageOrigin} />
													</div>
												</div>
											</div>
											<div className="radio_vertical" onClick={this.radioChange.bind(this, 1)}>
												<div className="label">{t("选择竖屏")}</div>

												<div className={`value ${radioVal == 1 && "active"}`}>
													<div className={`image_box pre_box${1}`} style={{ height: "80%", width: "56%" }}>
														<img src={nft.image || nft.imageOrigin} />
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* <Radio.Group name="radiogroup" value={radioVal} onChange={this.radioChange.bind(this)}>
									<Radio value={0}>
										<div className={`route_box pre_box${radioVal}`} style={{ height: '1rem', width: '2rem' }}>
											<img src={nft.image || nft.imageOrigin} />
										</div>
									</Radio>
									<Radio value={1}>
										<div className={`route_box pre_box${radioVal}`} style={{ height: '1.5rem', width: '1rem' }}>
											<img src={nft.image || nft.imageOrigin} />
										</div>
									</Radio>
								</Radio.Group> */}
								</div>
							</div>
						</div>
						<div className="cropper_part">
							<div className="radio_box">
								<Radio.Group
									defaultValue={"crop"}
									style={{ width: "100%" }}
									optionType="button"
									onChange={this.modeRadioChange.bind(this)}
									options={[
										{ label: t("裁剪模式"), value: "crop" },
										{ label: t("缩放模式"), value: "zoom" },
									]}
								/>
							</div>

							<div className="action_box">
								<Button
									loading={preLoading}
									disabled={!isReady}
									onClick={async () => {
										let cropper = this.cropper.current.cropper;
										this.getImageTransform();
										let that = this;
										let croppedCanvas = cropper.getCroppedCanvas({ maxWidth: 1920 });
										this.setState({ preLoading: true });

										croppedCanvas.toBlob(
											function (e?: any) {
												if (!e) return false;
												let timestamp = Date.parse(new Date() + "");
												e.name = timestamp + ".png";
												let bUrl = URL.createObjectURL(e);
												that.setState({ testUrl: bUrl, preLoading: false });
											},
											"image/png",
											0.5
										);
									}}
								>
									{t("预览效果")}
								</Button>

								<Button
									disabled={!isReady}
									onClick={() => {
										this.setState({ loading: true, isReady: false, testUrl: "", preLoading: false });
										setTimeout(() => {
											this.setState({ ...cropBoxConfig[scaleType], ...canvasConfig[radioVal] });
										}, 100);
									}}
								>
									{t("重置")}
								</Button>

								<Button
									disabled={!isReady}
									onClick={async () => {
										this.removeImagePreview();
									}}
								>
									{t("使用原图")}
								</Button>
							</div>

							<div className="slider_box">
								{scaleType === "crop" ? (
									<Slider disabled={!isReady} onChange={this.sliderChange.bind(this)} max={100} min={0} value={zoom} />
								) : (
									// <div></div>
									<Slider disabled={!isReady} onChange={this.sliderChange2.bind(this)} max={10} min={1} value={zoom2} />
								)}
							</div>
							<div className="cropper_box" style={{ minHeight: `${canvasHeight + 0.2}rem` }}>
								{!testUrl && <div className="loading_text">loading...</div>}
								{Boolean(testUrl) && (
									<div className="pre_part">
										<div className={`pre_box pre_box${radioVal}`} style={{ height: `${canvasHeight}rem`, width: `${canvasWidth}rem` }}>
											{Boolean(testUrl) && <img src={testUrl} alt="" style={{ width: "100%", height: "100%" }} />}
										</div>
									</div>
								)}

								<div className={`cropper_warrper ${testUrl && "cropper_prebox"}`}>
									{!loading && (
										<Cropper
											src={nft.image || nft.imageOrigin}
											ref={this.cropper}
											style={{ height: `${canvasHeight}rem`, width: `${canvasWidth}rem` }}
											viewMode={viewMode}
											aspectRatio={aspectRatio}
											// guides={false}
											dragMode={"move"}
											autoCropArea={autoCropArea}
											// zoomable={false}
											zoomOnTouch={false}
											zoomOnWheel={false}
											movable={movable}
											outputType="png"
											cropBoxMovable={cropBoxMovable}
											cropBoxResizable={cropBoxResizable}
											toggleDragModeOnDblclick={false}
											responsive={false}
											restore={false}
											ready={() => {
												let { scaleType, viewMode, nft, isInit, originScreenWidth } = this.state;
												console.log((nft as any).imageTransform, "nft as any).imageTransform");

												this.setState({ isReady: true });
												!isInit && this.initCropBox(nft.imageTransform);
												if (!viewMode && scaleType == "zoom") {
													this.maxCropBox();
												}
											}}
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withTranslation("translations", { withRef: true })(CropImage);
