import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Loading, LoadingController, ModalController, Platform, ToastController, ViewController } from 'ionic-angular';
import { UserProfile } from '../../models/UserProfile';
import { UserProfileService } from '../../services/UserProfileService';
import { AppSettings } from '../../settings/AppSettings';
import { Utilities } from '../../util/Utilities';
import { MemberGetsMemberModal } from '../member-gets-member-modal/member-gets-member-modal';

@Component({
    templateUrl: 'member-gets-member.html'
})
export class MemberGetsMemberPage {

    private userProfile: UserProfile;
    private canShare: boolean = true;
    private canShareWhatsApp: boolean = false; Ï
    private canShareEmail: boolean = false;

    private loading: Loading;

    constructor(
        private userProfileService: UserProfileService,
        private viewCtrl: ViewController,
        private modalCtrl: ModalController,
        private util: Utilities,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private socialSharing: SocialSharing
    ) { }

    private async ionViewWillEnter(): Promise<void> {
        this.loading = this.loadingCtrl.create();
        await this.loading.present();

        this.userProfile = await this.userProfileService.get();
        await this.checkSocialShares();

        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Member get Member');
    }

	/**
	 * Dismisses the modal
	 */
    private async dismiss(): Promise<void> {
        await this.viewCtrl.dismiss();
    }

	/** Copies the referral code to the clipboard
	 * @param code The code to copy
	 */
    private async copyToClipboard(code: string): Promise<void> {
        this.util.copyToClipboard(code);
        let toast = this.toastCtrl.create({
            message: 'Referentie code is gekopieerd naar het klembord',
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }

    /** Checks if there are any social share methods available */
    private async checkSocialShares(): Promise<void> {
        try {
            await this.socialSharing.canShareViaEmail();
            this.canShare = true;
            this.canShareEmail = true;
        } catch (error) {
            this.canShareEmail = false;
        }

        try {
            await this.socialSharing.canShareVia('whatsapp', AppSettings.shareMessage);
            this.canShare = true;
            this.canShareWhatsApp = true;
        } catch (error) {
            this.canShareWhatsApp = false
        }

        await this.loading.dismiss();
    }

    /** Presents a modal which provides sharing options */
    private async shareModal(): Promise<void> {
        let modal = this.modalCtrl.create(MemberGetsMemberModal, {
            canShareEmail: this.canShareEmail,
            canShareWhatsApp: this.canShareWhatsApp,
            referralCode: this.userProfile.referralCode
        });
        await modal.present();
    }
}
