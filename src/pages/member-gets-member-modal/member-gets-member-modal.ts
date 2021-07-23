import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AlertController, NavParams, Platform, ViewController } from 'ionic-angular';
import { NotificationController } from '../../infra/notification-controller';
import { AppSettings } from '../../settings/AppSettings';

@Component({
    templateUrl: 'member-gets-member-modal.html'
})
export class MemberGetsMemberModal {

    private canShare: boolean = false;
    private canShareEmail: boolean = false;
    private canShareWhatsApp: boolean = false;
    private referralCode: string;
    private appStoreLink: string;

    constructor(
        private navParams: NavParams,
        private viewCtrl: ViewController,
        private alertController: AlertController,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private socialSharing: SocialSharing,
        private notificationController: NotificationController
    ) {
        this.canShareEmail = navParams.get('canShareEmail') as boolean;
        this.canShareWhatsApp = navParams.get('canShareWhatsApp') as boolean;
        this.referralCode = navParams.get('referralCode') as string;

        if (this.canShareEmail || this.canShareWhatsApp)
            this.canShare = true;
    }

    private async ionViewWillEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Referentiecode delen');
    }

    private async ionViewDidLoad(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('ios'))
            this.appStoreLink = AppSettings.appleAppStore;
        if (this.platform.is('android'))
            this.appStoreLink = AppSettings.googlePlayStore;
    }

	/**
	 * Dismisses the modal
	 */
    private async dismiss(): Promise<void> {
        await this.viewCtrl.dismiss();
    }

    /** Shares referral code via e-mail */
    private async shareEmail(): Promise<void> {
        let shareMessage = AppSettings.shareMessage
            .replace('{referralCode}', this.referralCode)
            .replace('{appStoreLink}', this.appStoreLink);
        let shareSubject = AppSettings.shareSubject.replace('{referralCode}', this.referralCode);

        try {
            let sharedViaEmail = await this.socialSharing.shareViaEmail(shareMessage, shareSubject, []);
            if (sharedViaEmail && this.platform.is('cordova'))
                await this.googleAnalytics.trackEvent('Member gets member share', 'email');
        } catch (error) {
            this.notificationController.notifyError(`Error while sharing referral code ${this.referralCode} via e-mail, see error body for more details.`, {
                error: error
            });
        }
    }

    /** Shares referral code via WhatsApp */
    private async shareWhatsApp(): Promise<void> {
        let shareMessage = AppSettings.shareMessage
            .replace('{referralCode}', this.referralCode)
            .replace('{appStoreLink}', this.appStoreLink);

        try {
            let sharedViaWhatsApp = await this.socialSharing.shareViaWhatsApp(shareMessage);
            if (sharedViaWhatsApp && this.platform.is('cordova'))
                await this.googleAnalytics.trackEvent('Member gets member share', 'WhatsApp');
        } catch (error) {
            this.notificationController.notifyError(`Error while sharing referral code ${this.referralCode} via WhatsApp, see error body for more details.`, {
                error: error
            });
        }
    }
}
