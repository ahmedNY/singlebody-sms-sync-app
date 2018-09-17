import { NgModule, ErrorHandler } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { BackgroundMode } from "@ionic-native/background-mode";
import { Autostart } from "@ionic-native/autostart";

import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { SmsDatabaseProvider } from "../providers/sms-database/sms-database";
import { SmsProvider } from "../providers/sms/sms";

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    SmsDatabaseProvider,
    SmsProvider,
    BackgroundMode,
    Autostart
  ]
})
export class AppModule {}
