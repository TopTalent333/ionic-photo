import { Injectable, NgZone } from '@angular/core';
import Auth0Cordova from '@auth0/cordova';
import * as auth0 from 'auth0-js';
import { AUTH_CONFIG } from '../infra/auth-config';
import { LocalStorageKeys } from '../infra/local-storage-keys';


@Injectable()
export class AuthService {

    public user: any;
    public loggedIn: boolean;

    private Auth0 = new auth0.WebAuth(AUTH_CONFIG);
    private client = new Auth0Cordova(AUTH_CONFIG);
    private accessToken: string;
    private loading = true;

    constructor(
        public zone: NgZone
    ) {
        this.accessToken = localStorage.getItem(LocalStorageKeys.AccessToken);
        const exp = localStorage.getItem(LocalStorageKeys.TokenExpiresAt);
        this.loggedIn = Date.now() < JSON.parse(exp);
        this.loading = false;
    }

    public async authorize(type: 'login' | 'register'): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loading = true;

            // Authorize login request with Auth0: open login page and get auth results
            this.client.authorize({
                scope: 'openid email profile',
                login_hint: type === 'register' ? 'signUp' : 'login',
            }, (err: any, authResult: any) => {
                if (err === 'Error: user canceled') resolve('User canceled');
                if (err) reject(err);
                if (!err && authResult) {
                    // Set Access Token
                    localStorage.setItem(LocalStorageKeys.AccessToken, authResult.accessToken);
                    this.accessToken = authResult.accessToken;
                    // Set Access Token expiration
                    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
                    localStorage.setItem(LocalStorageKeys.TokenExpiresAt, expiresAt);
                    // Set logged in
                    this.loading = false;
                    this.loggedIn = true;
                    // Fetch user's profile info
                    this.Auth0.client.userInfo(this.accessToken, (err, profile) => {
                        if (err) {
                            reject(err);
                        }
                        localStorage.setItem(LocalStorageKeys.Username, profile.nickname);
                        localStorage.setItem(LocalStorageKeys.Email, profile.email);
                        localStorage.setItem(LocalStorageKeys.UserId, profile.sub);
                        localStorage.setItem(LocalStorageKeys.FirstName, profile.given_name);
                        localStorage.setItem(LocalStorageKeys.LastName, profile.family_name);

                        resolve();
                    });
                } else reject('Canceled / No authentication result');
            });
        })
    }

    public authenticated(): boolean {
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return Date.now() < expiresAt;
    }

    public logout(): void {
        this.loggedIn = false;
        localStorage.clear();
    }

    public getUserId(): any {
        return localStorage.getItem(LocalStorageKeys.UserId);
    }
}
