/**
 * Capacitor — đóng gói web app thành iOS / Android
 * Không import @capacitor/cli để Next.js/Vercel build không phụ thuộc package mobile.
 * Sau khi deploy web, trỏ server.url tới production (vd. https://phuclongtivi.com).
 */
const config = {
  appId: 'com.phuclongcenter.app',
  appName: '1986',
  webDir: 'out',
  server: {
    // Fast store path: load the deployed web app. Change this to the final production domain before release if needed.
    url: 'https://long.live',
    androidScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
