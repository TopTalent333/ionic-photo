import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NavController, NavOptions, Platform } from 'ionic-angular';
import { CartService } from '../../services/CartService';
import { CartPage } from '../cart/cart';

@Component({
    templateUrl: 'contact.html'
})
export class ContactPage {

    constructor(
        private navCtrl: NavController,
        private cart: CartService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private inAppBrowser: InAppBrowser
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Contact');
    }

    private async navigateToCart(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

    /**
     * Opens the social media link in a in app browser
     * @param url The url to open
     */
    private openUrl(url: string): void {
        this.inAppBrowser.create(url, '_blank');
    }
}