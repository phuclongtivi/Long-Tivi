const { app, BrowserWindow, shell, dialog, Menu } = require("electron");

const LONG_PROTIVI_URL = process.env.LONG_PROTIVI_URL || "https://protivi.phuclong.xyz";

app.setName("Long ProTivi");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1180,
    minHeight: 720,
    backgroundColor: "#f8fbff",
    title: "Long ProTivi",
    show: false,
    webPreferences: {
      preload: require("path").join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://protivi.phuclong.xyz") || url.startsWith("https://long.live") || url.startsWith("https://www.phuclongtivi.com")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ["media", "camera", "microphone", "display-capture", "notifications"];
    callback(allowed.includes(permission));
  });

  win.loadURL(LONG_PROTIVI_URL).catch(async () => {
    await dialog.showMessageBox({
      type: "warning",
      title: "Long ProTivi",
      message: "Chưa mở được Long ProTivi.",
      detail: "Vui lòng kiểm tra Internet hoặc URL https://protivi.phuclong.xyz.",
    });
  });

  return win;
}

function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: "Long ProTivi",
      submenu: [
        {
          label: "Mở Long ProTivi",
          click: (_, focusedWindow) => {
            if (focusedWindow) focusedWindow.loadURL(LONG_PROTIVI_URL);
          },
        },
        {
          label: "Mở bằng trình duyệt",
          click: () => shell.openExternal(LONG_PROTIVI_URL),
        },
        { type: "separator" },
        {
          label: "Thông tin bản quyền",
          click: async () => {
            await dialog.showMessageBox({
              type: "info",
              title: "Long ProTivi",
              message: "Long ProTivi",
              detail:
                "Phúc Long Center\nViệt Yên, Hưng Yên Province, Việt Nam\nwww.phuclongtivi.com\nsuperBUY, LIVE, Trợ lý AI\nCopyright © 2026 Phúc Long Center. Bảo lưu mọi quyền.",
            });
          },
        },
        { type: "separator" },
        { role: "quit", label: "Thoát" },
      ],
    },
    {
      label: "Xem",
      submenu: [
        { role: "reload", label: "Tải lại" },
        { role: "togglefullscreen", label: "Toàn màn hình" },
        { role: "resetZoom", label: "Cỡ chữ mặc định" },
        { role: "zoomIn", label: "Phóng to" },
        { role: "zoomOut", label: "Thu nhỏ" },
      ],
    },
  ]);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildMenu());
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
