import { ChangeDetectorRef, Component } from '@angular/core';
import { FileTransfer, FileTransferError, FileTransferObject, FileUploadResult } from '@ionic-native/file-transfer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Insomnia } from '@ionic-native/insomnia';
import { Alert, AlertController, LoadingController, NavController, NavOptions, NavParams, Platform } from 'ionic-angular';
import { NotificationController } from '../../infra/notification-controller';
import { Image } from '../../models/Image';
import { Order } from '../../models/Order';
import { CartService } from '../../services/CartService';
import { OrderService } from '../../services/OrderService';
import { AppSettings } from '../../settings/AppSettings';
import { Utilities } from '../../util/Utilities';
import { CartPage } from '../cart/cart';
import { HomePage } from '../home/home';

@Component({
    templateUrl: 'upload.html'
})
export class UploadPage {

    private uploading: boolean = true;
    private progress: number = 0;
    private total: number;
    private index: number = 0;
    private order: Order;
    private images: Image[] = [];
    private paymentSuccessful: boolean = false;
    private paymentFailed: boolean = false;
    private finished: boolean = false;
    private fileTransfer: FileTransferObject;
    private fileTransferModified: FileTransferObject;
    private orderPrice: number;

    constructor(
        private transfer: FileTransfer,
        private navCtrl: NavController,
        private navParams: NavParams,
        private cart: CartService,
        private orderService: OrderService,
        private alertController: AlertController,
        private changeDetector: ChangeDetectorRef,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private inAppBrowser: InAppBrowser,
        private insomnia: Insomnia,
        private notificationController: NotificationController
    ) {
        this.order = this.cart.getOrder();

        this.orderPrice = this.navParams.get('orderPrice') as number;

        this.fileTransfer = transfer.create();
        this.fileTransferModified = transfer.create();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Upload pagina');
    }

    private async ionViewDidLoad(): Promise<void> {
        this.cart.getOrder()
            .orderlines
            .forEach(line => {
                if (line.mosaicImages && line.mosaicImages.length > 0)
                    line.mosaicImages.forEach(image => this.images.push(image));
                else
                    this.images.push(line.image);
            });
        this.total = this.images.length;
        // enable insomnia, preventing the device from falling asleep
        await this.insomnia.keepAwake();
        await this.upload(this.images[this.index]);
    }

    /** Utilises the FileService upload function to upload the given image's original image and optionally its modified image
     * @param image The image containing an original image url and optionally a modified image url
     */
    private async upload(image: Image): Promise<void> {
        let promises = new Array<Promise<FileUploadResult | FileTransferError>>();
        promises.push(this.uploadFile(image.url, this.index, this.order.id, this.onProgress, 'original') as Promise<FileUploadResult | FileTransferError>);

        // If the image has a modified version, make sure to also upload the modified image
        if (image.modified) {
            promises.push(this.uploadFile(image.modified, this.index, this.order.id, this.onProgressForModified, 'modified') as Promise<FileUploadResult | FileTransferError>);
        }

        let results = new Array<FileUploadResult | FileTransferError>();
        try {
            results = await Promise.all(promises);
            await this.onSuccess(results[0] as FileUploadResult);
        } catch (error) {
            if (results.length === 0)
                await this.onFailed(error, 'original');
            else
                await this.onFailed(error, 'modified');
        }
    }

    /** On success of the picture upload
     * @param result The result of the upload
     */
    private async onSuccess(results: FileUploadResult): Promise<void> {
        if (this.index < this.total - 1) {
            this.progress = 0;
            this.index++
            await this.upload(this.images[this.index]);
        } else {
            // disable insomnia
            await this.insomnia.allowSleepAgain();
            await this.continue();
        }
    }

    /** On failing of the picture upload
     * @param error The error of the upload
     */
    private async onFailed(error: FileTransferError, kind: string): Promise<void> {
        // If abort error do nuttin
        if (error.code == 3 || error.code == 4) return;
        this.uploading = false;
        // Notify the user
        let alert: Alert = this.alertController.create({
            title: 'Oei, het uploaden is mislukt',
            subTitle: 'Wilt u het opnieuw proberen?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => this.retry()
                },
                {
                    text: 'Nee',
                    handler: () => {
                        let navOptions = {
                            animate: true
                        } as NavOptions;
                        this.navCtrl.push(CartPage, null, navOptions);
                    }
                }
            ]
        });
        await alert.present();

        this.notificationController.notifyError(`Error while uploading a ${kind} image, see error body for more details.`, {
            error: error,
            order: this.order,
            currentImage: this.index
        });

        // Abort the transfer #just-to-be-sure
        this.fileTransfer.abort();
        this.fileTransferModified.abort();

        // disable insomnia
        await this.insomnia.allowSleepAgain();
    }

    /** Calculates and sets the progressment of the upload in percentages
     * @param progress The progress number
     */
    private setProgress = (progress: number): void => {
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;

        let c = Math.PI * (45 * 2);
        let percentage = ((100 - progress) / 100) * c;

        document.getElementById('progress-bar').style.strokeDashoffset = percentage.toString();
        document.getElementById('progress-container').setAttribute('data-pct', progress.toString());
    }

    /** Event handler for the file upload, updates upload loader in view.
     * @param progressEvent The progress event of the file transfer plugin containing the progress
     */
    private onProgress = (progressEvent: ProgressEvent): void => {
        if (progressEvent.lengthComputable) {
            let progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            this.setProgress(progress);
        }
    }

    /** Event handler for the file upload of modified images, does NOT upload loader in view
     * @param progressEvent The progress event of the file transfer plugin containing the progress
     */
    private onProgressForModified = (progressEvent: ProgressEvent): void => {
        // Do nothing as we don't want the modified image to influence the loader by overriding the original image upload
    }

    /** Continues to the payment of the order */
    private async continue(): Promise<void> {
        let loading = this.loadingCtrl.create({
            content: 'Order verwerken...'
        });
        await loading.present();
        try {
            let paymentUrl = await this.orderService.orderComplete(this.order.id);
            this.startPayment(paymentUrl);
            this.uploading = false;
            this.finished = true;
            await loading.dismiss();
        } catch (error) {
            this.uploading = false;
            this.finished = true;
            await loading.dismiss();
            if (error) {
                this.notificationController.notifyError(`Error while completing order on UploadPage, see error body for more details.`, {
                    completeOrderError: error
                });
            }
        }
    }

    /**
     * Retries to upload the current order
     */
    private async retry(): Promise<void> {
        this.cart.getOrder()
            .orderlines
            .forEach(line => this.images.push(line.image));
        this.total = this.images.length;
        this.index = 0;
        await this.upload(this.images[this.index]);
    }

    /** Warns the user before cancelling the upload, returns to cart page on confirmation */
    private async cancel(): Promise<void> {
        // Confirm alert to make sure the customer wants to cancel the upload.
        let alert: Alert = this.alertController.create({
            title: 'Uploaden annuleren',
            subTitle: 'Weet u zeker dat u het uploaden van foto\'s wilt annuleren?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => {
                        // disable insomnia
                        this.insomnia.allowSleepAgain();
                        this.fileTransfer.abort();
                        this.fileTransferModified.abort();
                        this.navCtrl.pop();
                    }
                },
                'Nee'
            ]
        });
        await alert.present();
    }

    /** Finishes the order, emptying the cart and navigating to the home page and wiping the navigation stack */
    private async finish(): Promise<void> {
        await this.cart.empty();
        let navOptions = {
            animate: true
        } as NavOptions;
        await this.navCtrl.setRoot(HomePage, null, navOptions);
    }

    /** Opens the InAppBrowser to pay the order */
    private async startPayment(paymentUrl: string): Promise<void> {
        let browser = this.inAppBrowser.create(paymentUrl, '_blank');
        browser.on('exit')
            .subscribe(
                async () => {
                    let loading = this.loadingCtrl.create({
                        content: 'Betaling controleren...'
                    });
                    await loading.present();
                    let paid = await this.orderService.verifyPayment(this.order.id);

                    if (paid) {
                        await this.orderService.paymentSuccessful(this.order.id);

                        // Track the order payment successful event in Google Analytics with as value the order price in cents
                        // Order price is sent in cents because Google Analytics only accepts integers as values
                        await this.googleAnalytics.trackEvent('Order', 'Betaling', 'Succesvol', Math.round(this.orderPrice * 100));

                        this.paymentSuccessful = true;
                    } else {
                        await this.orderService.paymentFailed(this.order.id);

                        // Track the order payment failed event in Google Analytics with as value the order price in cents
                        // Order price is sent in cents because Google Analytics only accepts integers as values
                        await this.googleAnalytics.trackEvent('Order', 'Betaling', 'Mislukt', Math.round(this.orderPrice * 100));

                        this.paymentFailed = true;
                    }

                    this.changeDetector.detectChanges();
                    await loading.dismiss();
                },
                error => { });
        browser.on('loaderror')
            .subscribe(error => {
                this.notificationController.notifyError(`Error trying to load the payment page while using the InAppBrowser, see error body for more details.`, {
                    error: error
                });
            });
    }

    /**
     * Uploads a single file to the apiUrl
     * @param fileUrl The url to the file to upload
     * @param index The index of the file that is being uploaded
     * @param orderId The id of the order the file belongs to
     * @param onProgress The on progress callback function
     * @param imageVersion The version of the image
     */
    private async uploadFile(fileUrl: string, index: number, orderId: number, onProgress: any, imageVersion: string): Promise<FileUploadResult | FileTransferError> {
        let fileExtension = Utilities.getFileExtensionFromFileUri(fileUrl);
        let filename = `${orderId}_${imageVersion}_${index}.${fileExtension}`;

        let options = {
            fileKey: 'file',
            fileName: filename,
            mimeType: 'image/jpeg',
            chunkedMode: false,
            headers: {
                'Content-Type': undefined
            },
            params: {
                filename: filename,
                orderId: orderId,
                currentFile: index
            }
        };
        if (imageVersion == 'original') {
            this.fileTransfer.onProgress(onProgress);
            return await this.fileTransfer.upload(`file://${fileUrl}`, AppSettings.apiUrl + 'products/', options, false);
        } else {
            this.fileTransferModified.onProgress(onProgress);
            return await this.fileTransferModified.upload(`file://${fileUrl}`, AppSettings.apiUrl + 'products/', options, false);
        }
    }
}
