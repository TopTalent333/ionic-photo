import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Loading, LoadingController, ModalController, NavController, NavOptions, Platform, Toast, ToastController } from 'ionic-angular';
import { DiscountTypes } from '../../enums/DiscountTypes';
import { Voucher } from '../../models/Voucher';
import { AuthService } from '../../services/AuthService';
import { CartService } from '../../services/CartService';
import { NotificationService } from '../../services/NotificationService';
import { UserProfileService } from '../../services/UserProfileService';
import { VoucherService } from '../../services/VoucherService';
import { Utilities } from '../../util/Utilities';
import { CartPage } from '../cart/cart';

@Component({
    templateUrl: 'sales.html'
})
export class SalesPage {

    private vouchers: Voucher[] = [];
    private discountTypes: typeof DiscountTypes = DiscountTypes;
    private vouchersLoaded: boolean = false;

    constructor(
        private navCtrl: NavController,
        private notificationService: NotificationService,
        private authService: AuthService,
        private cartService: CartService,
        private voucherService: VoucherService,
        private utilities: Utilities,
        private toastController: ToastController,
        private loadingCtrl: LoadingController,
        private userProfileService: UserProfileService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private modalController: ModalController,
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Acties en Kortingen');
    }

    private async ionViewWillEnter(): Promise<void> {
        await this.checkForSales();
    }

    private async selectVoucher(voucher: Voucher): Promise<void> {
        // The coupon code came from a notification, therefore we can assume it is valid
        this.cartService.applyVoucher(voucher);
        await this.voucherService.saveVoucher(voucher);

        let toast: Toast = this.toastController.create({
            message: `Korting met code '${voucher.code}' is toegepast`,
            duration: 3000,
            position: 'bottom'
        });
        await toast.present();
    }

    private async navigateToCart(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.setRoot(CartPage, null, navOptions);
    }

    private async login(): Promise<void> {
        await this.authService.authorize('login');
        this.checkForSales();
    }

    private async register(): Promise<void> {
        // Redirect to AUTH0 for regestering
        await this.authService.authorize('register');
        // Create user profile for fotosimpel
        await this.userProfileService.register();

        this.checkForSales();
    }

    private async checkForSales(): Promise<void> {
        if (this.authService.authenticated()) {
            let loader: Loading = this.loadingCtrl.create();
            await loader.present();
            let notifications = await this.notificationService.get.current();
            let promises = notifications.map(notification => this.voucherService.validateVoucherCode(notification.couponCode))
            let vouchers = await Promise.all(promises);
            this.vouchers = vouchers.filter(voucher => voucher.hasValidCode);
            this.vouchersLoaded = true;
            await loader.dismiss();
        }
    }
}
