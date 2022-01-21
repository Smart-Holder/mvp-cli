//
//  NSURLProtocolCustom.m
//  mvp-wallet
//
//  Created by louis on 2022/1/10.
//

#import <Foundation/Foundation.h>
#import <WebKit/WKURLSchemeHandler.h>

@interface MvpCache: NSObject<WKURLSchemeHandler>
-(void)checkNetwork:(void (^)(bool))cb;
@end

