import { Component } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { LoadingController, Platform } from 'ionic-angular';
import { ProductTypes } from '../../enums/ProductTypes';
import { ProductVariation } from '../../models/ProductVariation';
import { OrderService } from '../../services/OrderService';
import { ProductService } from '../../services/ProductService';
import { Utilities } from '../../util/Utilities';

@Component({
    templateUrl: 'prices.html'
})
export class PricesPage {

    private all: ProductVariation[] = [];
    private prints: ProductVariation[] = [];
    private canvas: ProductVariation[] = [];
    private posters: ProductVariation[] = [];
    private letterShippingCosts: number = 0;
    private packageShippingCosts: number = 0;
    private freeShippingFrom: number = 0;
    private shippingText: string;

    constructor(
        private productService: ProductService,
        private orderService: OrderService,
        private util: Utilities,
        private loadingCtrl: LoadingController,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics
    ) { }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Prijzen');
    }

    private async ionViewDidLoad(): Promise<void> {
        let loading = this.loadingCtrl.create();
        await loading.present();
        this.all = await this.productService.get.productVariations();
        this.prints = this.all
            .filter(p => p.types.some(t => t == ProductTypes.print));
        this.canvas = this.all
            .filter(p => p.types.some(t => t == ProductTypes.canvas));
        this.posters = this.all
            .filter(p => p.types.some(t => t == ProductTypes.poster));

        let shippingInformation = await this.orderService.shippingInformation();
        this.letterShippingCosts = shippingInformation.costsLetterDelivery;
        this.packageShippingCosts = shippingInformation.costsPackageDelivery;
        this.freeShippingFrom = shippingInformation.freeShippingFrom;
        this.shippingText = shippingInformation.shippingText + shippingInformation.shippingTime;
        await loading.dismiss();
    }
}