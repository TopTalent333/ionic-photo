import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { ModalController, Platform, ViewController } from 'ionic-angular';
import { MemberGetsMemberPage } from '../../pages/member-gets-member/member-gets-member';
import { AuthService } from '../../services/AuthService';
import { UserProfileService } from '../../services/UserProfileService';

@Component({
    templateUrl: 'credit-info-modal.html'
})
export class CreditInfoModal {

    private authenticated: boolean = false;

    constructor(
        private viewCtrl: ViewController,
        private authService: AuthService,
        private modalCtrl: ModalController,
        private userProfileService: UserProfileService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private modalController: ModalController
    ) {
        this.authenticated = authService.authenticated();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Tegoed');
    }

    private async dismiss(): Promise<void> {
        await this.viewCtrl.dismiss();
    }

    private async login(): Promise<void> {
        await this.authService.authorize('login');
        this.authenticated = this.authService.loggedIn;
    }

    private async register(): Promise<void> {
        // Redirect to AUTH0 for regestering
        await this.authService.authorize('register');
        // Create user profile for fotosimpel
        await this.userProfileService.register();
        // Get the just created user profiel  
        if (this.authService.loggedIn) this.authenticated = this.authService.authenticated();
    }

    private async showReferralCode(): Promise<void> {
        let modal = this.modalCtrl.create(MemberGetsMemberPage);
        await modal.present();
    }
}