package com.stars_mine.mvp_wallet;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.PointF;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.TextView;
import com.dlazaro66.qrcodereaderview.QRCodeReaderView;
import com.dlazaro66.qrcodereaderview.QRCodeReaderView.OnQRCodeReadListener;

public class QrcodeActivity extends AppCompatActivity
    implements ActivityCompat.OnRequestPermissionsResultCallback, OnQRCodeReadListener {

  private static final int MY_PERMISSION_REQUEST_CAMERA = 0;

  private ViewGroup mainLayout;

  private TextView resultTextView;
  private QRCodeReaderView qrCodeReaderView;
  private CheckBox flashlightCheckBox;
  private CheckBox enableDecodingCheckBox;
  private PointsOverlayView pointsOverlayView;

  public int getStatusBarHeight() {
    int result = 0;
    int resourceId = getResources().getIdentifier("status_bar_height", "dimen", "android");
    if (resourceId > 0) {
      result = getResources().getDimensionPixelSize(resourceId);
    }
    return result;
  }

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

  private void initQRCodeReaderView() {

    qrCodeReaderView = (QRCodeReaderView) mainLayout.findViewById(R.id.qrdecoderview);
    resultTextView = (TextView) mainLayout.findViewById(R.id.result_text_view);
    flashlightCheckBox = (CheckBox) mainLayout.findViewById(R.id.flashlight_checkbox);
    enableDecodingCheckBox = (CheckBox) mainLayout.findViewById(R.id.enable_decoding_checkbox);
    pointsOverlayView = (PointsOverlayView) mainLayout.findViewById(R.id.points_overlay_view);

    qrCodeReaderView.setAutofocusInterval(2000L);
    qrCodeReaderView.setOnQRCodeReadListener(this);
    qrCodeReaderView.setBackCamera();
    flashlightCheckBox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
      @Override public void onCheckedChanged(CompoundButton compoundButton, boolean isChecked) {
        qrCodeReaderView.setTorchEnabled(isChecked);
      }
    });
    enableDecodingCheckBox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
      @Override public void onCheckedChanged(CompoundButton compoundButton, boolean isChecked) {
        qrCodeReaderView.setQRDecodingEnabled(isChecked);
      }
    });
    qrCodeReaderView.startCamera();
  }

  @Override protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    hideStatusTitleBar();

    setContentView(R.layout.qrcode);

    mainLayout = (ViewGroup) findViewById(R.id.qrcode_layout);

    if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        == PackageManager.PERMISSION_GRANTED) {
      initQRCodeReaderView();
    } else {
      requestCameraPermission();
    }
  }

  @Override protected void onResume() {
    super.onResume();

    if (qrCodeReaderView != null) {
      qrCodeReaderView.startCamera();
    }
  }

  @Override protected void onPause() {
    super.onPause();

    if (qrCodeReaderView != null) {
      qrCodeReaderView.stopCamera();
    }
  }

  @Override public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
      @NonNull int[] grantResults) {
    if (requestCode != MY_PERMISSION_REQUEST_CAMERA) {
      return;
    }

    if (grantResults.length == 1 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
      Snackbar.make(mainLayout, "Camera permission was granted.", Snackbar.LENGTH_SHORT).show();
      initQRCodeReaderView();
    } else {
      Snackbar.make(mainLayout, "Camera permission request was denied.", Snackbar.LENGTH_SHORT).show();
    }
  }

  // Called when a QR is decoded
  // "text" : the text encoded in QR
  // "points" : points where QR control points are placed
  @Override public void onQRCodeRead(String text, PointF[] points) {
    resultTextView.setText(text);
    pointsOverlayView.setPoints(points);
  }

  private void requestCameraPermission() {
    if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.CAMERA)) {
      Snackbar.make(mainLayout, "Camera access is required to display the camera preview.",
          Snackbar.LENGTH_INDEFINITE).setAction("OK", new View.OnClickListener() {
        @Override public void onClick(View view) {
          ActivityCompat.requestPermissions(QrcodeActivity.this, new String[] {
              Manifest.permission.CAMERA
          }, MY_PERMISSION_REQUEST_CAMERA);
        }
      }).show();
    } else {
      Snackbar.make(mainLayout, "Permission is not available. Requesting camera permission.",
          Snackbar.LENGTH_SHORT).show();
      ActivityCompat.requestPermissions(this, new String[] {
          Manifest.permission.CAMERA
      }, MY_PERMISSION_REQUEST_CAMERA);
    }
  }

}
