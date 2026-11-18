package com.prozmovie.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
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
import android.widget.ProgressBar;

public class MainActivity extends Activity {

    private WebView webView;
    private FrameLayout customViewContainer;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private View customView;
    private ProgressBar progressBar;

    // Production hosted server on Vercel
    private static final String PRODUCTION_URL = "https://proz-movie.vercel.app";

    public class WebAppInterface {
        @JavascriptInterface
        public void reconnect() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (webView != null) {
                        webView.loadUrl(PRODUCTION_URL);
                    }
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Configure Immersive Status & Nav Bars matching Liquid Glass theme
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

        // Load the live hosted platform
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

        // Hardware acceleration
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Cookies management for auth & cross-origin streaming
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        }

        // Bridge for native retry handling
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidHost");

        // Set WebChromeClient for Fullscreen Video Playback & Progress
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
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return false; // Load inside WebView
                }
                // Handle external apps (e.g. intent:, market:, mailto:)
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                } catch (Exception ignored) {
                    return true;
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // CRITICAL: Only trigger offline screen if the MAIN FRAME fails to load.
                // Sub-resource errors (missing icons, 404 posters, blocked tracking) MUST NOT break the app.
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (!request.isForMainFrame()) {
                        return;
                    }
                }
                showOfflineScreen();
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Deprecated fallback for older Android devices
                if (failingUrl != null && (failingUrl.equals(PRODUCTION_URL) || failingUrl.equals(PRODUCTION_URL + "/"))) {
                    showOfflineScreen();
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Handle mobile network ISP cert chains smoothly
                handler.proceed();
            }
        });
    }

    private void showOfflineScreen() {
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
            "setTimeout(tryReconnect, 5000);" +
            "</script>" +
            "</head>" +
            "<body>" +
            "<div class='spinner'></div>" +
            "<h1>PROZ ENTERTAINMENT</h1>" +
            "<p>Connecting to streaming server... Tap below to reconnect.</p>" +
            "<button id='btn' class='btn' onclick='tryReconnect()'>Reconnect</button>" +
            "</body></html>";

        // Load with PRODUCTION_URL as base so origin is legitimate
        webView.loadDataWithBaseURL(PRODUCTION_URL, offlineHtml, "text/html", "UTF-8", PRODUCTION_URL);
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            // Exit fullscreen video
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
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
