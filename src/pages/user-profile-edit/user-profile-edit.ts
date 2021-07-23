import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { Keyboard } from '@ionic-native/keyboard';
import { NavController, Platform } from 'ionic-angular';
import { Order } from '../../models/Order';
import { UserProfile } from '../../models/UserProfile';
import { CartService } from '../../services/CartService';
import { UserProfileService } from '../../services/UserProfileService';
import { ModelValidators } from '../../util/ModelValidators';

@Component({
    templateUrl: 'user-profile-edit.html'
})
export class UserProfileEditPage {

    private order: Order;
    private profileForm: FormGroup;
    private userProfile: UserProfile;

    constructor(
        private navCtrl: NavController,
        private cart: CartService,
        private userProfileService: UserProfileService,
        private formBuilder: FormBuilder,
        private platform: Platform,
        private googleAnalytics: GoogleAnalytics,
        private keyboard: Keyboard
    ) {
        this.order = cart.getOrder();
    }

    private async ionViewDidEnter(): Promise<void> {
        await this.platform.ready();
        if (this.platform.is('cordova')) await this.googleAnalytics.trackView('Klantgegevens wijzigen');
    }

    private async ionViewWillEnter(): Promise<void> {
        this.userProfile = await this.userProfileService.get();
        this.profileForm.get('title').setValue(this.userProfile.title);
        this.profileForm.get('firstname').setValue(this.userProfile.firstname);
        this.profileForm.get('lastname').setValue(this.userProfile.lastname);
        this.profileForm.get('company').setValue(this.userProfile.company);
        this.profileForm.get('email').setValue(this.userProfile.email);
        this.profileForm.get('address').setValue(this.userProfile.address);
        this.profileForm.get('zip').setValue(this.userProfile.zip);
        this.profileForm.get('city').setValue(this.userProfile.city);
    }

    ionViewDidLoad(): void {
        this.profileForm = this.formBuilder.group({
            'title': ['', [Validators.required]],
            'firstname': ['', [Validators.required, ModelValidators.trimmedNotEmpty]],
            'lastname': ['', [Validators.required, ModelValidators.trimmedNotEmpty]],
            'company': ['', []],
            'email': ['', [Validators.required, ModelValidators.trimmedNotEmpty, ModelValidators.emailValid]],
            'address': ['', [Validators.required, ModelValidators.trimmedNotEmpty]],
            'zip': ['', [Validators.required, ModelValidators.trimmedNotEmpty]],
            'city': ['', [Validators.required, ModelValidators.trimmedNotEmpty]]
        });
    }

    private async save(): Promise<void> {
        // Force close the keyboard in case it stays open
        this.keyboard.hide();
        // Make sure the form is valid
        if (this.profileForm.valid) {
            this.userProfile.title = this.profileForm.get('title').value;
            this.userProfile.firstname = this.profileForm.get('firstname').value;
            this.userProfile.lastname = this.profileForm.get('lastname').value;
            this.userProfile.company = this.profileForm.get('company').value;
            this.userProfile.email = this.profileForm.get('email').value;
            this.userProfile.address = this.profileForm.get('address').value;
            this.userProfile.zip = this.profileForm.get('zip').value;
            this.userProfile.city = this.profileForm.get('city').value;

            this.cart.setOrderUserProfileId(this.userProfile.id);
            await this.userProfileService.save(this.userProfile);
            await this.navCtrl.pop();
        } else {
            // Do nothing, the Keyboard was just closed so the user can see the visual errors in the form
        }
    }
}
