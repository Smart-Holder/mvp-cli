//
//  QRScan.h
//
//  Copyright (c) 2015年 zzy. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface QRScan : UIViewController
@property (strong, nonatomic) void (^callback)(NSString *result);
@end
