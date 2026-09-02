# Android / Google Play Build

Status: Android source project added.

## Included

- Capacitor Android project: `android/`
- Package id: `com.phuclongcenter.app`
- App name: `1986`
- Scripts:
  - `npm run cap:sync:android`
  - `npm run cap:open:android`

## Important

The current Android source uses Capacitor production URL mode.

- Current `server.url`: `https://long.live`
- Change this to the final production domain before release if needed.
- Alternative later: update Next config/build pipeline to generate a complete static `out/`.

## AAB Build

To generate a Play Store `.aab`, use Android Studio or Gradle after configuring:

- Android SDK
- release signing keystore
- package name/versionCode/versionName
- privacy/data safety details

No keystore or store credential is included in this source package.
