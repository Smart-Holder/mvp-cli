package com.stars_mine.mvp_wallet;

import java.io.IOException;
import java.io.InputStream;
import android.content.Context;
import android.webkit.WebResourceResponse;
import android.webkit.MimeTypeMap;

public class Cache {

	private Context ctx;

	Cache(Context context) {
		ctx = context;
	}

	private InputStream readAssert(String path) {
		try {
			return ctx.getAssets().open(path);
		} catch (IOException e) {}
		return null;
	}

	private static String getSuffix(String path) {
		String fileName = path;
		int index = fileName.lastIndexOf(".");
		if (index != -1) {
			return fileName.substring(index + 1).toLowerCase();
		} else {
			return null;
		}
	}

	public static String getMimeType(String path ) {
		String suffix = getSuffix(path);
		if (suffix != null && !suffix.equals("")) {
			String type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(suffix);
			if (type != null || !type.isEmpty())
				return type;
		}
		return "application/octet-stream";
	}

	public WebResourceResponse loadResources(String url) {
		int start_index = url.indexOf("/", 10);
		if (start_index != -1) {
			String path = "public" + url.substring(start_index, url.length());
			InputStream stream = readAssert(path);
			if (stream != null) {
				String mime = getMimeType(path);
				WebResourceResponse res = new WebResourceResponse(mime, null, stream);
				return res;
			}
		}
		return null;
	}

}
