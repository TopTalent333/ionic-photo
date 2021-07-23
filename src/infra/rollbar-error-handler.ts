
import { ErrorHandler, Inject, InjectionToken } from '@angular/core';
import * as Rollbar from 'rollbar';
import { AppSettings } from '../settings/AppSettings';
import { LocalStorageKeys } from './local-storage-keys';

export const RollbarService = new InjectionToken<Rollbar>('rollbar');

const config: Rollbar.Configuration = {
    accessToken: AppSettings.rollbar.token,
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: AppSettings.rollbar.enabled,
    // https://medium.com/@soccerdebater/ionic-and-rollbar-the-perfect-pair-5e0e711bcbab,
    // Fix file names when rollbar throws uncaught errors
    transform: function (payload: any) {
        if (payload && payload.body && payload.body.trace && payload.body.trace.frames) {
            const frames = payload.body.trace.frames;
            for (let i = 0; i < frames.length; i++) {
                if (frames[i].filename.indexOf('main.js') > -1) {
                    payload.body.trace.frames[i].filename = 'file://main.js';
                }
            }
        }
    },
    autoInstrument: {
        network: true,
        log: true,
        dom: true,
        navigation: true,
        connectivity: true,
        networkRequestBody: true,
        networkResponseBody: true,
        networkResponseHeaders: true
    }
};

export function rollbarFactory() {
    return new Rollbar(config);
}

export class RollbarErrorHandler implements ErrorHandler {

    constructor(
        @Inject(RollbarService) private rollbar: Rollbar
    ) { }

    handleError(err: any): void {
        console.log(`[${AppSettings.appVersion}:${localStorage.getItem(LocalStorageKeys.Username)}][uncaught]`, err);
        this.rollbar.error(`[${AppSettings.appVersion}:${localStorage.getItem(LocalStorageKeys.Username)}][uncaught]`, err.originalError || err);
    }
}
