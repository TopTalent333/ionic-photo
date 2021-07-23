import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { CanvasPage } from '../pages/canvas/canvas';
import { PosterPage } from '../pages/poster/poster';
import { PrintPage } from '../pages/print/print';
import { MosaicPage } from '../pages/mosaic/mosaic';
import { AppSettings } from '../settings/AppSettings';
import { Page } from 'ionic-angular/navigation/nav-util';
declare var window;

@Injectable()
export class Utilities {

    constructor(
        private platform: Platform,
        private clipboard: Clipboard
    ) { }

    public static selectComponent(component: string): Page {
        switch (component) {
            case 'CanvasPage':
                return CanvasPage;
            case 'PrintPage':
                return PrintPage;
            case 'MosaicPage':
                return MosaicPage;
            case 'PosterPage':
                return PosterPage;
        }
    }

    /** Formats the given price with currency sign, commas, dots and rounded to given decimals. */
    public formatPrice(price: number, decimals: number = 2, decimalCharacter: string = ',', replaceCharacter: string = '.', withCurrencySign: boolean = true): string {
        let priceString = price.toString(),
            positiveModifier = price < 0 ? "-" : "",
            parsedPrice = parseInt(priceString = Math.abs(+priceString || 0).toFixed(decimals)),
            j = parsedPrice.toString().length > 3 ? parsedPrice.toString().length % 3 : 0,
            currency = withCurrencySign ? AppSettings.currencySign : "",
            parsedPriceString = parsedPrice.toString();

        return positiveModifier + currency + ' ' + (j ? parsedPriceString.substr(0, j) + replaceCharacter : "") + parsedPriceString.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + replaceCharacter) + (decimals ? decimalCharacter + Math.abs(price - parsedPrice).toFixed(decimals).slice(2) : "");
    }

    public getDeviceUuid(): Promise<string> {
        return new Promise(
            (resolve, reject) => {
                if ((this.platform.is('ios') || this.platform.is('android'))
                    && this.platform.is('cordova')
                    && window.plugins
                    && window.plugins.uniqueDeviceID) {
                    window.plugins.uniqueDeviceID.get(
                        (uuid: string) => {
                            if (uuid)
                                resolve(uuid);
                            else
                                resolve('default-UUID-securancy');
                        },
                        (error: any) => reject(error)
                    );
                } else {
                    resolve('default-UUID-securancy');
                }
            }
        );
    }

    public static getFileExtensionFromFileUri(fileUri: string): string {
        let fileUriSplit = fileUri.split('.');
        return fileUriSplit[fileUriSplit.length - 1];
    }

    public copyToClipboard(value: string): void {
        if (this.platform.is('cordova')) this.clipboard.copy(value);
    }
}
