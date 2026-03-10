import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.conformeo.mobile",
  appName: "Conformeo",
  webDir: "dist/mobile",
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase"
    }
  }
};

export default config;
