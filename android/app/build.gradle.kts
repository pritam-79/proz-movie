plugins {
    id("com.android.application")
}

android {
    namespace = "com.prozmovie.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.prozmovie.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 6
        versionName = "0.06"
    }

    signingConfigs {
        create("release") {
            storeFile = file("../proz.keystore")
            storePassword = "prozmovie123"
            keyAlias = "prozkey"
            keyPassword = "prozmovie123"
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
}

dependencies {
    implementation("androidx.core:core:1.15.0")
}
