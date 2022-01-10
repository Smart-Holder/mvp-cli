//
//  NSURLProtocolCustom.m
//  mvp-wallet
//
//  Created by louis on 2022/1/10.
//

#import "NSURLFile.h"
#import <CoreFoundation/CoreFoundation.h>
#import <MobileCoreServices/MobileCoreServices.h>

static NSString* const FilteredKey = @"FilteredKey";

@interface NSURLFile()<NSURLConnectionDataDelegate> {
}
@property(nonatomic, strong)NSURLConnection *conn;
@end

@implementation NSURLFile

	//这个方法的作用是判断当前protocol是否要对这个request进行处理
	//（所有的网络请求都会走到这里，所以我们只需要对我们产生的request进行处理即可）。
	+ (BOOL)canInitWithRequest:(NSURLRequest *)request {
		if ([NSURLProtocol propertyForKey:FilteredKey inRequest:request]) {
			return NO;
		}
		NSString *ext = request.URL.pathExtension;
		
		BOOL isFile = [@[@"png", @"jpeg", @"gif", @"jpg", @"js", @"css"]
							 indexOfObjectPassingTest:^BOOL(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
				return [ext compare:obj options:NSCaseInsensitiveSearch] == NSOrderedSame;
		}] != NSNotFound;

		return isFile;
	}

	//可以对request进行预处理，比如对header加一些东西什么的，我们这里没什么要改的，所以直接返回request就好了。
	+ (NSURLRequest *)canonicalRequestForRequest:(NSURLRequest *)request {
		return request;
	}

	/* 我们这里需要做一件事，就是自己拼装httpResponse，并且返回给url load
	 system，然后到了webview那一层，会收到response，对于webview而言，加载本地和走网络拿到的response是完全一样的。
	 所以上述代码展示了如何拼装一个httpResponse，当组装完成后，需要调用self.client将数据传出去。
	 */
	- (void)startLoading {
		// fileName 获取web页面加载的资源包文件名（js  css等）
		NSString *fileName = [super.request.URL.path componentsSeparatedByString:@"/"].lastObject;
		
		//这里是获取本地资源路径 如:png,js等
		NSString *path = [[NSBundle mainBundle] pathForResource:fileName ofType:nil];
		NSLog(@"fileName is %@ path=%@",fileName,path);
		
		if (!path) {
			//本地资源包没有所需的文件，加载网络请求
			NSMutableURLRequest *newRequest = [self.request mutableCopy];
			newRequest.allHTTPHeaderFields = self.request.allHTTPHeaderFields;
			[NSURLProtocol setProperty:@YES forKey:FilteredKey inRequest:newRequest];
			self.conn = [NSURLConnection connectionWithRequest:newRequest delegate:self];
		} else {
			//根据路径获取MIMEType
			CFStringRef pathExtension = (__bridge CFStringRef)[path pathExtension];
			CFStringRef type = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, pathExtension, NULL);

			//The UTI can be converted to a mime type:
			NSString *mimeType = (__bridge NSString *)UTTypeCopyPreferredTagWithClass(type, kUTTagClassMIMEType);

			[self sendResponseWithData:[NSData dataWithContentsOfFile:path] mimeType:mimeType];
		}
	}

	- (void)stopLoading {
		 [self.conn cancel];
	}

	- (void)sendResponseWithData:(NSData *)data
											mimeType:(nullable NSString *)mimeType {
		NSMutableDictionary *header = [[NSMutableDictionary alloc]initWithCapacity:2];

		header[@"Content-Type"] = [mimeType stringByAppendingString:@";charset=UTF-8"];
		header[@"Content-Length"] = [NSString stringWithFormat:@"%lu",(unsigned long) data.length];

		NSHTTPURLResponse *response = [[NSHTTPURLResponse alloc]initWithURL: self.request.URL
																														 statusCode: 200
																														HTTPVersion: @"1.1"
																													 headerFields: header];
		//硬编码 开始嵌入本地资源到web中
		[self.client URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageNotAllowed];
		
		[self.client URLProtocol:self didLoadData:data];
		
		[self.client URLProtocolDidFinishLoading:self];
	}

	#pragma 代理

	-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response {
		[self.client URLProtocol:self didReceiveResponse:response cacheStoragePolicy:NSURLCacheStorageAllowed];
	}

	-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data {
		[self.client URLProtocol:self didLoadData:data];
	}

	-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error {
		[self.client URLProtocol:self didFailWithError:error];
	}

	-(void)connectionDidFinishLoading:(NSURLConnection *)connection {
		[self.client URLProtocolDidFinishLoading:self];
	}

@end
























