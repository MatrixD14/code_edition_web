package com.app.apk.android;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.app.apk.core.AppCore;

public class MainActivity extends Activity {

    private AppCore core = new AppCore();

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);

        Button resetBt = new Button(this);
        resetBt.setText("Resetar");
        resetBt.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "Resetado!", Toast.LENGTH_SHORT).show();
            }
        });

        layout.addView(resetBt);

        setContentView(layout);
    }
}
