import { Component } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NavController, NavOptions, Platform } from 'ionic-angular';
import { CartService } from '../../services/CartService';
import { CartPage } from '../cart/cart';

@Component({
    templateUrl: 'about.html'
})
export class AboutPage {

    private version: string | number;

    constructor(
        public navCtrl: NavController,
        public cart: CartService,
        public platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private inAppBrowser: InAppBrowser,
        private appVersion: AppVersion
    ) { }

    private async ionViewDidLoad(): Promise<void> {
        await this.setVersionNumber();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Over ons');
    }

    private async navigateToCart(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

    private openUrl(url: string): void {
        this.inAppBrowser.create(url, '_blank');
    }

    private async setVersionNumber(): Promise<void> {
        if (this.platform.is('cordova')) {
            this.version = await this.appVersion.getVersionNumber();

            if (!this.version)
                this.version = await this.appVersion.getVersionCode();
        }
    }
}
