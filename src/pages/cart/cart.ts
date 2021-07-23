import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Modal, ModalController, NavController, NavOptions, Platform } from 'ionic-angular';
import { OrderlineOperation } from '../../enums/OrderlineOperation';
import { Orderline } from '../../models/Orderline';
import { SelectionModel } from '../../models/SelectionModel';
import { AuthService } from '../../services/AuthService';
import { CartService } from '../../services/CartService';
import { UserProfileService } from '../../services/UserProfileService';
import { Utilities } from '../../util/Utilities';
import { AuthModal } from '../auth-modal/auth-modal';
import { CheckoutPage } from '../checkout/checkout';
import { HomePage } from '../home/home';

@Component({
    templateUrl: 'cart.html'
})
export class CartPage {

    private subtotal: number = 0;

    constructor(
        private navCtrl: NavController,
        public cartService: CartService,
        public util: Utilities,
        private modalController: ModalController,
        private authService: AuthService,
        private userProfileService: UserProfileService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Winkelwagen');
    }

    private async ionViewWillEnter() {
        let totalResponse = await this.cartService.calculateTotal();
        this.subtotal = totalResponse.subtotal;
        this.removeLastProductPageFromNavStack();
    }

    /** Navigate to home so another product can be picked */
    private async addOrderline(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'back'
        } as NavOptions;
        await this.navCtrl.setRoot(HomePage, null, navOptions);
    }

    /**
     * Edits an existing orderline
     * @param orderline The orderline to edit
     * @param index The index of the orderline to edit
     */
    private async edit(orderline: Orderline, index: number): Promise<void> {
        let component = Utilities.selectComponent(orderline.product.variation.component);
        await this.navCtrl.push(component, {
            selection: <SelectionModel>{
                images: orderline.mosaicImages && orderline.mosaicImages.length > 0 ? orderline.mosaicImages : [orderline.image],
                product: orderline.product,
                operation: OrderlineOperation.edit,
                index: index,
                quantity: orderline.quantity
            }
        });
    }

    /**
     * Deletes an orderline from the order
     */
    private async delete(orderline: Orderline): Promise<void> {
        await this.cartService.removeOrderline(orderline);
        let totalResponse = await this.cartService.calculateTotal();
        this.subtotal = totalResponse.subtotal;
    }

    private async checkout(): Promise<void> {
        // Ask the user to login/register or continue as anonymous
        if (!this.authService.authenticated()) {
            let modal: Modal = this.modalController.create(AuthModal);
            modal.onWillDismiss(component => {
                if (component) this.navCtrl.push(component);
            });
            await modal.present();
        } else {
            let userProfile = await this.userProfileService.get();
            this.cartService.setOrderUserProfileId(userProfile.id)
            await this.navCtrl.push(CheckoutPage);
        }
    }

    /**
     * Removes the last product page from the nav stack
     */
    private async removeLastProductPageFromNavStack(): Promise<void> {
        let previous = this.navCtrl.getPrevious();
        let productpages = ['PrintPage', 'CanvasPage', 'MosaicPage'];
        if (previous && !previous.isFirst() && productpages.some(p => p == previous.name)) await this.navCtrl.removeView(previous);
    }
}