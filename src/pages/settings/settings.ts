import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { SettingInterface } from "../../types";
import { SmsDatabaseProvider } from "../../providers/sms-database/sms-database";
import { SETTINGS } from "../../constants";
import { BackgroundMode } from "@ionic-native/background-mode";
import { Autostart } from "@ionic-native/autostart";

@IonicPage()
@Component({
  selector: "page-settings",
  templateUrl: "settings.html"
})
export class SettingsPage {
  public settings: SettingInterface =
    JSON.parse(localStorage.getItem(SETTINGS)) || {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private smsDatabase: SmsDatabaseProvider,
    private backgroundMode: BackgroundMode,
    private autostart: Autostart
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad SettingsPage");
  }

  async save() {
    const result = await this.smsDatabase.initDatabase(this.settings);
    if (!result) {
      alert("Faild to connect to database");
      return;
    }
    if (this.settings.autostartEnabled) {
      this.autostart.enable();
    } else {
      this.autostart.disable();
    }

    if (this.settings.backgroundModeEnabled) {
      this.backgroundMode.enable();
    } else {
      this.backgroundMode.disable();
      this.backgroundMode.disableWebViewOptimizations();
    }

    localStorage.setItem(SETTINGS, JSON.stringify(this.settings));
    this.viewCtrl.dismiss(this.settings);
  }
}
