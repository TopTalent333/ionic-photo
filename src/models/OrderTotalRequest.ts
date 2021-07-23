import { Order } from './Order';
import { Voucher } from './Voucher';

export class OrderTotalRequest {
	order: Order;
	voucher: Voucher;
	includeShippingCosts: boolean = true;
	userCredits: number = 0;
}