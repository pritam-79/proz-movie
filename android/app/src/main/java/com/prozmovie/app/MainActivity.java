package com.prozmovie.app;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;

public class MainActivity extends Activity {

    private WebView webView;
    private FrameLayout customViewContainer;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private View customView;
    private ProgressBar progressBar;

    // Default connection endpoints:
    // When running in an Android Emulator, 10.0.2.2 maps to the host's localhost:3000
    private static final String EMULATOR_URL = "http://10.0.2.2:3000";
    private static final String LOCAL_URL = "http://localhost:3000";
    private static final String PRODUCTION_URL = "https://prozmovie.com";

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
        progressBar = findViewById(R.id.progressBar);

        configureWebView();

        // Determine initial load URL
        String targetUrl = isRunningOnEmulator() ? EMULATOR_URL : LOCAL_URL;
        webView.loadUrl(targetUrl);
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

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Custom User Agent identifier
        String defaultUa = settings.getUserAgentString();
        settings.setUserAgentString(defaultUa + " ProzMovieApp/1.0.0 (Android; LiquidGlass)");

        // Set WebChromeClient for Fullscreen Video Playback
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

        // Set WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // If local dev server is starting, show a graceful retry screen
                String offlineHtml = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                    "<style>body{background:#080B12;color:#F8FAFC;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;text-align:center;}" +
                    "h1{color:#22D3EE;font-size:24px;margin-bottom:8px;}p{color:#94A3B8;font-size:13px;line-height:1.6;max-width:320px;}" +
                    "button{background:linear-gradient(135deg,#8B5CF6,#22D3EE);color:#fff;border:none;padding:12px 28px;border-radius:99px;font-weight:bold;margin-top:20px;font-size:14px;cursor:pointer;box-shadow:0 0 20px rgba(34,211,238,0.4);}</style></head>" +
                    "<body><h1>PROZ MOVIE</h1><p>Connecting to streaming server... Tap below to reconnect or ensure host is online.</p>" +
                    "<button onclick='location.reload()'>Reconnect</button></body></html>";
                view.loadDataWithBaseURL(null, offlineHtml, "text/html", "UTF-8", null);
            }
        });
    }

    private boolean isRunningOnEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86");
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            // Exit fullscreen video
            WebChromeClient client = new WebChromeClient();
            client.onHideCustomView();
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
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
