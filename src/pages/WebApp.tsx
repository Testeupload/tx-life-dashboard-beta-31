import React from "react";
import { WebView } from "react-native-webview";

export default function WebApp() {
  return (
    <WebView
      source={{ uri: "https://preview--tx-life-dashboard-beta-31.lovable.app/" }}
      style={{ flex: 1, height: "100vh" }}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
    />
  );
}
