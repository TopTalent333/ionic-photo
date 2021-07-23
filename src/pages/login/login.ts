import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { AlertController, App, ModalController, NavController, NavParams, ViewController } from 'ionic-angular';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { Subscription } from 'rxjs/Rx';
import { NotificationController } from '../../infra/notification-controller';
import { AuthService } from '../../services/AuthService';

@Component({
    templateUrl: 'login.html'
})
export class LoginPage {

    // Login
    private loginUsername: string;
    private loginPassword: string;
    private invalidLoginUsername: boolean = false;
    private invalidLoginPassword: boolean = false;
    private invalidCredentials: boolean = false;

    // Register
    private registerUsername: string;
    private registerEmail: string;
    private registerPassword: string;
    private invalidRegisterUsername: boolean = false;
    private invalidRegisterEmail: boolean = false;
    private invalidRegisterPassword: boolean = false;

    private loginLogo: string = 'assets/images/logo-small.png';
    private hideLogo: boolean = false;

    private mode: 'login' | 'register' = 'login';

    private subscriptions: Subscription[] = [];

    constructor(
        private navParams: NavParams,
        private navController: NavController,
        private authService: AuthService,
        private app: App,
        private inAppBrowser: InAppBrowser,
        private alertController: AlertController,
        private keyboard: Keyboard,
        private modal: ModalController,
        private viewController: ViewController,
        private toastController: ToastController,
        private notificationController: NotificationController
    ) {
        const mode = navParams.get('mode');
        this.mode = mode ? mode : this.mode;
    }

    private async ionViewWillEnter(): Promise<void> {
        this.subscriptions.push(this.keyboard.onKeyboardShow().subscribe(() => {
            this.hideLogo = true;
        }));
        this.subscriptions.push(this.keyboard.onKeyboardHide().subscribe(() => {
            this.hideLogo = false;
        }));
    }

    private ionViewWillLeave(): void {
        this.subscriptions.forEach(x => x.unsubscribe());
    }

    private dismiss(success: boolean = false): void {
        this.viewController.dismiss({
            success,
            email: this.registerEmail,
            username: this.registerUsername,
            mode: this.mode
        });
    }

    private async login(): Promise<void> {
        if (!this.validateLogin()) return;
        try {
            // await this.authService.login(this.loginUsername, this.loginPassword);
            this.keyboard.hide();
        } catch (e) {
            if (e.description.includes('Wrong email or password.')) {
                this.invalidCredentials = true;
                return;
            }
            this.notificationController.notifyError(`[login_page/login]`, { error: e });
        }
        this.dismiss(true);
    }

    private async resetPassword(): Promise<void> {
        let alert = this.alertController.create({
            title: 'Reset je wachtwoord',
            message: 'Vul hier je email adres in. Wij zullen je een email met instructies toesturen.',
            inputs: [
                {
                    name: 'email',
                    placeholder: 'email',
                }
            ],
            buttons: [
                {
                    text: 'Annuleren',
                    role: 'cancel',
                    handler: () => { }
                },
                {
                    text: 'Reset',
                    handler: data => {
                        try {
                            // this.authService.createResetPasswordRequest(data.email);
                        } catch (e) {
                            this.notificationController.notifyError('[login_page/resetPassword]', { error: e });
                        }
                    }
                }
            ]
        });
        alert.present();
    }

    private validateLogin(): boolean {
        this.invalidLoginUsername = false;
        this.invalidLoginPassword = false;
        let valid = true;
        if (!this.loginUsername || this.loginUsername === '') {
            this.invalidLoginUsername = true;
            valid = false;
        }
        if (!this.loginPassword || this.loginPassword === '') {
            this.invalidLoginPassword = true;
            valid = false;
        }
        return valid;
    }

    private loginEventHandler(keycode: any): void {
        // On enter press
        if (keycode == 13) {
            this.login();
        }
    }

    private async register(): Promise<void> {
        if (!this.validateRegistration()) return;

        try {
            // await this.authService.register(this.registerUsername, this.registerEmail, this.registerPassword);
            this.keyboard.hide();
        } catch (error) {
            // if (error.description.includes('Wrong email or password.')) {
            //     // TODO
            //     return;
            // }
            if (error.code = 'user_exists') {
                const toast = this.toastController.create({
                    message: `Er bestaat al een gebruiker met email '${this.registerEmail}'`,
                    duration: 3000,
                    showCloseButton: true,
                    dismissOnPageChange: true,
                    position: 'bottom'
                })
                toast.present();
            }

            this.notificationController.notifyError(`[login_page/login]`, { error });
        }
        this.dismiss(true);
    }


    private validateRegistration(): boolean {
        this.invalidRegisterUsername = false;
        this.invalidRegisterEmail = false;
        this.invalidRegisterPassword = false;
        let valid = true;
        if (!this.registerUsername || this.registerUsername === '') {
            this.invalidRegisterUsername = true;
            valid = false;
        }
        if (!this.registerEmail || this.registerEmail === '') {
            this.invalidRegisterEmail = true;
            valid = false;
        }
        if (!this.registerPassword || this.registerPassword === '') {
            this.invalidRegisterPassword = true;
            valid = false;
        }
        return valid;
    }

    private registerEventHandler(keycode: any): void {
        // On enter press
        if (keycode == 13) {
            this.register();
        }
    }
}
