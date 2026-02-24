package com.amavibrand.app;

import android.os.Bundle;
import android.view.View; // Añadimos este import
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Forma más segura de aplicar el ajuste
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setFitsSystemWindows(true);
        }
    }
}