import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import "rxjs/Rx";
import { ProductVariation } from '../models/ProductVariation';
import { AppSettings } from '../settings/AppSettings';

@Injectable()
export class ProductService {

    controller: string = 'products/';

    constructor(
        private http: Http
    ) { }

    get = {
		/**
		 * Fetches all available product variations
		 */
        productVariations: (): Promise<Array<ProductVariation>> => {
            return this.http.get(AppSettings.apiUrl + this.controller)
                .map(response => response.json())
                .toPromise();
        }
    }

}