import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import "rxjs/Rx";
import { Order } from '../models/Order';
import { OrderTotalRequest } from '../models/OrderTotalRequest';
import { OrderTotalResponse } from '../models/OrderTotalResponse';
import { ShippingInformation } from '../models/ShippingInformation';
import { AppSettings } from '../settings/AppSettings';

@Injectable()
export class OrderService {

    private controller: string = 'orders/';

    constructor(
        private http: Http
    ) { }

    save(order: Order): Promise<number> {
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + 'create', order)//, this.headers);
                .subscribe(
                    data => resolve(data.json()),
                    error => reject(error.json())
                );
        });
    }

    update(order: Order): Promise<Order> {
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + 'create', order)//, this.headers)
                .subscribe(
                    data => resolve(data.json()),
                    error => reject(error.json())
                );
        });
    }

    orderComplete(orderId: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + `complete?id=${orderId}`, null)
                .subscribe(
                    data => resolve(data.json()),
                    error => reject(error.json())
                );
        });
    }

    paymentSuccessful(orderId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + `paymentsuccessful?id=${orderId}`, null)
                .subscribe(
                    () => resolve(),
                    error => reject(error.json())
                );
        });
    }

    paymentFailed(orderId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + `paymentfailed?id=${orderId}`, null)
                .subscribe(
                    () => resolve(),
                    error => reject(error.json())
                );
        });
    }

    verifyPayment(orderId: number): Promise<boolean> {
        let uuid: string = '';
        return new Promise((resolve, reject) => {
            this.http.post(AppSettings.apiUrl + this.controller + 'verifyPayment', { orderId: orderId, uuid: uuid })
                .subscribe(
                    data => resolve(data.json().paid),
                    error => reject(false)
                );
        });
    }

    /**
     * Calculates the order total
     * @param request The request holding the order and discount and shippingcosts options
     */
    calculateOrderTotal(request: OrderTotalRequest): Promise<OrderTotalResponse> {
        return this.http.post(AppSettings.apiUrl + this.controller + 'calculatetotal', request)
            .map(res => res.json())
            .map(data => this.parseOrderTotalResponse(data))
            .toPromise();
    }

    /**
     * Fetches the shipping costs information
     */
    shippingInformation(): Promise<ShippingInformation> {
        return this.http.get(AppSettings.apiUrl + this.controller + 'shippinginformation')
            .map(res => res.json())
            .map(data => this.parseShippingInformation(data))
            .toPromise();
    }

    /**
     * Parses raw json to the order total response
     * @param raw The raw json
     */
    private parseOrderTotalResponse(raw: any): OrderTotalResponse {
        return <OrderTotalResponse>{
            totalWithoutDiscount: raw.totalWithoutDiscount,
            shippingCosts: raw.shippingCosts,
            subtotal: raw.subtotal,
            total: raw.total,
            usedCredits: raw.usedCredits,
            voucherDiscount: raw.voucherDiscount,
            freeShipping: raw.freeShipping
        };
    }

    /**
     * Parses raw json to the shippingcosts
    * @param raw The raw json
    */
    private parseShippingInformation(raw: any): ShippingInformation {
        return <ShippingInformation>{
            freeShippingFrom: raw.freeShippingFrom,
            costsPackageDelivery: raw.costsPackageDelivery,
            costsLetterDelivery: raw.costsLetterDelivery,
            shippingText: raw.shippingText,
            shippingTime: raw.shippingTime
        };
    }
}