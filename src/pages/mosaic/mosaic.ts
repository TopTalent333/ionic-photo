import { ChangeDetectorRef, Component } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AlertController, NavController, NavOptions, NavParams, Platform, reorderArray } from 'ionic-angular';
import { OrderlineOperation } from '../../enums/OrderlineOperation';
import { Orientations } from '../../enums/Orientations';
import { ProductTypes } from '../../enums/ProductTypes';
import { NotificationController } from '../../infra/notification-controller';
import { Image } from '../../models/Image';
import { Orderline } from '../../models/Orderline';
import { SelectionModel } from '../../models/SelectionModel';
import { CartService } from '../../services/CartService';
import { CartPage } from '../cart/cart';

declare var imagePicker;

@Component({
    templateUrl: 'mosaic.html'
})
export class MosaicPage {

    private selection: SelectionModel;
    private operationEnum: any = OrderlineOperation;
    private quantity: number = 1;
    private minImages: number = 0;
    private maxImages: number = 0;
    private remainingImages: number = 0;
    private currentAmountImages: number = 0;
    private portrait24: boolean = false;
    private landscape24: boolean = false;
    private portrait35: boolean = false;
    private landscape35: boolean = false;

    constructor(
        private navParams: NavParams,
        private navCtrl: NavController,
        private platform: Platform,
        private cartService: CartService,
        private changeDetector: ChangeDetectorRef,
        private alertController: AlertController,
        private googleAnalytics: GoogleAnalytics,
        private diagnostic: Diagnostic,
        private notificationController: NotificationController
    ) {
        this.selection = navParams.get('selection');
        this.setImageAmounts();
        this.quantity = this.selection.quantity > 0 ? this.selection.quantity : 1;
        this.setMosaicLayout();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView(`Mozaiek samenstellen ${ProductTypes[this.selection.product.type]}`);
    }

	/**
	 * Defines which preview css class we need to use
	 */
    private setMosaicLayout(): void {
        switch (this.selection.product.variation.orientation) {
            case Orientations.Portrait:
                switch (this.selection.product.variation.minImages) {
                    case 24:
                        this.portrait24 = true;
                        break;
                    case 35:
                        this.portrait35 = true;
                        break;
                }
                break;
            case Orientations.Landscape:
                switch (this.selection.product.variation.minImages) {
                    case 24:
                        this.landscape24 = true;
                        break;
                    case 35:
                        this.landscape35 = true;
                        break;
                }
                break;
        }
    }

    /**
     * Sets the amounts regarding the image amount requirements
     */
    private setImageAmounts(): void {
        this.minImages = this.selection.product.variation.minImages;
        this.maxImages = this.selection.product.variation.maxImages;
        this.currentAmountImages = this.selection.images.length;
        this.remainingImages = this.minImages - this.currentAmountImages;
    }

    /**
     * Adds the current product to the card/order
     */
    private async addToCart(): Promise<void> {
        if (!this.userSelectedEnoughImages()) {
            this.showInvalidImageCountNotification();
            return;
        }
        // Map each selected image to a seperate orderline
        await this.cartService.addOrderline(<Orderline>{
            product: this.selection.product,
            quantity: this.quantity,
            mosaicImages: this.selection.images
        });
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

	/**
	 * Checks if there are enough images for this product type
	 * @return Flag whether the image account is correct for this product type
	 */
    private userSelectedEnoughImages(): boolean {
        return this.minImages >= this.currentAmountImages && this.maxImages <= this.currentAmountImages;
    }

	/**
	 * Shows a notifcation for the user with the messages that there are not enough images selected
	 */
    private async showInvalidImageCountNotification(): Promise<void> {
        let alert = this.alertController.create({
            title: 'Helaas..',
            subTitle: 'Je hebt op het moment ' + this.currentAmountImages + ' van de vereiste ' + this.minImages + ' afbeeldingen geselecteerd. Je kan pas verder gaan als het vereiste aantal afbeeldingen geselecteerd is.',
            buttons: ['OK']
        });
        await alert.present();
    }

	/**
	 * Deletes a previous selected image
	 * @param image The image to delete
	 */
    private delete(image: Image, index: number): void {
        this.selection.images.splice(index, 1);
        this.setImageAmounts();
    }

	/**
	 * Saves the edited version of the orderline
	 */
    private async saveEdit(): Promise<void> {
        this.selection.quantity = this.quantity;
        await this.cartService.updateOrderline(this.selection);
        await this.navCtrl.pop();
    }

	/**
	 * Increases the quantity for this product
	 */
    private increaseQuantity(): void {
        this.quantity++;
        this.changeDetector.detectChanges();
    }

	/**
	 * Descreases the quantity for this product
	 */
    private decreaseQuantity(): void {
        if (this.quantity > 1) {
            this.quantity--;
            this.changeDetector.detectChanges();
        }
    }

	/**
	 * Reordes the images when an item is moved
	 * @param indexes The new indexes
	 */
    private reorderItems(indexes): void {
        this.selection.images = reorderArray(this.selection.images, indexes);
    }

    private async selectRemainingImages(): Promise<void> {
        if ((this.platform.is('ios') || this.platform.is('android'))
            && this.platform.is('cordova')
            && imagePicker) {

            // Make sure we have camera roll permission
            if (!await this.diagnostic.isCameraRollAuthorized()) {
                // Request camera roll permission
                let cameraRollAuthorizationStatus = await this.diagnostic.requestCameraRollAuthorization();

                // If the authorization status equates to 'denied', notify the user they have to grant permission to use this feature
                if (cameraRollAuthorizationStatus === 'denied') {
                    let alert = this.alertController.create({
                        title: `Er is momenteel geen toestemming om foto's te kunnen selecteren`,
                        subTitle: 'Wijzig de rechten in instellingen',
                        buttons: [
                            {
                                text: 'Ga naar instellingen',
                                handler: () => {
                                    // Switch to settings application for the Fotosimpel application
                                    this.diagnostic.switchToSettings();
                                }
                            },
                            'Annuleer'
                        ]
                    });
                    await alert.present();
                }

                // After requesting and potentially retrying to get permission, check again to see if we can continue to use the imagepicker
                if (!await this.diagnostic.isCameraRollAuthorized())
                    return;
            }

            // Select pictures before navigating to the next page
            imagePicker.getPictures(results => {
                this.selection.images = this.selection.images.concat(results.map(image => {
                    return {
                        original: image.original,
                        thumb: image.thumb,
                        quantity: 1,
                        extension: image.original.substring(image.original.lastIndexOf('.'))
                    } as Image;
                }));
                this.setImageAmounts();
                // Force the change detector to detect changes to the model and view
                this.changeDetector.detectChanges();
            }, (error: any) => {
                if (error) {
                    this.notificationController.notifyError(`Error while using the image picker on MosaicPage, see error body for more details.`, {
                        imagePickerError: error
                    });
                }
            }, {
                    quality: 90,
                    allow_video: false,
                    title: `Selecteer ${this.maxImages} foto('s)`,
                    message: `Kies ten minste ${this.minImages} foto`,
                    thumbSize: 1024, // thumbnail width and height for the imagepicker, defaults to 100
                    maximumImagesCount: this.remainingImages // max selectable images in android imagepicker, defaults to 1 (defaults to 100 if not set)
                });
        } else {
            for (let i = 0; i < this.remainingImages; i++) {
                this.selection.images.push(
                    {
                        original: "assets/images/test-image.jpg",
                        thumb: "assets/images/test-image.jpg",
                        quantity: 1
                    } as Image
                );
            }
            this.setImageAmounts();
            // Force the change detector to detect changes to the model and view
            this.changeDetector.detectChanges();
        }
    }
}
