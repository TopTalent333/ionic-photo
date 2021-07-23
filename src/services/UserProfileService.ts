import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import { Alert, AlertController, Loading, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import "rxjs/Rx";
import { LocalStorageKeys } from "../infra/local-storage-keys";
import { NotificationController } from "../infra/notification-controller";
import { UserProfile } from '../models/UserProfile';
import { AppSettings } from '../settings/AppSettings';
import { Utilities } from '../util/Utilities';
import { AuthService } from './AuthService';
import { CartService } from './CartService';

@Injectable()
export class UserProfileService {

    private controller: string = 'userprofiles/';
    private loader: Loading;

    constructor(
        private http: Http,
        private authService: AuthService,
        private utilities: Utilities,
        private alertController: AlertController,
        private cartService: CartService,
        private loadingController: LoadingController,
        private notificationController: NotificationController
    ) { }

    /** Retrieves UserProfile object from API by uuid or externalId
     * Returns new user profile if no user for uuid or externalId is found 
     * @returns Promise<UserProfile> Promise containing the UserProfile object
     */
    public async get(): Promise<UserProfile> {
        this.loader = await this.loadingController.create();
        await this.loader.present();
        try {
            // If the user is authenticated we can assume there is an auth0id in the localstorage which corresponds to an existing user profile, so retrieve that user profile 
            if (this.authService.loggedIn) {
                let userId = this.authService.getUserId();
                let userProfile = await this.getByExternalId(userId);
                // Only continue if userProfile is not null
                if (userProfile) {
                    this.cartService.setOrderUserProfileId(userProfile.id);
                    this.cartService.setAvailableCredits(userProfile.credits);
                    await this.loader.dismiss();
                    return userProfile;
                } else {
                    // This should only occur when the user is trying to log in with their Facebook account without having registered first
                    // and therefore receiving a null value for userProfile because no UserProfile could be found for the auth0 id of the Facebook account.
                    // Auth0 creates a new user account in this case, so we need to create a new user profile here as well

                    let firstname = localStorage.getItem(LocalStorageKeys.FirstName);
                    if (firstname === undefined || firstname === 'undefined') firstname = '';
                    let lastname = localStorage.getItem(LocalStorageKeys.LastName) || '';
                    if (lastname === undefined || lastname === 'undefined') lastname = '';
                    let email = localStorage.getItem(LocalStorageKeys.Email);

                    const username = localStorage.getItem(LocalStorageKeys.Username);
                    let uuid = await this.utilities.getDeviceUuid();
                    let newUserProfile = {
                        externalId: userId,
                        uuid,
                        email,
                        firstname,
                        lastname,
                        username
                    } as UserProfile;

                    userProfile = await this.create(newUserProfile);
                    this.cartService.setOrderUserProfileId(userProfile.id);
                    this.cartService.setAvailableCredits(userProfile.credits);
                    await this.loader.dismiss();
                    return userProfile;
                }
            } else {
                // If the user is not authenticated, check if the user's uuid corresponds to a user profile in the API
                let uuid = await this.utilities.getDeviceUuid();
                // if (uuid == 'default-UUID-securancy') {
                //     await this.loader.dismiss();
                //     return;
                // }
                let userProfile = await this.getByUuid(uuid);
                // If a UserProfile for this uuid is found
                if (userProfile) {
                    this.cartService.setOrderUserProfileId(userProfile.id);
                    this.cartService.setAvailableCredits(userProfile.credits);
                    await this.loader.dismiss();
                    return userProfile;
                } else {
                    // Create new UserProfile for this uuid as UserProfile wasn't found as userProfile is null
                    let newUserProfile = {
                        externalId: null,
                        uuid: uuid
                    } as UserProfile;
                    userProfile = await this.create(newUserProfile);
                    this.cartService.setOrderUserProfileId(userProfile.id);
                    this.cartService.setAvailableCredits(userProfile.credits);
                    await this.loader.dismiss();
                    return userProfile;
                }
            }
        } catch (error) {
            console.log(error);
            await this.errorHandler(error);
        }
    }

    /** Creates a user profile in the API
     * @param userProfile The user profile to create
     * @returns Promise<UserProfile> Promise to know when creating is done containing the inserted UserProfile
     */
    public create(userProfile: UserProfile): Promise<UserProfile> {
        return this.http.post(AppSettings.apiUrl + this.controller, userProfile)
            .catch(error => Observable.throw(error.json()))
            .map(response => response.json())
            .toPromise();
    }

    /** Updates a user profile to the API
     * @param userProfile The user profile to update
     * @returns Promise<UserProfile> Promise to know when updating is done containing the inserted UserProfile
     */
    public save(userProfile: UserProfile): Promise<UserProfile> {
        return this.http.put(AppSettings.apiUrl + this.controller, userProfile)
            .catch(error => Observable.throw(error.json()))
            .map(response => response.json())
            .toPromise();
    }

    /** Retrieves a user profile from the API by external id 
     * @param externalId The externalId to get the user profile for
     * @returns Promise<UserProfile> Promise that contains user profile when resolved
     */
    public getByExternalId(externalId: string): Promise<UserProfile> {
        return this.http.get(AppSettings.apiUrl + this.controller + 'byexternalid/' + externalId)
            .catch(error => Observable.throw(error.json()))
            .map(response => response.json())
            .map(raw => this.parse(raw))
            .toPromise();
    }

    /** Retrieves a user profile from the API by uuid 
     * @param uuid The uuid to get the user profile for
     * @returns Promise<UserProfile> Promise that contains user profile when resolved
     */
    public getByUuid(uuid: string): Promise<UserProfile> {
        return this.http.get(AppSettings.apiUrl + this.controller + 'byuuid/' + uuid)
            .catch(error => Observable.throw(error.json()))
            .map(response => response.json())
            .map(raw => this.parse(raw))
            .toPromise();
    }

    /**
     * Logs out and clears the userprofile afterwards.
     */
    public async logout(showLogoutPopup: boolean = true): Promise<void> {
        this.authService.logout();

        if (showLogoutPopup) {
            // inform the user with a dialog
            let alert = this.alertController.create({
                title: 'Je bent uitgelogd!',
                subTitle: 'Je bent succesvol uitgelogd. Je kunt natuurlijk altijd weer opnieuw inloggen.',
                buttons: ['OK']
            });
            await alert.present();
        }
    }

    public login(): void {

    }

    public async register(): Promise<UserProfile> {
        // await this.authService.register();
        if (!this.authService.loggedIn) return;

        try {
            // Check if a user profile with the auth0 id already exists
            let userId = this.authService.getUserId();
            let userProfile = await this.getByExternalId(userId);

            // If the user profile retrieved is not null, the user needs to be alerted to login instead of registering
            if (userProfile) {
                // Log out if a user profile with this auth0 id already exists
                await this.logout(false);
                // Notify that they should try to login instead of registering
                let alert: Alert = this.alertController.create({
                    title: 'Dit account bestaat al',
                    subTitle: 'Probeer in te loggen in plaats van te registreren',
                    buttons: ['Ok']
                });
                await alert.present();
            } else {

                let firstname = localStorage.getItem(LocalStorageKeys.FirstName);
                if (firstname === undefined || firstname === 'undefined') firstname = '';
                let lastname = localStorage.getItem(LocalStorageKeys.LastName) || '';
                if (lastname === undefined || lastname === 'undefined') lastname = '';
                const email = localStorage.getItem(LocalStorageKeys.Email);
                const username = localStorage.getItem(LocalStorageKeys.Username);

                // Create new user profile if no user profile exists with the auth0 id
                let uuid = await this.utilities.getDeviceUuid();
                let newUserProfile = {
                    externalId: userId,
                    uuid,
                    email,
                    firstname,
                    lastname,
                    username
                } as UserProfile;

                userProfile = await this.create(newUserProfile);
                this.cartService.setOrderUserProfileId(userProfile.id);
                this.cartService.setAvailableCredits(userProfile.credits);
                return userProfile;
            }
        } catch (error) {
            await this.errorHandler(error);
        }
    }

    /** Parses raw json to a user profile
     * @param raw The raw json
     * @returns UserProfile The parsed user profile
     */
    private parse(raw: any): UserProfile {
        if (!raw) return null;

        return {
            id: raw.id,
            uuid: raw.uuid,
            externalId: raw.externalId,
            address: raw.address,
            city: raw.city,
            company: raw.company,
            email: raw.email,
            firstname: raw.firstname,
            gender: raw.gender,
            lastname: raw.lastname,
            title: raw.title,
            username: raw.username,
            zip: raw.zip,
            credits: raw.credits,
            referralCode: raw.referralCode,
            usedReferralCodes: raw.usedReferralCodes,
        } as UserProfile;
    }

    private async errorHandler(error: any): Promise<void> {
        this.loader.dismissAll();
        if (error) {
            this.notificationController.notifyError(`Error in UserProfileService, see error body for more details.`, error);
        }
    }
}