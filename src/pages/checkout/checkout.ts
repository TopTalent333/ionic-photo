import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Keyboard } from '@ionic-native/keyboard';
import { Alert, AlertController, LoadingController, ModalController, NavController, Platform } from 'ionic-angular';
import { ProductTypes } from '../../enums/ProductTypes';
import { NotificationController } from '../../infra/notification-controller';
import { UserProfile } from '../../models/UserProfile';
import { Voucher } from '../../models/Voucher';
import { AuthService } from '../../services/AuthService';
import { CartService } from '../../services/CartService';
import { NetworkService } from '../../services/NetworkService';
import { OrderService } from '../../services/OrderService';
import { UserProfileService } from '../../services/UserProfileService';
import { VoucherService } from '../../services/VoucherService';
import { ModelValidators } from '../../util/ModelValidators';
import { Utilities } from '../../util/Utilities';
import { UploadPage } from '../upload/upload';
import { UserProfileEditPage } from '../user-profile-edit/user-profile-edit';

@Component({
    templateUrl: 'checkout.html'
})
export class CheckoutPage {

    private types: Array<any> = [];
    private voucher: Voucher;
    private total: number = 0;
    private shippingcosts: number = 0;
    private subtotal: number = 0;
    private totalWithDiscount: number = 0;
    private userProfile: UserProfile;
    private usedCredits: number = 0;
    private availableCredits: number = 0;
    private totalWithoutDiscount: number = 0;
    private showUserData: boolean = false;
    private disableSendButton = false;
    private freeShipping = false;

    constructor(
        private navCtrl: NavController,
        private cartService: CartService,
        private voucherService: VoucherService,
        private orderService: OrderService,
        private formBuilder: FormBuilder,
        private util: Utilities,
        private alertController: AlertController,
        private userProfileService: UserProfileService,
        private authService: AuthService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private loadingController: LoadingController,
        private networkService: NetworkService,
        private keyboard: Keyboard,
        private notificationController: NotificationController,
        private modalController: ModalController
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Besteloverzicht');
    }

    private async ionViewWillEnter(): Promise<void> {
        this.disableSendButton = false;
        await this.refreshData();
    }

    /**
    * Opens the login page
    */
    private async login(): Promise<void> {
        await this.authService.authorize('login');
        if (this.authService.loggedIn) this.userProfile = await this.userProfileService.get();
    }

    /**
     * Opens the register page
     */
    private async register(): Promise<void> {
        // Redirect to AUTH0 for regestering
        await this.authService.authorize('register');
        // Create user profile for fotosimpel
        await this.userProfileService.register();
        // Get the just created user profiel
        if (this.authService.loggedIn) this.userProfile = await this.userProfileService.get();
    }

    /**
     * Refreshes all data on checkout screen
     */
    private async refreshData(): Promise<void> {
        // Get current user profile
        this.userProfile = await this.userProfileService.get();
        if (this.userProfile) {
            this.availableCredits = this.cartService.availableCredits;
            this.showUserData = this.userProfile.firstname != null;
        }
        // Get current voucher if any is available
        this.voucher = await this.voucherService.getVoucher()
        this.cartService.applyVoucher(this.voucher);
        // Calculate the prices
        await this.calculateCheckoutPrices();

        // Reset old data
        this.types = [];
        // Group the products by type and variation
        let orderlines = this.cartService.getOrderlines();
        orderlines.map(line => {
            // Check if we already have a group of this product type, if not, create one
            if (!this.types.some(g => g.name == line.product.type))
                this.types.push({
                    name: line.product.type,
                    variations: [],
                });
            // Fetch the group for this product type
            let type = this.types.find(t => t.name == line.product.type);
            // Check if we already have a group of this product varation, if not, create one
            if (!type.variations.some(g => g.name == line.product.variation.code))
                type.variations.push({
                    name: line.product.variation.code,
                    amount: 0,
                    totalPrice: 0,
                    height: line.product.variation.height,
                    width: line.product.variation.width
                });
            // Fetch the group for this product varitaion
            let variation = type.variations
                .find(v => v.name == line.product.variation.code);

            // Add this line to the variation and add it up to the totals
            variation.amount += line.quantity;
            variation.totalPrice += line.product.variation.price * line.quantity;
        });
    }

    /**
     * Calculates all visible prices in the checkout
     */
    private async calculateCheckoutPrices(): Promise<void> {
        let totalResponse = await this.cartService.calculateTotal();
        this.subtotal = totalResponse.subtotal;
        this.total = totalResponse.total;
        this.freeShipping = totalResponse.freeShipping;
        this.shippingcosts = totalResponse.shippingCosts;
        this.totalWithoutDiscount = totalResponse.totalWithoutDiscount;
        // Only set this if we actually have discount substracted from the total
        this.totalWithDiscount = totalResponse.usedCredits > 0 || totalResponse.voucherDiscount > 0 ? totalResponse.total : 0;
        this.usedCredits = totalResponse.usedCredits;
    }

    /**
     * Translates a product type enum to a readable string
     * @param type The product type
     */
    private translate(type: ProductTypes): string {
        switch (type) {
            case ProductTypes.print:
                return "Foto";
            case ProductTypes.canvas:
                return "Canvas";
            case ProductTypes.poster:
                return "Poster";
            default:
                return "Onbekend";
        }
    }

    private async submit(): Promise<void> {
        if (!this.networkService.connected) {
            let alert: Alert = this.alertController.create({
                title: 'Helaas..',
                subTitle: 'Geen internet verbinding, probeer later opnieuw',
                buttons: ['OK']
            });
            await alert.present();
            return;
        }

        this.disableSendButton = true;
        let userProfile = await this.userProfileService.get();
        let loader = this.loadingController.create();
        await loader.present();

        let customerForm = this.formBuilder.group({
            title: [userProfile.title || '', [Validators.required, ModelValidators.trimmedNotEmpty]],
            firstname: [userProfile.firstname || '', [Validators.required, ModelValidators.trimmedNotEmpty]],
            lastname: [userProfile.lastname || '', [Validators.required, ModelValidators.trimmedNotEmpty]],
            company: [userProfile.company || '', [ModelValidators.trimmedNotEmpty]],
            email: [userProfile.email || '', [Validators.required, ModelValidators.trimmedNotEmpty, ModelValidators.emailValid]],
            address: [userProfile.address || '', [Validators.required, ModelValidators.trimmedNotEmpty]],
            zip: [userProfile.zip || '', [Validators.required, ModelValidators.trimmedNotEmpty]],
            city: [userProfile.city || '', [Validators.required, ModelValidators.trimmedNotEmpty]]
        });

        if (customerForm.valid) {
            try {
                let voucher = await this.voucherService.getVoucher();
                let order = this.cartService.getOrder();
                order.usedCredits = this.usedCredits;
                // The api needs a total without the shipping costs
                let total = this.voucher || this.usedCredits > 0 ? this.totalWithDiscount : this.total;
                total = this.freeShipping ? total - 0 : total -= this.shippingcosts;
                if (total < 0) total = 0;
                order.shippingCost = this.freeShipping ? 0 : this.shippingcosts;
                order.price = Math.round(total * 100) / 100;
                // Track if the user tries to submit edited images in Google GoogleAnalytics
                let modifiedImageCount = 0;
                for (let orderline of order.orderlines) {
                    if (orderline.image.modified)
                        modifiedImageCount++;
                }
                this.googleAnalytics.trackEvent('Order', 'Foto', 'Bewerkt', modifiedImageCount);

                if (voucher) {
                    order.coupon = voucher.code
                    voucher = await this.voucherService.validateVoucherCode(voucher.code);
                    if (!voucher.hasValidCode) {
                        const alert: Alert = this.alertController.create({
                            title: 'Helaas..',
                            subTitle: 'Deze code die u heeft ingesteld is niet (meer) geldig',
                            buttons: ['OK']
                        });
                        await loader.dismiss();
                        await alert.present();
                        return;
                    }

                    await this.orderService.save(order);
                    await loader.dismiss();
                    await this.navCtrl.push(UploadPage, { orderPrice: this.totalWithDiscount });
                } else {
                    const orderId = await this.orderService.save(order);
                    this.cartService.setOrderId(orderId);
                    await loader.dismiss();
                    await this.navCtrl.push(UploadPage, { orderPrice: this.total });
                }
            } catch (error) {
                this.notificationController.notifyError(`Error while submitting the order, see error body for more details.`, {
                    error: error
                });
                // Re-enable the send button as the user can try again
                this.disableSendButton = false;
                // Notify the user something went wrong
                let alert = this.alertController.create({
                    title: 'Oei, er ging iets mis',
                    subTitle: 'Probeer het later nog eens',
                    buttons: ['OK']
                });
                await alert.present();
                await loader.dismiss();
            }
        } else {
            await loader.dismiss();
            await this.navCtrl.push(UserProfileEditPage);
        }
    }

    /**
     * Opens a prompt for entering a voucher code
     */
    private async showVoucherPrompt(): Promise<void> {
        let alert = this.alertController.create({
            title: 'Vouchercode- of referentiecode invoeren',
            inputs: [
                {
                    name: 'vouchercode',
                    placeholder: 'Vouchercode / referentiecode'
                }
            ],
            buttons: [
                {
                    text: 'Annuleren',
                    role: 'cancel',
                    handler: data => this.keyboard.hide()
                },
                {
                    text: 'Toevoegen',
                    handler: data => {
                        // Force close the keyboard, was necessary for iOS
                        this.keyboard.hide();
                        this.voucherService.validateVoucherCode(data.vouchercode)
                            .then(voucher => {
                                // If we have an error
                                if (voucher.error) {
                                    let alert = this.alertController.create({
                                        title: 'Oei, er ging iets mis',
                                        subTitle: 'Probeer het later nog eens',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                                    return;
                                }
                                // If the code is not valid
                                if (!voucher.hasValidCode) {
                                    let alert = this.alertController.create({
                                        title: 'Helaas..',
                                        subTitle: 'Deze code is niet (meer) geldig',
                                        buttons: ['OK']
                                    });
                                    alert.present();
                                    return;
                                }
                                // we have a valid code
                                this.voucher = voucher;
                                this.cartService.applyVoucher(voucher);
                                this.calculateCheckoutPrices();
                                this.voucherService.saveVoucher(voucher);
                            });
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * Removes the current voucher
     */
    private async removeCurrentVoucher(): Promise<void> {
        this.voucher = null;
        this.cartService.removeCurrentVoucher();
        this.voucherService.removeVoucher();
        await this.calculateCheckoutPrices();
    }

    private async editUserProfile(): Promise<void> {
        await this.navCtrl.push(UserProfileEditPage);
    }
}
