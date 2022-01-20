package com.stars_mine.mvp_wallet;

import android.os.Environment;
import android.util.Log;
import android.content.Context;

public final class TestPaths {
	public static void print(Context ctx) {

		// /storage/emulated/0
		Log.d("Test", Environment.getExternalStorageDirectory().getPath());

		// /storage/emulated/0/Android/obb/com.stars_mine.mvp_wallet
		Log.d("Test", ctx.getApplicationContext().getObbDir().getPath());

		// /storage/emulated/0/Android/data/com.stars_mine.mvp_wallet/cache
		Log.d("Test", ctx.getApplicationContext().getExternalCacheDir().getPath());

		// /storage/emulated/0/Android/data/com.stars_mine.mvp_wallet/files
		Log.d("Test", ctx.getApplicationContext().getExternalFilesDir("keystore").getPath());

		// /data/user/0/com.stars_mine.mvp_wallet/databases/keystore
		Log.d("Test", ctx.getApplicationContext().getDatabasePath("keystore").getPath());

		// /data/user/0/com.stars_mine.mvp_wallet/files
		Log.d("Test", ctx.getApplicationContext().getFilesDir().getPath());

		//
		Log.d("Test", "----------------------------");

		//
		Log.d("Test", Environment.getExternalStorageState());
		// Log.d("Test", Environment.getStorageState("Test"));

		// /data/cache
		Log.d("Test", Environment.getDownloadCacheDirectory().getPath());

		// /data
		Log.d("Test", Environment.getDataDirectory().getPath());

		// /system
		Log.d("Test", Environment.getRootDirectory().getPath());

		// /data/user/0/com.stars_mine.mvp_wallet/cache
		Log.d("Test", ctx.getApplicationContext().getCacheDir().getPath());

	}
}
