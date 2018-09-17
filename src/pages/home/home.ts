import { Component } from "@angular/core";
import { NavController, NavParams, ModalController } from "ionic-angular";
import { SmsProvider } from "../../providers/sms/sms";

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private sms: SmsProvider
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad HomePage");
  }

  opeSettingsnModal() {
    const modal = this.modalCtrl.create("SettingsPage");
    modal.present();
  }

  watchingEnabled() {
    return this.sms.watchingEnabled;
  }

  toggled() {
    console.log("Toggled");
  }
}
