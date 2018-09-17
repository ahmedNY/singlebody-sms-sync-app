import { Component } from "@angular/core";
import { Platform, ModalController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { BackgroundMode } from "@ionic-native/background-mode";

import { SmsProvider } from "../providers/sms/sms";
import { HomePage } from "../pages/home/home";
import { SmsDatabaseProvider } from "../providers/sms-database/sms-database";
import { SettingInterface } from "../types";
import { SETTINGS } from "../constants";
import { Autostart } from "@ionic-native/autostart";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(
    private platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    modalCtrl: ModalController,
    private sms: SmsProvider,
    private smsDatabase: SmsDatabaseProvider,
    private backgroundMode: BackgroundMode,
    private autostart: Autostart
  ) {
    platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      // load settings form local database
      let settings: SettingInterface = JSON.parse(
        localStorage.getItem(SETTINGS)
      );

      //
      if (!settings) {
        settings = await new Promise(resolve => {
          const modal = modalCtrl.create("SettingsPage");
          modal.onDidDismiss(async data => {
            resolve(data);
          });
          modal.present();
        });
      }

      this.readAndWatchSMS(settings);

      this.backgroundMode.disableWebViewOptimizations();
      this.backgroundMode.overrideBackButton();
      this.backgroundMode.excludeFromTaskList();
      this.backgroundMode.setDefaults({
        title: "SMS Sync Client",
        text: "Watching incomming messages"
      });

      if (settings.backgroundModeEnabled) {
        this.backgroundMode.enable();
      }

      if (settings.autostartEnabled) {
        this.autostart.enable();
      }
    });
  }

  async readAndWatchSMS(settings: SettingInterface): Promise<any> {
    if (this.smsDatabase.isConnected() === false) {
      console.log(
        "db not connected, init database with this settings",
        settings
      );
      this.smsDatabase.initDatabase(settings);
    }
    // read and watch sms messages
    const smsIntialzlied = await this.sms.init(); // initialize sms provider
    if (!smsIntialzlied) {
      this.platform.exitApp();
      return;
    }
    await this.sms.readSMS(); // read messages from phone
    this.sms.startWatching(); // watch for new messages
  }
}
