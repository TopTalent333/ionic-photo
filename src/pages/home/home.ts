import { Component } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { NavController, NavOptions, Platform } from 'ionic-angular';
import { ProductTypes } from '../../enums/ProductTypes';
import { NotificationController } from '../../infra/notification-controller';
import { Product } from '../../models/Product';
import { CartService } from '../../services/CartService';
import { ImageService } from '../../services/ImageService';
import { AppSettings } from '../../settings/AppSettings';
import { CartPage } from '../cart/cart';
import { ProductSelectionPage } from '../product-selection/product-selection';

@Component({
    templateUrl: 'home.html'
})
export class HomePage {

    private sliderImages: string[];
    private googleAnalyticsStarted: boolean = false;

    constructor(
        public navCtrl: NavController,
        public cart: CartService,
        private imageService: ImageService,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private appVersion: AppVersion,
        private notificationController: NotificationController
    ) {
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova') && this.googleAnalyticsStarted) await this.googleAnalytics.trackView('Homepagina');
    }

    private async ionViewDidLoad(): Promise<void> {
        this.sliderImages = await this.imageService.get.slider();

        await this.platform.ready();
        if (this.platform.is('cordova')) {
            await this.initializeGoogleAnalytics();
            await this.googleAnalytics.trackView('Homepagina');
        }
    }

    private async openProduct(productString: string): Promise<void> {
        let product = this.selectProduct(productString);
        await this.navCtrl.push(ProductSelectionPage, { product: product });
    }

    private selectProduct(product: string): Product {
        switch (product) {
            case 'canvas':
                return {
                    id: 0,
                    name: 'Canvas',
                    title: 'Canvassen',
                    description: 'Beleef onvergetelijke momenten iedere keer opnieuw met een foto op canvas. Een foto op canvas is een foto als schilderij. Je foto hangt als een kunstwerk aan de muur. Kies hieronder je gewenste formaat en geniet elke dag van jouw meest dierbare herinneringen.',
                    type: ProductTypes.canvas,
                    variation: null,
                    image: 'assets/images/product-canvas.jpg'
                } as Product;
            case 'print':
                return {
                    id: 1,
                    name: 'Print',
                    title: 'Prints',
                    description: 'Druk foto\'s van je meest dierbare momenten af op fotopapier van de hoogste kwaliteit. Laat je digitale foto\'s afdrukken op fotopapier met de hoogste kwaliteit. Kies hieronder je gewenste formaat en druk je mooiste herinneringen af.',
                    type: ProductTypes.print,
                    variation: null,
                    image: 'assets/images/product-print.jpg'
                } as Product;
            case 'poster':
                return {
                    id: 2,
                    name: 'Poster',
                    title: 'Posters',
                    description: 'Een geweldige mogelijkheid om de mooiste momenten vast te leggen op 1 beeld: de fotoposter. Kies voor 24 of 35 foto’s en maak je eigen collage! Het is natuurlijk ook mogelijk om een poster te maken van 1 foto. Ideaal als je muren nog wat aankleding kunnen gebruiken, of om te geven als cadeau.',
                    type: ProductTypes.poster,
                    variation: null,
                    image: 'assets/images/product-poster.jpg'
                } as Product;
            default:
                return;
        }
    }

    private async navigateToCart(): Promise<void> {
        let navOptions = {
            animate: true,
            direction: 'forward'
        } as NavOptions;
        await this.navCtrl.push(CartPage, null, navOptions);
    }

    private async initializeGoogleAnalytics(): Promise<void> {
        try {
            await this.googleAnalytics.startTrackerWithId(AppSettings.googleAnalyticsId)
            this.googleAnalyticsStarted = true;
            await this.googleAnalytics.enableUncaughtExceptionReporting(true);
            let versionNumber = await this.appVersion.getVersionNumber();
            await this.googleAnalytics.setAppVersion(versionNumber);
        } catch (error) {
            this.notificationController.notifyError(`Error while starting Google Analytics tracker with id '${AppSettings.googleAnalyticsId}', see error body for more details.`, {
                error: error
            });
        }
    }
}