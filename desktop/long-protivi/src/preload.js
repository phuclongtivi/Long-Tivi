const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("longProTiviDesktop", {
  platform: process.platform,
  version: "0.1.0",
  productName: "Long ProTivi",
});
