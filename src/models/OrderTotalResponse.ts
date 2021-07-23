export class OrderTotalResponse {
	total: number;
	shippingCosts: number;
	voucherDiscount: number;
	subtotal: number;
	usedCredits: number;
	totalWithoutDiscount: number;
	freeShipping: boolean = false;
}