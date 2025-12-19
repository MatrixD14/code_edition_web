package com.app.apk.core;

public class AppCore {

    private int counter = 0;

    public String click() {
        counter++;
        return "Cliques: " + counter;
    }
}
