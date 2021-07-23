import { ChangeDetectorRef, Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Alert, AlertController, NavController, NavOptions, NavParams, Platform } from 'ionic-angular';
import { OrderlineOperation } from '../../enums/OrderlineOperation';
import { Orientations } from '../../enums/Orientations';
import { NotificationController } from '../../infra/notification-controller';
import { Image } from '../../models/Image';
import { Orderline } from '../../models/Orderline';
import { SelectionModel } from '../../models/SelectionModel';
import { CartService } from '../../services/CartService';
import { ImageService } from '../../services/ImageService';
import { CartPage } from '../cart/cart';

@Component({
    templateUrl: 'canvas.html'
})
export class CanvasPage {

    private selection: SelectionModel;
    private operationEnum: typeof OrderlineOperation = OrderlineOperation;

    constructor(
        navParams: NavParams,
        public navCtrl: NavController,
        private platform: Platform,
        public cartService: CartService,
        private changeDetector: ChangeDetectorRef,
        private alertController: AlertController,
        private imageService: ImageService,
        private googleAnalytics: GoogleAnalytics,
        private notificationController: NotificationController
    ) {
        this.selection = navParams.get('selection');
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Canvas bestellen');
    }

    private async addToCart(): Promise<void> {
        // Map each selected image to a seperate orderline
        for (let image of this.selection.images) {
            await this.cartService.addOrderline(<Orderline>{
                product: this.selection.product,
                image: image,
                quantity: image.quantity
            });
        }
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

    /**
     * Generates a class string based on the orientation
     * @param image The image holding the orientation
     */
    private getOrientation(image: Image): string {
        let orientation = this.imageService.getOrientation(image);
        if (this.selection.product.variation.orientation == Orientations.Square)
            orientation = Orientations.Square;
        return Orientations[orientation].toLowerCase();
    }

    /**
     * Adds a prefix to a filename
     * @param fullpath The full path to the file
     * @return The fullpath to the image with the precix
     */
    private addPrefixToFileName(fullPath: string): string {
        let filename = fullPath.substring(fullPath.lastIndexOf('/') + 1);
        let path = fullPath.substring(0, fullPath.lastIndexOf('/'));
        return path + 'edited_' + filename;
    }

    private increaseQuantity(image: Image): void {
        image.quantity++;
        this.changeDetector.detectChanges();
    }

    private decreaseQuantity(image: Image): void {
        if (image.quantity > 1) {
            image.quantity--;
            this.changeDetector.detectChanges();
        }
    }

    private async saveEdit(): Promise<void> {
        await this.cartService.updateOrderline(this.selection);
        await this.navCtrl.pop();
    }

    private async revertToOriginal(image: Image): Promise<void> {
        if (this.platform.is('cordova'))
            await this.googleAnalytics.trackEvent('Canvas image', 'Undo edits');
        // Confirm alert to make sure the customer wants to undo changes to the image.
        let alert: Alert = this.alertController.create({
            title: 'Aanpassingen ongedaan maken',
            subTitle: 'Weet u zeker dat u de aanpassingen ongedaan wil maken?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => {
                        image.modified = undefined;
                    }
                },
                'Nee'
            ]
        });
        await alert.present();
    }
}
