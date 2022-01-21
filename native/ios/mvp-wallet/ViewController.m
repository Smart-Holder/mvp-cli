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
#import "Security/Security.h"
#import "Cache.h"

#import "../../../out/ios_host.h"

@class JSAPI;

@interface ViewController () <WKNavigationDelegate, WKUIDelegate, WKURLSchemeHandler> {
	bool _isNetwork;
}
@property(nonatomic, strong) WKWebView* webview;
@property(nonatomic, strong) JSAPI* api;
@property(nonatomic, strong) MvpCache* cache;
-(void)scan:(void (^)(NSString * _Nullable))cb;
@end

@interface JSAPI: NSObject<WKScriptMessageHandler>
@property(nonatomic, weak) ViewController* host;
@end

@implementation JSAPI

-(id) init:(ViewController*)host {
	self = [super init];
	self.host = host;

	WKUserContentController * api = host.webview.configuration.userContentController;

	[api addScriptMessageHandler:self name:@"getStatusBarHeight"];
	[api addScriptMessageHandler:self name:@"scan"];
	[api addScriptMessageHandler:self name:@"getKeysName"];
	[api addScriptMessageHandler:self name:@"getKey"];
	[api addScriptMessageHandler:self name:@"setKey"];
	[api addScriptMessageHandler:self name:@"deleteKey"];

	//NSData* data = [NSJSONSerialization dataWithJSONObject:@{@"a": @"AZAA", @"b": @"AZAA", @"c": @[@"Test"], @"d": @1} options:0 error:nil];

	//id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
	
	//[self callback:@"id_1" error:nil result:@"ok"];
	
	/*
	NSArray* keys = [self getKeysName];
	
	NSLog(@"%@", keys);
	
	NSLog(@"%d", [self setKey:@"aaaaaaaaaaaaaaaaaaaaaaaaaaa" data:@"Test"]);
	
	NSLog(@"%@", [self getKey:@"aaaaaaaaaaaaaaaaaaaaaaaaaaa"]);
	
	NSLog(@"%@", [self getKeysName]);
	
	[self deleteKey:@"aaaaaaaaaaaaaaaaaaaaaaaaaaa"];
	
	NSLog(@"%@", [self getKey:@"aaaaaaaaaaaaaaaaaaaaaaaaaaa"]);
	
	NSLog(@"%@", [self getKeysName]);*/

	return self;
}

-(UIWindow*) keyWindow {
	UIWindow* win = UIApplication.sharedApplication.keyWindow?:
		UIApplication.sharedApplication.windows.firstObject;
	return win;
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)msg {
	NSString* name = msg.name;
	NSDictionary* body = msg.body;
	NSString* id = [body objectForKey:@"id"];
	NSArray* args = [body objectForKey:@"args"];
	
	if (![id isKindOfClass: NSString.class] || ![args isKindOfClass: NSArray.class]) {
		return;
	}

	if ([name isEqualToString:@"scan"]) {
		[self.host scan:^(NSString* result) {
			[self callback:id error:nil result:result];
		}];
	} else if ([name isEqualToString:@"getKeysName"]) {
		[self callback:id error:nil result:[self getKeysName]];
	} else if ([name isEqualToString:@"getKey"]) {
		[self callback:id error:nil result:[self getKey:[args objectAtIndex:0]]];
	} else if ([name isEqualToString:@"setKey"]) {
		if ([self setKey:[args objectAtIndex:0] data:[args objectAtIndex:1]]) {
			[self callback:id error:nil result:nil];
		} else {
			[self callback:id error:@"setKey fail" result:nil];
		}
	} else if ([name isEqualToString:@"deleteKey"]) {
		[self deleteKey:[args objectAtIndex:0]];
		[self callback:id error:nil result:nil];
	} else if ([name isEqualToString:@"getStatusBarHeight"]) {
		// self.keyWindow.windowScene.statusBarManager.statusBarStyle;
		CGFloat height = MIN(UIApplication.sharedApplication.statusBarFrame.size.height, 20);
		NSNumber *num = [NSNumber numberWithFloat:height];
		[self callback:id error:nil result:num];
	} else {
		[self callback:id error:@"Method non-existent" result:nil];
	}
}
		
-(NSArray*)getKeysName {
	return [self getKey:@"keysName" prefix:NO isArray:YES]?:@[];
}

-(NSString*)getKey:(NSString*)key {
	return [self getKey:key prefix:YES isArray:NO];
}

-(BOOL)setKey:(NSString*)key data:(NSString*)val {
	[self deleteKey:key];

	if (![self setKey:key prefix:YES data:val]) {
		return NO;
	}
	NSMutableArray *keysName = [NSMutableArray arrayWithArray:[self getKeysName]];
	[keysName addObject:key];

	BOOL ok = [self setKeysName:keysName];

	return ok;
}

-(void)deleteKey:(NSString*)key {
	if (SecItemDelete((CFDictionaryRef)[self keychainItem:key prefix:YES]) == noErr) {
		NSMutableArray *keysName = [NSMutableArray arrayWithArray:[self getKeysName]];
		[keysName removeObject:key];
		[self setKeysName:keysName];
	}
}

// --------------------------------------------------------------------------

-(NSMutableDictionary*) keychainItem:(NSString*)key prefix:(BOOL)prefix {
	if (prefix) {
		key = [NSString stringWithFormat:@"%@%@", @"__", key];
	}
	return [NSMutableDictionary dictionaryWithObjectsAndKeys:
					(id)kSecClassGenericPassword, (id)kSecClass,
					key,        (id)kSecAttrAccount,
					@"default", (id)kSecAttrService,
					(id)kSecAttrAccessibleAfterFirstUnlock, (id)kSecAttrAccessible, nil];
}

-(id)getKey:(NSString*)key prefix:(BOOL)prefix isArray:(BOOL)isArray {
	NSMutableDictionary *keychain = [self keychainItem:key prefix:prefix];
	[keychain setObject:(id)kCFBooleanTrue forKey:(id)kSecReturnData];
	[keychain setObject:(id)kSecMatchLimitOne forKey:(id)kSecMatchLimit];
	NSData *data = nil;
	id ret = nil;
	if (SecItemCopyMatching((CFDictionaryRef)keychain, (CFTypeRef*)(void*)&data) == noErr) {
		if (isArray)
			if (@available(iOS 14.0, *)) {
				ret = [NSKeyedUnarchiver unarchivedArrayOfObjectsOfClass:NSString.class fromData:data error:nil];
			} else {
				ret = [NSKeyedUnarchiver unarchivedObjectOfClass:NSArray.class fromData:data error:nil];
			}
		else
			ret = [NSKeyedUnarchiver unarchivedObjectOfClass:NSString.class fromData:data error:nil];
	}
	return ret;
}

-(BOOL)setKey:(NSString*)key prefix:(BOOL)prefix data:(id)val {
	NSMutableDictionary *keychain = [self keychainItem:key prefix:prefix];
	[keychain setObject:[NSKeyedArchiver archivedDataWithRootObject:val requiringSecureCoding:YES error:nil]
							 forKey:(id)kSecValueData];
	OSStatus state = SecItemAdd((CFDictionaryRef)keychain, nil);
	return state == noErr;
}

-(BOOL)setKeysName:(NSArray*)keysName {
	SecItemDelete((CFDictionaryRef)[self keychainItem:@"keysName" prefix:NO]);
	BOOL ok = [self setKey:@"keysName" prefix:NO data:[NSArray arrayWithArray:keysName]];
	return ok;
}

// --------------------------------------------------------------------------

-(void)callback:(NSString*)_id error:(id)err result:(id)data {
	NSMutableDictionary *result = [NSMutableDictionary new];
	if (err) {
		[result setObject:err forKey:@"error"];
	}
	if (data) {
		[result setObject:data forKey:@"data"];
	}
	
	NSData* json_data = [NSJSONSerialization dataWithJSONObject:result options:0 error:nil];
	NSString *json, *script;

	json = [[NSString alloc] initWithData:json_data encoding:NSUTF8StringEncoding];
	// json = [json stringByReplacingOccurrencesOfString:@"'" withString:@"\\'"];
	script = [NSString stringWithFormat:@"window.__jsapi.callback('%@', %@)", _id, json];
	
	[self.host.webview evaluateJavaScript:script completionHandler:nil];
}

@end

@implementation WKWebView(handlesURLScheme)
+(BOOL)handlesURLScheme:(NSString *)urlScheme {
	return NO;
}
@end

@implementation ViewController

- (nullable instancetype)initWithCoder:(NSCoder *)coder {
	self = [super initWithCoder:coder];
	self.cache = [MvpCache new];
	_isNetwork = false;
	return self;
}

- (BOOL)prefersStatusBarHidden {
	 return NO;
}

- (UIStatusBarStyle)preferredStatusBarStyle {
	return UIStatusBarStyleDarkContent;
}

- (void) loadView {
	
	[self.navigationController setNavigationBarHidden:YES animated:YES];
	//创建网页配置对象
	WKWebViewConfiguration *config = [WKWebViewConfiguration new];
	
	// 创建设置对象
	WKPreferences *preference = [WKPreferences new];
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
	
	[config setURLSchemeHandler:self.cache forURLScheme:@"http"];
	[config setURLSchemeHandler:self.cache forURLScheme:@"https"];
	
	WKWebView* view = [[WKWebView alloc] initWithFrame:CGRectMake(0, 0, 0, 0) configuration:config];
	
	self.view = view;
	self.webview = view;
	
	view.allowsBackForwardNavigationGestures = NO;
	view.navigationDelegate = self;
	view.UIDelegate = self;
	
	NSString *phoneVersion = [[UIDevice currentDevice] systemVersion];
	NSArray *versionarr = [phoneVersion componentsSeparatedByString:@"."];
	if ([[versionarr objectAtIndex:0] integerValue] < 11) {
		self.edgesForExtendedLayout = UIRectEdgeNone;
	} else {
		view.scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever; //隐藏顶部状态栏，还要设置空间全屏
	}

	self.api = [[JSAPI alloc] init:self];

	self.navigationController.navigationBarHidden = YES;
	
	//	CGFloat height = MIN(UIApplication.sharedApplication.statusBarFrame.size.height, 20);
	//	NSNumber *num = [NSNumber numberWithFloat:height];
	//	NSLog(@"%@", num);
}

-(void)loadURL {
	if (_isNetwork) {
		loadURL = [NSString stringWithFormat:@"%@?%ld", loadURL, time(NULL)];
		NSURLRequest* req = [NSURLRequest requestWithURL: [NSURL URLWithString:loadURL]];
		[self.webview loadRequest:req];
	}
}

-(void)checkNetwork {
	if (!_isNetwork) {
		[self.cache checkNetwork:^(bool ok) {
			if (ok) {
				self->_isNetwork = ok;
				[self loadURL];
			} else {
				[self performSelector:@selector(checkNetwork) withObject:nil afterDelay:1.0];
			}
		}];
	}
}

- (void)viewDidLoad {
	[super viewDidLoad];
	// Do any additional setup after loading the view.
	[self checkNetwork];
}

+(UIViewController*) ctr {
	UIWindow* win = UIApplication.sharedApplication.keyWindow?:
		UIApplication.sharedApplication.windows.firstObject;
	return win.rootViewController;
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
	[Alert alert:@"网络异常" message:@"请检查当前网络环境" callback:^{
		exit(0);
	}];
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

-(void)scan:(void (^)(NSString * _Nullable))cb {
	// 检查权限
	[AVCaptureSessionManager checkAuthorizationStatusForCameraWithGrantBlock:^{
		UIStoryboard *board = [UIStoryboard storyboardWithName:@"Main" bundle:nil];
		QRScan *scan = [board instantiateViewControllerWithIdentifier:@"qrScan"];
				
		scan.callback = ^(NSString* result) {
			[self.navigationController setNavigationBarHidden:YES animated:YES];
			cb(result);
		};
		[self.navigationController pushViewController:scan animated:YES];
		
	} DeniedBlock:^{
		[Alert alert:@"权限未开启" message:@"您未开启相机权限，点击确定跳转至系统设置开启" callback:^(){
			[[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
		}];
	}];
}

// check scan qrcode
-(IBAction)pushCon:(id)sender {
	[self scan: ^(NSString* result) {
		[Alert alert:@"扫描结果" message:result callback:nil];
	}];
}

@end
