import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import "rxjs/Rx";
import { Notification } from '../models/Notification';
import { AppSettings } from '../settings/AppSettings';

@Injectable()
export class NotificationService {
    private controller: string = 'notifications/';

    constructor(
        private http: Http
    ) { }

    get = {
        current: (): Promise<Array<Notification>> => {
            return this.http.get(AppSettings.apiUrl + this.controller + 'current/')
                .map(response => response.json())
                .toPromise();
        },
        checkForNew: (id: number): Promise<Array<Notification>> => {
            return this.http.get(AppSettings.apiUrl + this.controller + 'checkfornew/' + id)
                .map(response => response.json())
                .toPromise();
        }
    }
}