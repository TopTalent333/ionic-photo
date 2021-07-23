import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import Auth0Cordova from '@auth0/cordova';
import { Badge } from '@ionic-native/badge';
import { FCM } from '@ionic-native/fcm';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Alert, AlertController, ModalController, Nav, NavOptions, Platform } from 'ionic-angular';
import { NotificationController } from '../infra/notification-controller';
import { UserProfile } from '../models/UserProfile';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { CreditInfoModal } from '../pages/credit-info-modal/credit-info-modal';
import { HomePage } from '../pages/home/home';
import { MemberGetsMemberPage } from '../pages/member-gets-member/member-gets-member';
import { PricesPage } from '../pages/prices/prices';
import { SalesPage } from '../pages/sales/sales';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { AuthService } from '../services/AuthService';
import { NetworkService } from '../services/NetworkService';
import { NotificationService } from '../services/NotificationService';
import { UserProfileService } from '../services/UserProfileService';
import { Utilities } from '../util/Utilities';

@Component({
    templateUrl: 'app.html'
})
export class Fotosimpel {

    @ViewChild(Nav) nav: Nav;
    rootPage = HomePage;
    pages: Array<{ title: string, component: any }>;
    userProfile: UserProfile;
    authenticated: boolean = false;

    constructor(
        private platform: Platform,
        private notificationService: NotificationService,
        private alertController: AlertController,
        private userProfileService: UserProfileService,
        private modalCtrl: ModalController,
        private authService: AuthService,
        private detector: ChangeDetectorRef,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private badge: Badge,
        private networkService: NetworkService,
        private util: Utilities,
        private notificationController: NotificationController,
        private cloudMessaging: FCM
    ) {
        this.pages = [
            { title: 'Home', component: HomePage },
            { title: 'Prijzen', component: PricesPage },
            { title: 'Acties en kortingen', component: SalesPage },
            { title: 'Profiel', component: UserProfilePage },
            { title: 'Contact', component: ContactPage },
            { title: 'Over', component: AboutPage }
        ];

        this.initializeApp();
        this.networkService.RegisterConnectionListener();

        // Call this once to check the network after Cordova has done it's initialization.
        this.networkService.HasValidConnection();
    }

    public async onMenuOpening(): Promise<void> {
        this.userProfile = null;
        this.userProfile = await this.userProfileService.get();
        this.authenticated = this.authService.authenticated();
        this.detector.detectChanges();
    }

    private async initializeApp(): Promise<void> {
        this.authenticated = this.authService.authenticated();

        await this.platform.ready();

        // Redirect back to app after authenticating
        (window as any).handleOpenURL = (url: string) => {
            Auth0Cordova.onRedirectUri(url);
        }

        this.checkForNewNotifications();
        document.addEventListener('resume', this.onResume, false);
        if (this.platform.is('cordova')) {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();

            if (this.platform.is('android')) {
                this.statusBar.overlaysWebView(false);
                this.statusBar.backgroundColorByHexString('a91422');
            }

            // Clear the badge of the app to make sure any badges added by notifications are cleared on app init
            this.badge.clear();

            this.cloudMessaging.getToken()
                .then(async (token) => {
                    // TODO: Save token?
                }, (e) => this.notificationController.notifyError(e, '[app/getToken]'));

            // Make sure to save token when it changes
            this.cloudMessaging.onTokenRefresh()
                .subscribe(async (token) => {
                    // TODO: Save token?
                }, (e) => this.notificationController.notifyError(e, '[app/onTokenRefresh]'));

            // What to do when a notification has arrived
            this.cloudMessaging.onNotification()
                .subscribe(data => {
                    // if (data.wasTapped) {
                    //     console.log('tapped', data);
                    // } else {
                    //     console.log('already open', data);
                    // };
                }, (e) => this.notificationController.notifyError(e, '[app/onNotification]'));
        }
    }

    public onResume = async (): Promise<void> => {
        this.checkForNewNotifications();
        // Clear the badge of the app to make sure any badges added by notifications are cleared on app resume
        this.badge.clear();
        this.networkService.HasValidConnection();
    }

    private async checkForNewNotifications(): Promise<void> {
        if (this.authService.authenticated()) {
            let userProfile = await this.userProfileService.get();
            this.userProfile = userProfile;
            if (userProfile) {
                let notifications = await this.notificationService.get.checkForNew(userProfile.id)
                if (notifications && notifications.length > 0) {
                    // Notify the user about any new notifications/voucher codes
                    let alert: Alert = this.alertController.create({
                        title: 'Acties en kortingen',
                        subTitle: 'Er is een nieuwe actie of korting beschikbaar',
                        buttons: [
                            'Ok',
                            {
                                text: 'Bekijk actie overzicht',
                                handler: () => {
                                    let navOptions = {
                                        animate: true,
                                        direction: 'forward'
                                    } as NavOptions;
                                    this.nav.push(SalesPage, null, navOptions);
                                }
                            },]
                    });
                    await alert.present();
                }
            }
        }
    }

    /**
     * Opens the credit info modal
     */
    public async openCreditInfo(): Promise<void> {
        let modal = this.modalCtrl.create(CreditInfoModal);
        await modal.present();
    }

    /**
     * Opens the member gets member page
     */
    public async openMemberGetsMemberPage(): Promise<void> {
        let modal = this.modalCtrl.create(MemberGetsMemberPage);
        await modal.present();
    }

    /** Opens a page selected in the side menu */
    public async openPage(page: any): Promise<void> {
        let active = this.nav.getActive();
        if (active.isFirst() && page.title == 'Home') return;
        await this.nav.push(page.component);
    }
}
