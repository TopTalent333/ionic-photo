import { DiscountTypes } from '../enums/DiscountTypes';
import { CouponTypes } from '../enums/CouponTypes';

export class Voucher {
        id: number;
        code: string;
        description: string;
        discount: number;
        discountType: DiscountTypes;
        startDate: Date;
        endDate: Date;
        available: number;
        used: number;
        couponType: CouponTypes;
        hasValidCode: false;
        error: boolean;
        errorMessage: string;
}