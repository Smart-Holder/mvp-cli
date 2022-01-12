//
//  ViewController.m
//  mvp-wallet
//
//  Created by louis on 2022/1/10.
//

#import "ViewController.h"
#import "WebKit/WebKit.h"
#import "Alert.h"
#import "AVCaptureSessionManager.h"
#import "QRScan.h"

NSString *loadURL = @"https://mvp-dev.stars-mine.com";
//NSString *loadURL = @"http://127.0.0.1:8001";
//NSString *loadURL = @"https://baidu.com";
//NSString *loadURL = @"https://apple.com";


@interface ViewController () <WKNavigationDelegate, WKUIDelegate>
{
	WKWebView *_webview;
}
@end

@implementation ViewController

- (BOOL)prefersStatusBarHidden {
	 return NO;
}

- (UIStatusBarStyle)preferredStatusBarStyle {
	return UIStatusBarStyleDarkContent;
}

- (void) _loadView {

	//创建网页配置对象
	WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];

	// 创建设置对象
	WKPreferences *preference = [[WKPreferences alloc]init];
	//最小字体大小 当将javaScriptEnabled属性设置为NO时，可以看到明显的效果
	// preference.minimumFontSize = 0;
	//设置是否支持javaScript 默认是支持的
	preference.javaScriptEnabled = YES;
	// 在iOS上默认为NO，表示是否允许不经过用户交互由javaScript自动打开窗口
	// preference.javaScriptCanOpenWindowsAutomatically = YES;

	config.preferences = preference;

	// 是使用h5的视频播放器在线播放, 还是使用原生播放器全屏播放
	config.allowsInlineMediaPlayback = YES;
	//设置视频是否需要用户手动播放  设置为NO则会允许自动播放
	// config.mediaTypesRequiringUserActionForPlayback = YES;
	config.mediaTypesRequiringUserActionForPlayback = YES;
	//设置是否允许画中画技术 在特定设备上有效
	config.allowsPictureInPictureMediaPlayback = YES;
	//设置请求的User-Agent信息中应用程序名称 iOS9后可用
	config.applicationNameForUserAgent = @"mvp-wallet";
	
	WKWebView* view = [[WKWebView alloc] initWithFrame:CGRectMake(0, 0, 0, 0) configuration:config];
	
	self.view = view;
	_webview = view;
	
	view.allowsBackForwardNavigationGestures = YES;
	view.navigationDelegate = self;
	view.UIDelegate = self;
	
	NSString *phoneVersion = [[UIDevice currentDevice] systemVersion];
	NSArray *versionarr = [phoneVersion componentsSeparatedByString:@"."];
	if ([[versionarr objectAtIndex:0] integerValue] < 11) {
		self.edgesForExtendedLayout = UIRectEdgeNone;
	} else {
		view.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;//隐藏顶部状态栏，还要设置空间全屏
	}
	
	NSURLRequest* req = [NSURLRequest requestWithURL: [NSURL URLWithString:loadURL]];
	
	[view loadRequest:req];
}

- (void)viewDidLoad {
	[super viewDidLoad];
	// Do any additional setup after loading the view.
}

// ------------------------------ IMPL WKNavigationDelegate ------------------------------

// 页面开始加载时调用
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
}
 // 页面加载失败时调用
- (void)               webView:(WKWebView *)webView
	didFailProvisionalNavigation:(null_unspecified WKNavigation *)navigation
										 withError:(NSError *)error {
}
 // 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
}
// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
}
 //提交发生错误时调用
- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation
			withError:(NSError *)error {
}
// 接收到服务器跳转请求即服务重定向时之后调用
- (void)webView:(WKWebView *)webView didReceiveServerRedirectForProvisionalNavigation:(WKNavigation *)navigation {
}
 // 根据WebView对于即将跳转的HTTP请求头信息和相关信息来决定是否跳转
- (void)                 webView:(WKWebView *)webView
 decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
								 decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
	decisionHandler(WKNavigationActionPolicyAllow);
}
 // 根据客户端受到的服务器响应头以及response相关信息来决定是否可以跳转
- (void)                   webView:(WKWebView *)webView
 decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse
									 decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler {
	decisionHandler(WKNavigationResponsePolicyAllow);
}
 //需要响应身份验证时调用 同样在block中需要传入用户身份凭证
- (void)                   webView:(WKWebView *)webView
 didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
								 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler {
	completionHandler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
}
 //进程被终止时调用
- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView{
}


// ------------------------------ IMPL WKUIDelegate ------------------------------

- (void)                    webView:(WKWebView *)webView
 runJavaScriptAlertPanelWithMessage:(NSString *)message
									 initiatedByFrame:(WKFrameInfo *)frame
									completionHandler:(void (^)(void))completionHandler {
	[Alert alert:nil message:message callback:completionHandler];
}

- (void)                          webView:(WKWebView *)webView
		 runJavaScriptConfirmPanelWithMessage:(NSString *)message
												 initiatedByFrame:(WKFrameInfo *)frame
												completionHandler:(void (^)(BOOL))completionHandler {
	[Alert confirm:nil message:message callback:completionHandler];
}

- (void)                       webView:(WKWebView *)webView
 runJavaScriptTextInputPanelWithPrompt:(NSString *)prompt
													 defaultText:(NSString *)defaultText
											initiatedByFrame:(WKFrameInfo *)frame
										 completionHandler:(void (^)(NSString * _Nullable))completionHandler {
	[Alert prompt:prompt message:@"" defaultText:defaultText callback:completionHandler];
}

	// 页面是弹出窗口 _blank 处理
- (WKWebView *)                webView:(WKWebView *)webView
				createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration
									 forNavigationAction:(WKNavigationAction *)navigationAction
												windowFeatures:(WKWindowFeatures *)windowFeatures {
	if (!navigationAction.targetFrame.isMainFrame) {
		[webView loadRequest:navigationAction.request];
	}
	return nil;
}

// check scan qrcode
-(IBAction)pushCon:(id)sender {
	// 检查权限
	[AVCaptureSessionManager checkAuthorizationStatusForCameraWithGrantBlock:^{
		QRScan *scan = [[UIStoryboard storyboardWithName:@"Main" bundle:nil] instantiateViewControllerWithIdentifier:@"qrScan"];
		[self.navigationController pushViewController:scan animated:YES];
		// [self presentViewController:scan animated:YES completion:nil];
	} DeniedBlock:^{
		[Alert alert:@"权限未开启" message:@"您未开启相机权限，点击确定跳转至系统设置开启" callback:^(){
			[[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
		}];
	}];
}


@end
