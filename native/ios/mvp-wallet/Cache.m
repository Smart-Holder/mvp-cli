//
//  NSURLProtocolCustom.m
//  mvp-wallet
//
//  Created by louis on 2022/1/10.
//

#import "Cache.h"
#import <CoreFoundation/CoreFoundation.h>
#import <MobileCoreServices/MobileCoreServices.h>
#import <WebKit/WKURLSchemeTask.h>

static NSString* const FilteredKey = @"FilteredKey";

static NSURLSession *_Session = nil;

@interface MvpCache()
@property (strong, nonatomic) NSMutableDictionary* sataTasks;
@end

@implementation MvpCache

+(NSURLSession*)getSession {
	if (!_Session) {
		_Session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]
																						 delegate:nil
																				delegateQueue:[NSOperationQueue new]];
	}
	return _Session;
}

-(id)init {
	self = [super init];
	self.sataTasks = [NSMutableDictionary new];
	return self;
}

-(BOOL)canRequest:(NSURLRequest *)request {
	if ([NSURLProtocol propertyForKey:FilteredKey inRequest:request])
		return NO;
	NSString *ext = request.URL.pathExtension;

	BOOL isFile = [@[@"png", @"jpeg", @"gif", @"jpg", @"js", @"css", @"html", @"svg", @"ttf"]
						 indexOfObjectPassingTest:^BOOL(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
			return [ext compare:obj options:NSCaseInsensitiveSearch] == NSOrderedSame;
	}] != NSNotFound;

	return isFile;
}

- (void)webView:(WKWebView *)webView startURLSchemeTask:(id <WKURLSchemeTask>)task {
	NSLog(@"-------------------, %@, %@", task.request.URL.path, task.request.URL.query);
	if (!task.request.URL.query && [self canRequest: task.request]) {
		NSString *fileName = [NSString stringWithFormat:@"public/%@", task.request.URL.path];
		NSString *path = [[NSBundle mainBundle] pathForResource:fileName ofType:nil];
		if (path) {
			[self requestLocal:task path:path];
			return;
		}
	}
	[self request:task];
}

- (void)webView:(WKWebView *)webView stopURLSchemeTask:(id <WKURLSchemeTask>)task {
	NSNumber *_id = [NSNumber valueWithPointer:(__bridge const void * _Nullable)(task)];
	NSURLSessionDataTask *urltask = [self.sataTasks objectForKey:_id];
	if (urltask) {
		[urltask cancel];
		[self.sataTasks removeObjectForKey:_id];
	}
}

-(void)checkNetwork:(void (^)(bool))cb {
	NSString* loadURL = @"https://mvp.stars-mine.com/";
	NSURLRequest* req = [NSURLRequest requestWithURL: [NSURL URLWithString:loadURL]];
	NSURLSessionDataTask *urltask;
	urltask = [[MvpCache getSession] dataTaskWithRequest:req
																		 completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
		dispatch_async(dispatch_get_main_queue(), ^{
			cb(!error);
		});
	}];
	[urltask resume];
}

//@private

-(void)request:(id <WKURLSchemeTask>)task {
	NSLog(@"request %@ %@", task.request.HTTPMethod, task.request.URL.path);
	
	NSNumber *_id = [NSNumber valueWithPointer:(__bridge const void * _Nullable)(task)];
	NSURLSessionDataTask *urltask;

	urltask = [[MvpCache getSession] dataTaskWithRequest:task.request
																		 completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
		[self.sataTasks removeObjectForKey:_id];

		dispatch_async(dispatch_get_main_queue(), ^{
			if (error) {
				[task didFailWithError:error];
			} else {
				[task didReceiveResponse:response];
				[task didReceiveData:data];
				[task didFinish];
			}
		});
	}];

	[self.sataTasks setObject:urltask forKey:_id];

	[urltask resume];
}

- (void)requestLocal:(id <WKURLSchemeTask>)task path:(NSString*)path {
	NSLog(@"request local %@ %@  =>  %@", task.request.HTTPMethod, task.request.URL.path, path);

	CFStringRef pathExtension = (__bridge CFStringRef)[path pathExtension]; //根据路径获取MIMEType
	CFStringRef type = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension, NULL);
	//The UTI can be converted to a mime type:
	NSString *mimeType = (__bridge NSString *)UTTypeCopyPreferredTagWithClass(type, kUTTagClassMIMEType);

	NSMutableDictionary *header = [[NSMutableDictionary alloc]initWithCapacity:2];
	NSData *data = [NSData dataWithContentsOfFile:path];

	header[@"Content-Type"] = [mimeType stringByAppendingString:@";charset=UTF-8"];
	header[@"Content-Length"] = [NSString stringWithFormat:@"%lu",(unsigned long) data.length];

	NSHTTPURLResponse *response = [[NSHTTPURLResponse alloc]initWithURL: task.request.URL
																													 statusCode: 200
																													HTTPVersion: @"1.1"
																												 headerFields: header];
	[task didReceiveResponse:response];
	[task didReceiveData:data];
	[task didFinish];
}

@end
























