import { Injectable } from "@angular/core";
import { SmsDatabaseProvider } from "../sms-database/sms-database";

@Injectable()
export class SmsProvider {
  smsDisabled = true;
  private _sms = null;
  watchingEnabled = false;

  constructor(private smsDatabase: SmsDatabaseProvider) {
    console.log("Hello SmsProvider Provider");
  }

  /**
   * Initialzied sms plugin
   */
  async init(): Promise<boolean> {
    console.log("Intizliaing SMS .....");
    const cordova = window["cordova"];
    if (!cordova) {
      console.log("Cordova not found");
      console.log("SMS intit failed");
      return Promise.resolve(false);
    }

    var permissions = cordova.plugins.permissions;
    if (!permissions) {
      console.log(
        'cordova plugin "cordova-plugin-android-permissions" is requred'
      );
      console.log("SMS intit failed");
      return Promise.resolve(false);
    }

    const hasSmsPermission = await new Promise(resolve =>
      permissions.hasPermission(
        permissions.READ_SMS,
        status => (status.hasPermission ? resolve(true) : resolve(false))
      )
    );

    if (!hasSmsPermission) {
      // grant new sms permission
      const permissionGranted = await new Promise(resolve =>
        permissions.requestPermission(
          permissions.READ_SMS,
          status => resolve(status.hasPermission),
          () => resolve(false)
        )
      );
      if (!permissionGranted) {
        alert("this app dosnt work without SMS permission");
        return Promise.resolve(false);
      }
    }

    // now we can handle sms messages
    this.smsDisabled = false;

    // start reading sms
    this._sms = window["SMS"];

    document.addEventListener("onSMSArrive", this.onSMSArrive.bind(this));

    console.log("SMS intizlied successfully ...");
    return Promise.resolve(true);
  }

  /**
   * Read SMS from device and store it on local database
   */
  public readSMS() {
    console.log("start reading messages ...");
    if (this.smsDisabled) {
      console.log("uabled to read SMS");
      return;
    }
    this._sms.listSMS(
      { maxCount: 100000 },
      async messages => {
        if (!Array.isArray(messages)) {
          console.log("got messages on unknown format", messages);
        }
        let messageCount = 0;
        let dbMessages = await this.smsDatabase.findAll();

        for (let msg of messages) {
          const msgExist = dbMessages.find(
            dbMsg =>
              dbMsg.body === msg.body &&
              dbMsg.date_sent === msg.date_sent &&
              msg.date === dbMsg.date
          );
          if (msgExist) {
            continue;
          }
          this.smsDatabase.create(msg);
          messageCount++;
        }

        console.log("Found SMS COUNT ======> " + messageCount);
      },
      err => {
        console.log("error list sms: " + err);
      }
    );
  }

  /**
   * Start watching for new incomming messages
   */
  public startWatching() {
    if (this.smsDisabled) {
      console.log("uabled to start watching");
      return;
    }

    this._sms.startWatch(
      () => {
        console.log("watching messages started ...");
        this.watchingEnabled = true;
      },
      () => {
        console.log("watching messages faild :(");
      }
    );
  }

  /**
   * Stop watching incomming messages
   */
  public stopWatching() {
    this._sms.stopWatch(
      () => {
        this.watchingEnabled = false;
        console.log("watching messages stopped.");
      },
      () => {
        console.log("faild to stop watching messages.");
      }
    );
  }

  /**
   * Handle incomming messages, you should call start watching first
   * @param e
   */
  private onSMSArrive(e) {
    var sms = e.data;
    this.smsDatabase.create(sms);
  }
}
