package com.stars_mine.mvp_wallet;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Environment;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Display;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import org.json.JSONArray;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class JSApi {

	private Activity _ctx;
	private WebView _webview;
	private boolean _externalAvailable = false;
	private String _keystore1 = null;
	private String _keystore2 = null;

	public JSApi(Activity ctx, WebView webview) {
		_ctx = ctx;
		_webview = webview;

		File file = new File(_ctx.getApplicationContext().getFilesDir().getPath() + "/keystore");
		file.mkdirs();
		_keystore1 = file.getPath();

		_externalAvailable = Environment.MEDIA_MOUNTED.equals(Environment.getExternalStorageState());
		if (_externalAvailable) {
//			file = new File(Environment.getExternalStorageDirectory().getPath() + "/Android/.keystore");
			 file = _ctx.getApplicationContext().getExternalFilesDir("keystore");
			file.mkdirs();
			_keystore2 = file.getPath();
			Log.d("Test", _keystore2);
		}

		//Log.d("Test", getKeysName());
		//Log.d("Test", getKey("a"));
		//Log.d("Test", getKey("b"));
		//setKey("a", "A");
		//setKey("b", "B");
		//Log.d("Test", getKey("a"));
		//Log.d("Test", getKey("b"));
		// deleteKey("a");
	}

	private static String extname(String path) {
		int i = path.lastIndexOf('.');
		if (i != -1)
			return path.substring(i);
		return "";
	}

	private String readFile(String path) {
		if (!new File(path).exists()) {
			return null;
		}
		try {
			FileInputStream fis = new FileInputStream(path);
			BufferedReader reader = new BufferedReader(new InputStreamReader(fis));
			StringBuffer str = new StringBuffer();
			String tmp;
			while( (tmp = reader.readLine()) != null)
				str.append(tmp);
			fis.close();
			if (str.length() != 0) {
				return str.toString();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	private void removeFile(String path) {
		File file = new File(path);
		if (file.exists())
			file.delete();
	}

	private void writeFile(String path, String data) {
		try {
			FileOutputStream fos = new FileOutputStream(path);
			fos.write(data.getBytes());
			fos.flush();
			fos.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private void getKeysNameFrom(String path, Set<String> set, List<String> out) {
		if (path != null) {
			File file = new File(path);
			File[] files = file.listFiles();
			for (int i = 0; i < files.length; i++) {
				File item = files[i];
				if (item.isFile()) {
					String name = files[i].getName();
					if (extname(name).equals(".key")) {
						String s = name.substring(0, name.length() - 4);
						if (!set.contains(s)) {
							out.add(s);
							set.add(s);
							Log.d("Test", s);
						}
					}
				}
			}
		}
	}

	private int getScreenHeight() {
		int dpi = 0;
		WindowManager windowManager = (WindowManager)
			_ctx.getSystemService(Context.WINDOW_SERVICE);
		Display display = windowManager.getDefaultDisplay();
		DisplayMetrics displayMetrics = new DisplayMetrics();
		@SuppressWarnings("rawtypes")
		Class c;
		try {
			c = Class.forName("android.view.Display");
			@SuppressWarnings("unchecked")
			Method method = c.getMethod("getRealMetrics", DisplayMetrics.class);
			method.invoke(display, displayMetrics);
			dpi = displayMetrics.heightPixels;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return dpi;
	}

	@JavascriptInterface
	public int getStatusBarHeight() {
		int result = 0;
		int resourceId = _ctx.getResources().getIdentifier("status_bar_height", "dimen", "android");
		if (resourceId > 0) {
			result = _ctx.getResources().getDimensionPixelSize(resourceId);
		}
		return result;
	}

	@JavascriptInterface
	public int getBottomStatusHeight() {
		return getScreenHeight() - _ctx.getResources().getDisplayMetrics().heightPixels;
	}

	@JavascriptInterface
	public void scan(String id) {
		Intent intent = new Intent(".QrcodeActivity");
		intent.putExtra("cb", id);
		_ctx.startActivityForResult(intent, 101);
	}

	@JavascriptInterface
	public String getKeysName() {
		Set<String> set = new HashSet<String>();
		List<String> keys = new ArrayList<String>();
		getKeysNameFrom(_keystore1, set, keys);
		getKeysNameFrom(_keystore2, set, keys);
		JSONArray jsonArray = new JSONArray(keys);
		String json = jsonArray.toString();
		return json;
	}

	@JavascriptInterface
	public String getKey(String name) {
		String value = readFile(_keystore1 + "/" + name + ".key");
		if (value == null) {
			if (_keystore2 != null) {
				value = readFile(_keystore2 + "/" + name + ".key");
				if (value != null) {
					setKey(name, value);
				}
			}
		} else if (_keystore2 != null) {
			if (!new File(_keystore2 + "/" + name + ".key").exists()) {
				setKey(name, value);
			}
		}
		return value;
	}

	@JavascriptInterface
	public void setKey(String name, String value) {
		writeFile(_keystore1 + "/" + name + ".key", value);
		if (_keystore2 != null) {
			writeFile(_keystore2 + "/" + name + ".key", value);
		}
	}

	@JavascriptInterface
	public void deleteKey(String name) {
		removeFile(_keystore1 + "/" + name + ".key");
		if (_keystore2 != null) {
			removeFile(_keystore2 + "/" + name + ".key");
		}
	}

	public void callback(String id, Intent intent) {
		String json = intent.getStringExtra("data");
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			_webview.evaluateJavascript("__jsapi.callback('" + id + "', " + json + ")", null);
		} else {}
	}

}
