package com.stars_mine.mvp_wallet;

import android.Manifest;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Debug;
import android.support.annotation.NonNull;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebStorage;
import android.webkit.WebView;
import android.app.AlertDialog;
import android.webkit.WebViewClient;
import android.content.DialogInterface.OnClickListener;
import android.content.pm.ApplicationInfo;

import cfg.MvpCfg;

public class MainActivity extends AppCompatActivity
	implements ActivityCompat.OnRequestPermissionsResultCallback {

	private static final int PERMISSION_REQUEST_External = 0;
	private ViewGroup _mainLayout;
	private WebView _webview;
	private Cache _cache;
	private JSApi _jsapi;

	private ViewGroup getMainLayout() {
		return _mainLayout;
	}

	private void hideStatusTitleBar() {
		Window window = getWindow();
		window.requestFeature(Window.FEATURE_NO_TITLE);

		if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
			window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS
							| WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
			window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
							| View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION //这里删除的话  可以解决华为虚拟按键的覆盖
							| View.SYSTEM_UI_FLAG_LAYOUT_STABLE
				| View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR // 深色显示状态栏文字颜色
			);
			window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
			window.setStatusBarColor(Color.TRANSPARENT);
			window.setNavigationBarColor(Color.TRANSPARENT);//这里删除的话
		}
	}

	protected boolean isDebugger() {
		ApplicationInfo info = getApplicationInfo();
		return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
	}

	@Override public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
																									 @NonNull int[] grantResults) {
		if (requestCode != PERMISSION_REQUEST_External || grantResults.length == 0) {
			return;
		}
		if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
			// Snackbar.make(mainLayout, "Camera permission was granted.", Snackbar.LENGTH_SHORT).show();
			_jsapi.checkExternalStorage();
		} else {
			// File permission request denied.
			Snackbar.make(getMainLayout(), "文件权限请求被拒绝", Snackbar.LENGTH_SHORT).show();
		}
	}

	public void requestExternalPermission() {
		if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
			// File access is required to store keys.
			Snackbar.make(getMainLayout(), "存储密钥需要文件访问权限",
				Snackbar.LENGTH_INDEFINITE).setAction("确认", new View.OnClickListener() {
				@Override public void onClick(View view) {
					ActivityCompat.requestPermissions(MainActivity.this, new String[] {
						Manifest.permission.WRITE_EXTERNAL_STORAGE
					}, PERMISSION_REQUEST_External);
				}
			}).show();
		} else {
			ActivityCompat.requestPermissions(this, new String[] {
				Manifest.permission.WRITE_EXTERNAL_STORAGE
			}, PERMISSION_REQUEST_External);
		}
	}

	@Override protected void onCreate(Bundle savedInstanceState) {
		//if (isDebugger())
		//Debug.waitForDebugger();
		super.onCreate(savedInstanceState);
		hideStatusTitleBar();
		setContentView(R.layout.main);
		_mainLayout = (ViewGroup) findViewById(R.id.main_layout);
		_webview = (WebView) _mainLayout.findViewById(R.id.webview);
		_cache = new Cache(this);
		initWebview();

		//_jsapi.scan("1");
	}

	private void initWebview() {
		WebSettings settings = _webview.getSettings();

		settings.setAppCacheEnabled(true); // set cache and storage
		settings.setDomStorageEnabled(true);
		settings.setAppCacheMaxSize(1024*1024*512); // 512MB
		settings.setAppCachePath(getApplicationContext().getCacheDir().getPath());
		settings.setAllowFileAccess(true);
		settings.setCacheMode(WebSettings.LOAD_DEFAULT);
		settings.setGeolocationEnabled(true);
		settings.setBuiltInZoomControls(false);
		settings.setJavaScriptEnabled(true);

		_webview.requestFocusFromTouch();
		_webview.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_OVERLAY);

//		if (isDebugger())
			_webview.setWebContentsDebuggingEnabled(true);

		_webview.addJavascriptInterface(_jsapi = new JSApi(this, _webview), "__android_api");

		_webview.setWebChromeClient(new WebChromeClient() {
			@Override
			public void onReachedMaxAppCacheSize(long requiredStorage, long quota, WebStorage.QuotaUpdater quotaUpdater) {
				quotaUpdater.updateQuota(requiredStorage * 2);
			}
			@Override
			public void onProgressChanged(WebView view, int process) {
				super.onProgressChanged(view, process);
			}
		});

		_webview.setWebViewClient(new WebViewClient() {
			//@Override
			public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
				WebResourceResponse res = _cache.loadResources(url);
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
				alert("网络异常", "请检查当前网络环境", new OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						MainActivity.this.finish();
					}
				});
			}
		});

		String host = MvpCfg.host;
		// host = "http://192.168.204.16:8080/test/test.html";
		host += isDebugger() ? "?" + Math.random() : "";

		_webview.loadUrl(host);
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

	@Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode == 101 && requestCode == 101) { // callback
			 String cb = data.getStringExtra("cb");
			 if (cb != null && !cb.isEmpty()) {
				 _jsapi.callback(cb, data);
			 }
		}
		super.onActivityResult(requestCode, resultCode, data);
	}

	@Override public boolean onKeyDown(int keyCode, KeyEvent event) {
		if (keyCode == KeyEvent.KEYCODE_BACK) {
			_webview.goBack();
		}
		return true;
	}

}
