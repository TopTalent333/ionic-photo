import { Orderline } from './Orderline';

export class Order {
    public id: number;
    public price: number;
    public shippingCost: number;
    public coupon: string;
    public orderlines: Orderline[];
    public userProfileId: number;
    public usedCredits: number;

    constructor() {
        this.orderlines = [];
    }
}