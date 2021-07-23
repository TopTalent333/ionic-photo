
import { Inject, Injectable } from '@angular/core';
import { AlertController, Platform, ToastController } from 'ionic-angular';
import * as Rollbar from 'rollbar';
import { LocalStorageKeys } from '../infra/local-storage-keys';
import { AppSettings } from '../settings/AppSettings';
import { RollbarService } from './rollbar-error-handler';

@Injectable()
export class NotificationController {

    private showTime: number = 3000;
    private position: string = 'bottom';
    private closeText: string = 'Sluiten';
    private showCloseButton: boolean = true;

    constructor(
        private toastController: ToastController,
        private alertController: AlertController,
        private platform: Platform,
        @Inject(RollbarService) private rollbar: Rollbar
    ) { }

    public configure() {
        const payload = {
            payload: {
                person: {
                    username: localStorage.getItem(LocalStorageKeys.Username),
                    user_id: localStorage.getItem(LocalStorageKeys.UserId)
                },
                platforms: this.platform.platforms(),
                url: this.platform.url(),
                height: this.platform.height(),
                width: this.platform.width(),
                is_portrait: this.platform.isPortrait(),
                is_landscape: this.platform.isLandscape()
            }
        };
        this.rollbar.configure(payload);
    }

    public async notifyError(details: string, error: any): Promise<void> {
        const json = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.log(location, json);
        this.rollbar.error(`[${AppSettings.appVersion}:${localStorage.getItem(LocalStorageKeys.Username)}]${location}`, json);

        this.showAlert();
    }

    public async notifyInfo(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message: message,
            duration: this.showTime,
            position: 'bottom',
            showCloseButton: this.showCloseButton,
            closeButtonText: this.closeText,
            cssClass: 'toast-info'
        });
        await toast.present();
    }
    public async notifySuccess(message: string): Promise<void> {
        const toast = await this.toastController.create({
            message: message,
            duration: this.showTime,
            position: 'bottom',
            showCloseButton: this.showCloseButton,
            closeButtonText: this.closeText,
            cssClass: 'toast-success'
        });
        await toast.present();
    }

    private async showAlert(): Promise<void> {
        const alert = this.alertController.create({
            title: 'Helaas!',
            message: `Er ging iets mis. Probeer het later nog een keer.`,
            buttons: [
                'OK'
            ]
        });
        alert.present();
    }
}
