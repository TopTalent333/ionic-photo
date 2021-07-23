import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import { Storage } from "@ionic/storage";
import "rxjs/Rx";
import { Voucher } from '../models/Voucher';
import { AppSettings } from '../settings/AppSettings';
import { Utilities } from '../util/Utilities';
import { UserProfileService } from './UserProfileService';

@Injectable()
export class VoucherService {

    private controller: string = 'coupons/';

    constructor(
        private storage: Storage,
        private http: Http,
        private utilities: Utilities,
        private userProfileService: UserProfileService
    ) { }

    /**
     * Validates a voucher code
     * @param code The voucher code to validate
     */
    public async validateVoucherCode(code: string): Promise<Voucher> {
        let userProfile = await this.userProfileService.get();
        let uuid = await this.utilities.getDeviceUuid();
        try {
            return await this.http.post(AppSettings.apiUrl + this.controller + 'validatecoupon',
                {
                    code: code,
                    uuid: uuid,
                    userProfileId: userProfile.id
                })
                .map(response => response.json())
                .map(raw => this.parse(raw))
                .toPromise();
        } catch (ex) {
            return await this.http.post(AppSettings.apiUrl + this.controller + 'validatecoupon',
                {
                    code: code,
                    uuid: 'default-UUID-securancy',
                    userProfileId: userProfile.id
                })
                .map(response => response.json())
                .map(raw => this.parse(raw))
                .toPromise();
        }
    }

    /**
     * Saves the voucher in the local storage
     * @param voucher The voucher to save
     */
    public async saveVoucher(voucher: Voucher): Promise<void> {
        await this.storage.ready();
        await this.storage.set('voucher', JSON.stringify(voucher));
    }

    /**
     * Fetches the voucher from local storage
     */
    public async getVoucher(): Promise<Voucher> {
        await this.storage.ready();
        let voucher = await this.storage.get('voucher');
        return JSON.parse(voucher);
    }

    /**
     * Fetches the voucher from local storage
     */
    public async removeVoucher(): Promise<Voucher> {
        await this.storage.ready();
        return await this.storage.remove('voucher');
    }

    /**
     * Parses raw json to a voucher validation response
     * @param raw The raw json
     */
    private parse(raw: any): Voucher {
        return <Voucher>{
            id: raw.id,
            available: raw.available,
            code: raw.code,
            description: raw.description,
            used: raw.used,
            startDate: new Date(raw.startDate),
            endDate: new Date(raw.endDate),
            couponType: raw.couponType,
            discount: raw.discount,
            hasValidCode: raw.isValidCode,
            discountType: raw.discountType,
            error: raw.error,
            errorMessage: raw.errorMessage
        };
    }
}