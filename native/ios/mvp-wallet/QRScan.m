//
//  QRScan.m
//  Demo
//  Copyright (c) 2015年 zzy. All rights reserved.
//

#import "QRScan.h"
#import "AVCaptureSessionManager.h"
#import "Alert.h"

@interface QRScan()<UIImagePickerControllerDelegate>

@property (weak, nonatomic) IBOutlet NSLayoutConstraint *scanTop;

@property (nonatomic, strong) CADisplayLink *link;
@property (nonatomic, strong) NSString *result;

@property (nonatomic, strong) AVCaptureSessionManager *session;
@property(assign, nonatomic) BOOL TorchState;
@end

@implementation QRScan

- (BOOL)shouldAutorotate {
	return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
	return UIInterfaceOrientationMaskPortrait;
}

- (void)viewDidLoad {
	[super viewDidLoad];
	[self createNavBtn];
	
	// 添加跟屏幕刷新频率一样的定时器
	CADisplayLink *link = [CADisplayLink displayLinkWithTarget:self selector:@selector(scan)];
	self.link = link;
	
	// 获取读取读取二维码的会话
	self.session = [[AVCaptureSessionManager alloc]initWithAVCaptureQuality:AVCaptureQualityHigh
																														AVCaptureType:AVCaptureTypeQRCode
																																 scanRect:CGRectNull
																														 successBlock:^(NSString *reuslt) {
		[self showResult:reuslt];
	}];
	self.session.isPlaySound = YES;
	
	[self.session showPreviewLayerInView:self.view];
	
	[self.navigationController setNavigationBarHidden:NO animated:YES];

	self.result = @"";
}

// 在页面将要显示的时候添加定时器
- (void)viewWillAppear:(BOOL)animated{
	[super viewWillAppear:animated];
	[self.session start];
	[self.link addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
}

// 在页面将要消失的时候移除定时器
- (void)viewWillDisappear:(BOOL)animated {
	if (_callback) {
		_callback(self.result);
	}
	[super viewWillDisappear:animated];
	[self.session stop];
	[self.link removeFromRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
}

- (void)createNavBtn {
	// self.navigationController.navigationBar.backItem.backBarButtonItem
	
	UIBarButtonItem *right = [[UIBarButtonItem alloc]initWithTitle:@"相册"
																													 style:UIBarButtonItemStylePlain
																													target:self
																													action:@selector(showPhotoLibary)];
	self.navigationItem.rightBarButtonItem = right;
}

- (void)backBtnClicked {
	[self.navigationController popViewControllerAnimated:YES];
}

- (void)showPhotoLibary {
	[AVCaptureSessionManager checkAuthorizationStatusForPhotoLibraryWithGrantBlock:^{
		UIImagePickerController *imagePicker = [UIImagePickerController new];
		imagePicker.sourceType = UIImagePickerControllerSourceTypePhotoLibrary; //（选择类型）表示仅仅从相册中选取照片
		imagePicker.delegate = self;
		[self presentViewController:imagePicker animated:YES completion:nil];
	} DeniedBlock:^{
		[Alert alert:@"权限未开启" message:@"您未开启相册权限，点击确定跳转至系统设置开启" callback:^(){
			[UIApplication.sharedApplication openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
		}];
	}];
}

#pragma mark -  imagePickerDelegate

- (void)imagePickerController:(UIImagePickerController *)picker
didFinishPickingMediaWithInfo:(NSDictionary<NSString *,id> *)info {
	[self dismissViewControllerAnimated:YES completion:^{
		[self.session start];
		[self.session scanPhotoWith:[info objectForKey:@"UIImagePickerControllerOriginalImage"]
									 successBlock:^(NSString *reuslt) {
			[self showResult:reuslt?:@""];
		}];
	}];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
	[self.session start];
	[self dismissViewControllerAnimated:YES completion:nil];
}

- (void)showResult:(NSString *)result {
	if (_callback) {
		if (self.navigationController)
			[self.navigationController popViewControllerAnimated:YES];
		self.result = result;
	} else {
		[Alert alert:@"扫描结果" message:result callback:nil];
	}
}

// 扫描效果
- (void)scan{
	self.scanTop.constant -= 1;
	if (self.scanTop.constant <= -170) {
		self.scanTop.constant = 170;
	}
}

- (IBAction)changeTorchState:(id)sender {
	self.TorchState = !self.TorchState;
	NSString *str = self.TorchState ? @"关闭闪光灯" : @"打开闪光灯";
	[((UIButton *)sender) setTitle:str forState:UIControlStateNormal];
	[self.session turnTorch:self.TorchState];
}

@end
