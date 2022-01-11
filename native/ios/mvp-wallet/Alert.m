//
//  ZZYScan.m
//  Demo
//  Copyright (c) 2015年 zzy. All rights reserved.
//

#import "Alert.h"

@implementation Alert

+(UIViewController*) ctr {
	UIWindow* win = UIApplication.sharedApplication.keyWindow?:
		UIApplication.sharedApplication.windows.firstObject;
	return win.rootViewController;
}

+(void)alert:(NSString*)title message:(NSString *)msg callback:(void (^)(void))cb {

	UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title?:@""
																																					 message:msg?:@""
																																		preferredStyle:UIAlertControllerStyleAlert];

	[alertController addAction:([UIAlertAction actionWithTitle:@"确定"
																											 style:UIAlertActionStyleDefault
																										 handler:cb ? ^(UIAlertAction * _Nonnull action) {
		cb();
	}: nil])];

	[Alert.ctr presentViewController:alertController animated:YES completion:nil];
}

+(void)confirm:(NSString*)title message:(NSString *)msg callback:(void (^)(BOOL))cb {

	UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title?:@""
																																					 message:msg?:@""
																																		preferredStyle:UIAlertControllerStyleAlert];
	[alertController addAction:([UIAlertAction actionWithTitle:@"取消"
																											 style:UIAlertActionStyleCancel
																										 handler:^(UIAlertAction * _Nonnull action) {
			cb(NO);
	}])];

	[alertController addAction:([UIAlertAction actionWithTitle:@"确定"
																											 style:UIAlertActionStyleDefault
																										 handler:cb ? ^(UIAlertAction * _Nonnull action) {
			cb(YES);
	}: nil])];

	[Alert.ctr presentViewController:alertController animated:YES completion:nil];
}

+(void)prompt:(NSString*)title message:(NSString *)msg defaultText:(NSString*)text callback:(void (^)(NSString * _Nullable))cb {
	
	UIAlertController *alertController = [UIAlertController alertControllerWithTitle:title?:@""
																																					 message:msg?:@""
																																		preferredStyle:UIAlertControllerStyleAlert];
	
	[alertController addTextFieldWithConfigurationHandler:^(UITextField * _Nonnull textField) {
			textField.text = text;
	}];

	[alertController addAction:([UIAlertAction actionWithTitle:@"取消"
																											 style:UIAlertActionStyleCancel
																										 handler:^(UIAlertAction * _Nonnull action) {
		cb(nil);
	}])];

	[alertController addAction:([UIAlertAction actionWithTitle:@"确定"
																											 style:UIAlertActionStyleDefault
																										 handler:cb?^(UIAlertAction * _Nonnull action) {
		cb(alertController.textFields[0].text?:@"");
	}:nil])];
	
	[Alert.ctr presentViewController:alertController animated:YES completion:nil];
}

@end
