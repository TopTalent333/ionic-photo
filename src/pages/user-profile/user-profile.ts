import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { ModalController, NavController, NavOptions, Platform, ToastController } from 'ionic-angular';
import { UserProfile } from '../../models/UserProfile';
import { AuthService } from '../../services/AuthService';
import { CartService } from '../../services/CartService';
import { UserProfileService } from '../../services/UserProfileService';
import { Utilities } from '../../util/Utilities';
import { CartPage } from '../cart/cart';
import { HomePage } from '../home/home';
import { UserProfileEditPage } from '../user-profile-edit/user-profile-edit';

@Component({
    templateUrl: 'user-profile.html'
})
export class UserProfilePage {

    private userProfile: UserProfile;

    constructor(
        private navCtrl: NavController,
        private cartService: CartService,
        private authService: AuthService,
        private userProfileService: UserProfileService,
        private utilities: Utilities,
        private toastController: ToastController,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private modalController: ModalController
    ) {
        this.userProfile = new UserProfile();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Klantgegevens');
    }

    private async ionViewWillEnter(): Promise<void> {
        this.userProfile = await this.userProfileService.get();

        console.log(this.authService.loggedIn, this.userProfile)
    }

    private async logout(): Promise<void> {
        await this.userProfileService.logout();
        let navOptions = {
            animate: true,
            direction: 'back'
        } as NavOptions;
        await this.navCtrl.setRoot(HomePage, null, navOptions);
    }

    private async navigateToCart(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

    private async edit(): Promise<void> {
        await this.navCtrl.push(UserProfileEditPage);
    }

    private async login(): Promise<void> {
        await this.authService.authorize('login');
        // If successfull, fetch the fotosimpel profile
        if (this.authService.loggedIn) this.userProfile = await this.userProfileService.get();
    }

    private async register(): Promise<void> {
        // Redirect to AUTH0 for regestering
        await this.authService.authorize('register');
        // Create user profile for fotosimpel
        await this.userProfileService.register();

        console.log('logged in 2', this.authService.loggedIn);
        // Get the just created user profiel
        if (this.authService.loggedIn) this.userProfile = await this.userProfileService.get();
    }

    private async copy(value: string): Promise<void> {
        this.utilities.copyToClipboard(value);
        let toast = this.toastController.create({
            message: 'Referentie code gekopieerd naar het klembord',
            duration: 1000,
            position: 'middle'
        });
        await toast.present();
    }
}
