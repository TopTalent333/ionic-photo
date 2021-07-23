import { Injectable } from "@angular/core";
import { Platform } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Orderline } from "../models/Orderline";
import { Order } from "../models/Order";
import { SelectionModel } from "../models/SelectionModel";
import { Voucher } from '../models/Voucher';
import { OrderTotalResponse } from '../models/OrderTotalResponse';
import { OrderTotalRequest } from '../models/OrderTotalRequest';
import { OrderService } from '../services/OrderService';

@Injectable()
export class CartService {

    private order: Order;
    private voucher: Voucher;
    public availableCredits: number = 0;

    constructor(
        private storage: Storage,
        private platform: Platform,
        private orderService: OrderService,
    ) {
        this.order = new Order();
        this.retrieveOrderlinesFromStorage();
    }

    public getOrderlines(): Orderline[] {
        return this.order.orderlines;
    }

    public getOrder(): Order {
        return this.order;
    }

    public setOrderId(orderId: number): void {
        this.order.id = orderId;
    }

    public setOrderUserProfileId(userProfileId: number): void {
        this.order.userProfileId = userProfileId;
    }

    public setAvailableCredits(credits: number): void {
        this.availableCredits = credits;
    }

    public async addOrderline(orderline: Orderline): Promise<void> {
        this.order.orderlines.push(orderline);
        await this.updateOrderlinesInStorage();
    }

    public async removeOrderline(orderline: Orderline): Promise<void> {
        let index = this.order.orderlines.indexOf(orderline);
        this.order.orderlines.splice(index, 1);
        await this.updateOrderlinesInStorage();
    }

    public async empty(): Promise<void> {
        this.order = new Order();
        if (!(this.platform.is('ios') && this.platform.is('cordova'))) {
            await this.storage.ready();
            await this.storage.remove('orderlines');
        }
    }

    public async updateOrderlinesInStorage(): Promise<void> {
        if (!(this.platform.is('ios') && this.platform.is('cordova'))) {
            await this.storage.ready();
            await this.storage.set('orderlines', this.order.orderlines);
        }
    }

    /**
     * Updates an orderline with the selection model data
     * @param selection The selection model holding the updated data
     */
    public async updateOrderline(selection: SelectionModel): Promise<void> {
        this.getOrderlines().forEach((orderline, index) => {
            if (index == selection.index) {
                orderline.quantity = selection.images.length == 1 ? selection.images[0].quantity : selection.quantity;
                orderline.image = selection.images[0];
                orderline.mosaicImages = selection.images;
            }
        });
        await this.updateOrderlinesInStorage();
    }

    /**
     * Sets the discounts object for this service and recalculates the order total
     */
    public applyVoucher(voucher: Voucher): void {
        this.voucher = voucher;
    }

    /**
     * Removes the current voucher and recalculates the order total
     */
    public removeCurrentVoucher(): void {
        this.voucher = null;
    }

    /**
     * Calculates the total of an order including shippingcosts and discounts 
     * @param includeShippingCosts Choose whether you want shippingcosts included or not (default: true)
     */
    public async calculateTotal(includeShippingCosts: boolean = true): Promise<OrderTotalResponse> {
        return await this.orderService.calculateOrderTotal(<OrderTotalRequest>{
            order: this.getOrder(),
            voucher: this.voucher,
            includeShippingCosts: includeShippingCosts,
            userCredits: this.availableCredits
        })
    }

    public async retrieveOrderlinesFromStorage(): Promise<void> {
        if (!(this.platform.is('ios') && this.platform.is('cordova'))) {
            await this.storage.ready();
            let storedOrderlines = await this.storage.get('orderlines');
            if (storedOrderlines)
                this.order.orderlines = storedOrderlines;
        }
    }
}