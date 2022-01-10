//
//  AppDelegate.m
//  mvp-wallet
//
//  Created by louis on 2022/1/10.
//

#import "AppDelegate.h"
#import "NSURLFile.h"

@interface AppDelegate ()

@end

@implementation AppDelegate

-(void)setNSURLProtocolLocal{
	//注册
	[NSURLProtocol registerClass:[NSURLFile class]];
	//实现拦截功能，这个是核心
	Class cls = NSClassFromString(@"WKBrowsingContextController");
	SEL sel = NSSelectorFromString(@"registerSchemeForCustomProtocol:");
	if ([(id)cls respondsToSelector:sel]) {
		#pragma clang diagnostic push
		#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
		[(id)cls performSelector:sel withObject:@"http"];
		[(id)cls performSelector:sel withObject:@"https"];
		#pragma clang diagnostic pop
	}
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
	// Override point for customization after application launch.
	[self setNSURLProtocolLocal];
	return YES;
}


#pragma mark - UISceneSession lifecycle


- (UISceneConfiguration *)application:(UIApplication *)application configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession options:(UISceneConnectionOptions *)options {
	// Called when a new scene session is being created.
	// Use this method to select a configuration to create the new scene with.
	return [[UISceneConfiguration alloc] initWithName:@"Default Configuration" sessionRole:connectingSceneSession.role];
}


- (void)application:(UIApplication *)application didDiscardSceneSessions:(NSSet<UISceneSession *> *)sceneSessions {
	// Called when the user discards a scene session.
	// If any sessions were discarded while the application was not running, this will be called shortly after application:didFinishLaunchingWithOptions.
	// Use this method to release any resources that were specific to the discarded scenes, as they will not return.
}


@end
