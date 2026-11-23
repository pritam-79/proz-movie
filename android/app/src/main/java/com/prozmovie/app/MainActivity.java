package com.prozmovie.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {

    private WebView webView;
    private FrameLayout customViewContainer;
    private LinearLayout splashContainer;
    private TextView splashStatus;
    private ProgressBar progressBar;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private View customView;

    // Production hosted server
    public static final String PRODUCTION_URL = "https://proz-movie.vercel.app";
    public static final String DEFAULT_APK_URL = "https://proz-movie.vercel.app/api/download/apk";

    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private int mainFrameErrorCount = 0;
    private boolean isPageLoaded = false;

    public class AndroidBridge {
        @JavascriptInterface
        public void reconnect() {
            mainHandler.post(() -> reloadProductionUrl());
        }

        @JavascriptInterface
        public void startInAppUpdate(String apkUrl) {
            mainHandler.post(() -> performInAppUpdate(apkUrl != null && !apkUrl.isEmpty() ? apkUrl : DEFAULT_APK_URL));
        }

        @JavascriptInterface
        public String getAppVersion() {
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return pInfo.versionName;
            } catch (Exception e) {
                return "0.02";
            }
        }

        @JavascriptInterface
        public int getVersionCode() {
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return pInfo.versionCode;
            } catch (Exception e) {
                return 2;
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure Immersive Status & Nav Bars
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            window.setStatusBarColor(0xFF080B12); // Midnight #080B12
            window.setNavigationBarColor(0xFF111827); // Glass Navy #111827
        }

        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        customViewContainer = findViewById(R.id.customViewContainer);
        splashContainer = findViewById(R.id.splashContainer);
        splashStatus = findViewById(R.id.splashStatus);
        progressBar = findViewById(R.id.progressBar);

        configureWebView();

        // Load the live platform
        reloadProductionUrl();
    }

    private void reloadProductionUrl() {
        if (splashContainer != null && !isPageLoaded) {
            splashContainer.setVisibility(View.VISIBLE);
            if (splashStatus != null) {
                splashStatus.setText("Connecting to streaming server...");
            }
        }
        mainFrameErrorCount = 0;
        webView.loadUrl(PRODUCTION_URL);
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Set modern mobile User-Agent to avoid web engine compatibility blocks
        String customUa = "Mozilla/5.0 (Linux; Android " + Build.VERSION.RELEASE + "; " + Build.MODEL + ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 ProzMovieApp/0.02";
        settings.setUserAgentString(customUa);

        // Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Cookies management
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        // Bridge for native updates & reconnect
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidHost");

        // WebChromeClient
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    callback.onCustomViewHidden();
                    return;
                }

                customView = view;
                customViewCallback = callback;
                customViewContainer.addView(customView);
                customViewContainer.setVisibility(View.VISIBLE);
                webView.setVisibility(View.GONE);

                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            }

            @Override
            public void onHideCustomView() {
                if (customView == null) return;

                customViewContainer.removeView(customView);
                customView = null;
                customViewContainer.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);

                if (customViewCallback != null) {
                    customViewCallback.onCustomViewHidden();
                    customViewCallback = null;
                }

                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            }
        });

        // WebViewClient with robust network resilience & no loop
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception ignored) {
                    return true;
                }
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception ignored) {
                    return true;
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && !url.equals("about:blank") && !url.startsWith("data:")) {
                    isPageLoaded = true;
                    mainFrameErrorCount = 0; // Successfully loaded, reset errors

                    if (splashContainer != null && splashContainer.getVisibility() == View.VISIBLE) {
                        splashContainer.animate().alpha(0f).setDuration(300).withEndAction(() -> {
                            splashContainer.setVisibility(View.GONE);
                            splashContainer.setAlpha(1f);
                        }).start();
                    }
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    // Ignore sub-resource errors (images, icons, analytics, fonts, prefetch)
                    if (!request.isForMainFrame()) {
                        return;
                    }

                    int errorCode = error.getErrorCode();
                    CharSequence descChar = error.getDescription();
                    String desc = descChar != null ? descChar.toString() : "";

                    // CRITICAL: Ignore aborted requests (Chromium net::ERR_ABORTED = -1)
                    // This happens when Next.js client-side router navigates, redirects, or cancels prefetch!
                    if (errorCode == -1 || desc.contains("net::ERR_ABORTED") || desc.contains("ERR_CACHE_MISS")) {
                        return;
                    }

                    // If user is already browsing inside the app, NEVER kick them out to offline screen
                    if (isPageLoaded) {
                        return;
                    }
                }

                // If initial load fails, retry up to 2 times
                mainFrameErrorCount++;
                if (mainFrameErrorCount <= 2) {
                    mainHandler.postDelayed(() -> {
                        if (webView != null && !isPageLoaded) {
                            webView.loadUrl(PRODUCTION_URL);
                        }
                    }, 2500);
                    return;
                }

                showOfflineScreen();
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                if (errorCode == -1 || (description != null && description.contains("ERR_ABORTED"))) {
                    return;
                }
                if (isPageLoaded) {
                    return;
                }
                if (failingUrl != null && failingUrl.startsWith(PRODUCTION_URL)) {
                    mainFrameErrorCount++;
                    if (mainFrameErrorCount <= 2) {
                        mainHandler.postDelayed(() -> {
                            if (webView != null && !isPageLoaded) {
                                webView.loadUrl(PRODUCTION_URL);
                            }
                        }, 2500);
                        return;
                    }
                    showOfflineScreen();
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.proceed();
            }
        });
    }

    private void showOfflineScreen() {
        if (splashContainer != null) {
            splashContainer.setVisibility(View.GONE);
        }

        String offlineHtml = "<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "body{background:#080B12;color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;box-sizing:border-box;}" +
            "h1{color:#E50914;font-size:24px;font-weight:800;letter-spacing:1.5px;margin:0 0 10px 0;text-transform:uppercase;}" +
            "p{color:#94A3B8;font-size:14px;line-height:1.6;max-width:320px;margin:0 0 24px 0;}" +
            ".btn{background:linear-gradient(135deg,#E50914,#8B5CF6);color:#FFFFFF;border:none;padding:14px 38px;border-radius:99px;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 8px 24px rgba(229,9,20,0.45);text-transform:uppercase;letter-spacing:0.5px;outline:none;-webkit-tap-highlight-color:transparent;transition:transform 0.15s ease;}" +
            ".btn:active{transform:scale(0.96);}" +
            ".spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,0.15);border-top-color:#E50914;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:20px;}" +
            "@keyframes spin{to{transform:rotate(360deg);}}" +
            "</style>" +
            "<script>" +
            "function tryReconnect(){" +
            "  var btn = document.getElementById('btn');" +
            "  if(btn){ btn.innerText = 'Connecting...'; btn.style.opacity = '0.7'; }" +
            "  if(window.AndroidHost && window.AndroidHost.reconnect){" +
            "    window.AndroidHost.reconnect();" +
            "  } else {" +
            "    window.location.replace('" + PRODUCTION_URL + "');" +
            "  }" +
            "}" +
            "</script>" +
            "</head>" +
            "<body>" +
            "<div class='spinner'></div>" +
            "<h1>PROZ ENTERTAINMENT</h1>" +
            "<p>Unable to connect to streaming server. Check network connection and tap below.</p>" +
            "<button id='btn' class='btn' onclick='tryReconnect()'>Reconnect</button>" +
            "</body></html>";

        webView.loadDataWithBaseURL(PRODUCTION_URL, offlineHtml, "text/html", "UTF-8", PRODUCTION_URL);
    }

    // ==========================================
    // IN-APP UPDATE SYSTEM
    // ==========================================
    public void performInAppUpdate(String apkUrl) {
        // Check Unknown App Sources permission on Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!getPackageManager().canRequestPackageInstalls()) {
                new AlertDialog.Builder(this)
                    .setTitle("Permission Required")
                    .setMessage("To install the in-app update, please allow installation from this source in the next screen.")
                    .setPositiveButton("Allow", (dialog, which) -> {
                        Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getPackageName()));
                        startActivity(intent);
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
                return;
            }
        }

        // Create sleek Progress Dialog
        AlertDialog progressDialog = new AlertDialog.Builder(this)
            .setTitle("Downloading Update")
            .setMessage("Downloading PROZ MOVIE v0.02 update... 0%")
            .setCancelable(false)
            .create();

        progressDialog.show();

        executor.execute(() -> {
            File apkFile = null;
            try {
                URL url = new URL(apkUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) ProzMovieApp/0.02");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(30000);
                conn.connect();

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP || responseCode == HttpURLConnection.HTTP_MOVED_PERM) {
                    String newUrl = conn.getHeaderField("Location");
                    conn = (HttpURLConnection) new URL(newUrl).openConnection();
                    conn.connect();
                }

                int fileLength = conn.getContentLength();

                File downloadDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (downloadDir == null) {
                    downloadDir = getCacheDir();
                }
                apkFile = new File(downloadDir, "PROZ-MOVIE-v0.02.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                InputStream input = conn.getInputStream();
                FileOutputStream output = new FileOutputStream(apkFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    if (fileLength > 0) {
                        final int progress = (int) (total * 100 / fileLength);
                        final long currentKb = total / 1024;
                        mainHandler.post(() -> {
                            progressDialog.setMessage("Downloading update... " + progress + "% (" + currentKb + " KB)");
                        });
                    }
                    output.write(data, 0, count);
                }

                output.flush();
                output.close();
                input.close();

                final File finalApkFile = apkFile;
                mainHandler.post(() -> {
                    progressDialog.dismiss();
                    installDownloadedApk(finalApkFile);
                });

            } catch (Exception e) {
                final String errorMsg = e.getMessage();
                mainHandler.post(() -> {
                    progressDialog.dismiss();
                    Toast.makeText(MainActivity.this, "Update download failed: " + errorMsg, Toast.LENGTH_LONG).show();
                });
            }
        });
    }

    private void installDownloadedApk(File apkFile) {
        if (apkFile == null || !apkFile.exists()) {
            Toast.makeText(this, "Downloaded file not found", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            Uri apkUri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                apkUri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", apkFile);
            } else {
                apkUri = Uri.fromFile(apkFile);
            }

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(installIntent);

        } catch (Exception e) {
            Toast.makeText(this, "Failed to launch installer: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            if (customViewCallback != null) {
                customViewCallback.onCustomViewHidden();
            }
            if (customViewContainer != null) {
                customViewContainer.removeView(customView);
                customView = null;
                customViewContainer.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        } else if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        executor.shutdown();
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
