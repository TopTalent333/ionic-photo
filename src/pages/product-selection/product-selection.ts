import { Component } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { File } from '@ionic-native/file';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { AlertController, LoadingController, NavController, NavParams, Platform } from 'ionic-angular';
import { OrderlineOperation } from '../../enums/OrderlineOperation';
import { ProductTypes } from '../../enums/ProductTypes';
import { NotificationController } from '../../infra/notification-controller';
import { Product } from '../../models/Product';
import { ProductVariation } from '../../models/ProductVariation';
import { SelectionModel } from '../../models/SelectionModel';
import { ProductService } from '../../services/ProductService';
import { Utilities } from '../../util/Utilities';

declare var imagePicker;

@Component({
    templateUrl: 'product-selection.html'
})
export class ProductSelectionPage {

    private variations: Array<ProductVariation> = [];
    private product: Product;

    constructor(
        private navCtrl: NavController,
        private params: NavParams,
        private platform: Platform,
        private productService: ProductService,
        private util: Utilities,
        private loadingCtrl: LoadingController,
        private googleAnalytics: GoogleAnalytics,
        private diagnostic: Diagnostic,
        private alertController: AlertController,
        private notificationController: NotificationController,
        private fileReader: File
    ) {
        this.product = this.params.get('product') as Product;
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView(`Product selectie ${ProductTypes[this.product.type]}`);
    }

    private async ionViewDidLoad(): Promise<void> {
        let loading = this.loadingCtrl.create();
        let productVariations = await this.productService.get.productVariations();
        this.variations = await productVariations.filter(variation => variation.types.some(t => t == this.product.type));
        await loading.dismiss();
    }

    private async selectVariation(variation: ProductVariation): Promise<void> {
        // Fetch max,min values
        let maxImages: number = variation.maxImages > 0 ? variation.maxImages : null;
        let minImages: number = variation.minImages > 0 ? variation.minImages : 1;
        // Prepare selection model
        this.product.variation = variation;
        let selection = <SelectionModel>{
            product: this.product,
            operation: OrderlineOperation.create,
            images: [],
        };
        // Make sure platform is cordova (running on a device) and imagePicker is defined
        if ((this.platform.is('ios') || this.platform.is('android'))
            && this.platform.is('cordova')
            && imagePicker) {

            if (this.platform.is('ios')) {
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
            }

            // Select pictures before navigating to the next page
            imagePicker.getPictures(async results => {

                if (typeof results === 'string') return;

                let promises = results.map(async image => {
                    return new Promise(resolve => {
                        var img = new Image();
                        img.onload = function () {
                            selection.images.push({
                                original: (window as any).Ionic.WebView.convertFileSrc(image.original),
                                thumb: (window as any).Ionic.WebView.convertFileSrc(image.thumb),
                                quantity: 1,
                                extension: image.original.substring(image.original.lastIndexOf('.')),
                                width: (this as any).clientWidth,
                                height: (this as any).clientHeight,
                                modified: undefined,
                                url: image.original
                            });
                            resolve();
                        }
                        img.src = (window as any).Ionic.WebView.convertFileSrc(image.original);
                    });
                });

                await Promise.all(promises);
                let component = Utilities.selectComponent(this.product.variation.component);

                // Only continue to component if there are images in the selection
                if (selection.images.length > 0)
                    await this.navCtrl.push(component, { selection: selection });
            }, (error: any) => {
                if (error) {
                    this.notificationController.notifyError(`Error while using the image picker on ProductSelectionPage, see error body for more details.`, {
                        imagePickerError: error
                    });
                }
            }, {
                    quality: 90,
                    allow_video: false,
                    title: `Selecteer${maxImages ? ' ' + maxImages : ''} foto('s)`,
                    message: `Kies ten minste ${minImages} foto`,
                    thumbSize: 1024, // thumbnail width and height for the imagepicker, defaults to 100
                    maximumImagesCount: maxImages // max selectable images in android imagepicker, defaults to 1 (defaults to 100 if not set)
                });

        } else {
            console.log("Platform is not cordova and/or imagePicker is undefined");
            let imageCount = variation.maxImages > 0 ? variation.maxImages : 1;
            for (let i = 0; i < imageCount; i++) {
                selection.images.push(
                    {
                        original: "assets/images/test-image.jpg",
                        thumb: "assets/images/test-image.jpg",
                        quantity: 1,
                        modified: undefined,
                        extension: undefined,
                        height: 0,
                        width: 0,
                        url: "assets/images/test-image.jpg",
                    });
            }
            let component = Utilities.selectComponent(this.product.variation.component);
            await this.navCtrl.push(component, { selection: selection, });
        }
    }
}