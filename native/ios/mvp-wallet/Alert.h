//
//  ZZYScan.h
//  Demo
//
//  Copyright (c) 2015年 zzy. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface Alert : NSObject
+(void)alert:(NSString*_Nullable)title message:(NSString *_Nullable)msg callback:(void (^_Nullable)(void))cb;
+(void)confirm:(NSString*_Nullable)title message:(NSString *_Nullable)msg callback:(void (^_Nullable)(BOOL))cb;
+(void)prompt:(NSString*_Nullable)title message:(NSString *_Nullable)msg defaultText:(NSString*_Nullable)text
		 callback:(void (^_Nullable)(NSString * _Nullable))cb;
@end
