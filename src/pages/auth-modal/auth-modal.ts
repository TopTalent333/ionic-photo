import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { ModalController, NavController, Platform, ViewController } from 'ionic-angular';
import { UserProfile } from '../../models/UserProfile';
import { AuthService } from '../../services/AuthService';
import { CartService } from '../../services/CartService';
import { UserProfileService } from '../../services/UserProfileService';
import { Utilities } from '../../util/Utilities';
import { CheckoutPage } from '../checkout/checkout';

@Component({
    templateUrl: 'auth-modal.html'
})
export class AuthModal {

    constructor(
        private navCtrl: NavController,
        private viewCtrl: ViewController,
        private userProfileService: UserProfileService,
        private cartService: CartService,
        private util: Utilities,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private modalController: ModalController,
        private authService: AuthService
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Login/registratie keuze');
    }

    private async dismiss(): Promise<void> {
        await this.viewCtrl.dismiss();
    }

    private async login(): Promise<void> {
        await this.authService.authorize('login');
        // If successfull, redirect to the checkout page
        if (this.authService.loggedIn) this.viewCtrl.dismiss(CheckoutPage);
    }

    private async register(): Promise<void> {
        // Redirect to AUTH0 for regestering
        await this.authService.authorize('register');
        // Create user profile for fotosimpel
        await this.userProfileService.register();
        // Get the just created user profiel
        if (this.authService.loggedIn) await this.viewCtrl.dismiss(CheckoutPage);
    }

    private async anonymous(): Promise<void> {
        // Log out just in case
        this.userProfileService.logout(false);
        let userProfile = await this.userProfileService.get();
        if (userProfile) {
            this.cartService.setOrderUserProfileId(userProfile.id);
            this.cartService.setAvailableCredits(userProfile.credits);
            this.viewCtrl.dismiss(CheckoutPage);
        } else {
            let uuid = await this.util.getDeviceUuid();
            let newUserProfile = {
                uuid: uuid
            } as UserProfile
            let profile = await this.userProfileService.create(newUserProfile);

            this.cartService.setOrderUserProfileId(profile.id);
            await this.viewCtrl.dismiss(CheckoutPage);
        }
    }
}
