package com.stars_mine.mvp_wallet;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.app.AlertDialog;
import android.webkit.WebViewClient;
import android.content.DialogInterface.OnClickListener;
import android.content.pm.ApplicationInfo;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.List;

import cfg.MvpCfg;

public class MainActivity extends AppCompatActivity {

	private ViewGroup mainLayout;
	private WebView webview;
	private Cache cache;

	private void hideStatusTitleBar() {
		Window window = getWindow();
		window.requestFeature(Window.FEATURE_NO_TITLE);

		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS
							| WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
			window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
							| View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION //这里删除的话  可以解决华为虚拟按键的覆盖
							| View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
			window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
			window.setStatusBarColor(Color.TRANSPARENT);
			window.setNavigationBarColor(Color.TRANSPARENT);//这里删除的话
		}
	}

	protected boolean isDebugger() {
		ApplicationInfo info = getApplicationInfo();
		return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
	}

	@Override protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		hideStatusTitleBar();
		setContentView(R.layout.main);
		mainLayout = (ViewGroup) findViewById(R.id.main_layout);
		webview = (WebView) mainLayout.findViewById(R.id.webview);
		cache = new Cache(this);
		setWebview();
	}

	@JavascriptInterface
	public int getStatusBarHeight() {
		int result = 0;
		int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
		if (resourceId > 0) {
			result = getResources().getDimensionPixelSize(resourceId);
		}
		return result;
	}

	@JavascriptInterface
	public String scan() {
		return "";
	}

	@JavascriptInterface
	public String getKeysName() {
		//Log.d("Test", "getKeysName");
		List<String> keys = new ArrayList<String>();
		JSONArray jsonArray = new JSONArray(keys);
		return jsonArray.toString();
	}

	@JavascriptInterface
	public String getKey(String name) {
		return null;
	}

	@JavascriptInterface
	public void setKey(String name, String value) {
		// TODO ...
	}

	@JavascriptInterface
	public void deleteKey(String name) {
		// TODO ...
	}

	private void setWebview() {
		WebSettings settings = webview.getSettings();

		settings.setAppCacheEnabled(true); // set cache and storage
		settings.setDomStorageEnabled(true);
		settings.setAppCacheMaxSize(1024*1024*512); // 512MB
		settings.setAppCachePath(getApplicationContext().getDir("cache", Context.MODE_PRIVATE).getPath());
		settings.setAllowFileAccess(true);
		settings.setCacheMode(WebSettings.LOAD_DEFAULT);
		settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
		settings.setGeolocationEnabled(true);
		settings.setBuiltInZoomControls(false);
		settings.setJavaScriptEnabled(true);

		webview.requestFocusFromTouch();
		webview.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_OVERLAY);

		if (isDebugger())
			webview.setWebContentsDebuggingEnabled(true);

		webview.addJavascriptInterface(this, "__android_api");

		webview.setWebChromeClient(new WebChromeClient() {
			@Override
			public void onReachedMaxAppCacheSize(long requiredStorage, long quota, WebStorage.QuotaUpdater quotaUpdater) {
				quotaUpdater.updateQuota(requiredStorage * 2);
			}
			@Override
			public void onProgressChanged(WebView view, int process) {
				super.onProgressChanged(view, process);
			}
		});

		webview.setWebViewClient(new WebViewClient() {
			//@Override
			public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
				WebResourceResponse res = cache.loadResources(url);
				if (res != null) { // local cache
					return res;
				} else {
					return super.shouldInterceptRequest(view, url);
				}
			}
			//@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				if (url.contains("http")) {
					return super.shouldOverrideUrlLoading(view, url);
				} else {
					return true;
				}
			}
			//@Override
			public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
				alert("警告", "网络异常", new OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						MainActivity.this.finish();
					}
				});
			}
		});

		String host = MvpCfg.host;
		// host = "http://192.168.204.16:8080/test/test.html";
		host += isDebugger() ? "?" + Math.random() : "";

		webview.loadUrl(host);
	}

	public void alert(
			String title,
			String message,
			OnClickListener ... btns) {

		AlertDialog.Builder builder = new AlertDialog.Builder(this);

		builder.setTitle(title);
		builder.setMessage(message);

		OnClickListener click = new OnClickListener() {
			public void onClick(DialogInterface dialog, int which) {
				dialog.cancel();
			}
		};

		if (btns.length < 1) {
			builder.setPositiveButton("确定", click);
		}
		else {
			builder.setPositiveButton("确定", btns[0]);
		}

		if (btns.length > 1) {
			if(btns[1] == null){
				builder.setNegativeButton("取消", click);
			}
			else{
				builder.setNegativeButton("取消", btns[1]);
			}
		}

		builder.create().show();
	}

	@Override protected void onResume() {
		super.onResume();

	}

	@Override protected void onPause() {
		super.onPause();

	}

}
