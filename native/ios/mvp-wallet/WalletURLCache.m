//
//  HTML5GameURLCache.mm
//  cardqa
//
//  Created by louis on 13-11-3.
//
//

#import "WalletURLCache.h"
//#import <HTML5GameResourceCache.h>
//#import <cocos2d.h>

@implementation WalletURLCache

+(instancetype)new {
	NSUInteger memoryCapacity = 100 * 1024 * 1024;    //使用 100MB内存
	NSUInteger diskCapacity = 1000 * 1024 * 1024; //使用 1GB缓存空间
	return [[WalletURLCache alloc] initWithMemoryCapacity:memoryCapacity diskCapacity:diskCapacity diskPath:@".urlcache"];
}

- (NSCachedURLResponse *)cachedResponseForRequest:(NSURLRequest *)request{
	NSCachedURLResponse* cache = [super cachedResponseForRequest:request];

	if (cache) {
		return cache;
	}

	/*
    NSURL* url = [request URL];
    const char* path = [[url relativeString] UTF8String];
    HTML5GameResourceCache* rc = HTML5GameResourceCache::get();

    unsigned long out_size = 0;
    char* data =  rc->read(path, &out_size);
    
    if(data){
        
        NSData* ns_data = [NSData dataWithBytesNoCopy:data length:out_size freeWhenDone:YES];
        std::string str_mime = rc->getMIMEType(path);
        NSString* mime =
            rc->isText(path) ?
            [NSString stringWithFormat:@"%s; charset=utf-8", str_mime.c_str()]:
            [NSString stringWithFormat:@"%s", str_mime.c_str()];
        
        NSHTTPURLResponse* resp = [NSHTTPURLResponse alloc];
        NSDictionary* headers = [NSDictionary dictionaryWithObjectsAndKeys:
                               mime, @"Content-Type",
                               @"public, max-age=189216000", @"Cache-Control",
                               @"Fri, 17 Jan 2020 06:26:40 GMT", @"Expires",
                               @"Wed, 18 Dec 2013 05:37:03 GMT", @"Last-Modified",
                               @"keep-alive", @"Connection", nil];
        [resp initWithURL:url statusCode:200 HTTPVersion:@"HTTP/1.1" headerFields:headers];
        
        cache = [[[NSCachedURLResponse alloc] initWithResponse:resp data: ns_data] autorelease];
        // delete[] data;
        [resp release];
    }
    */
	
	return cache;
}

- (void)storeCachedResponse:(NSCachedURLResponse *)cachedResponse
                 forRequest:(NSURLRequest *)request{
	//NSData* data = [cachedResponse data];
	//unsigned int size = [data length];
	//const char* c_data = static_cast<const char*>([data bytes]);
	//NSURL* url = [[cachedResponse response] URL];
	//const char* c_url = [[url relativeString] UTF8String];
	
	//HTML5GameResourceCache::get()->write(c_url, size, c_data);

	[super storeCachedResponse:cachedResponse forRequest:request];
}

@end


