import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';

@Injectable()
export class NetworkService {

    private dsiconnectedSubscription;
    private connectedSubscription;
    public connected = false;
    private toastShown = false;

    constructor(private network: Network, private toast: Toast) { }

    /**
     * Checks if the device has a connection.

     * See http://ionicframework.com/docs/native/network/ for all available network types.
     */
    public HasValidConnection(): boolean {
        if (this.network.type === 'wifi' || '4g' || '3g') {
            this.connected = true;
            return true;
        }
        return false;
    }

    /**
     * Gets the connection type of the device.
     * 
     * See http://ionicframework.com/docs/native/network/ for all available network types.
     * 
     * NOTE: When testing in browser this will always return 'null'
     */
    public GetConnectionType(): string {
        return this.network.type;
    }

    /**
     * Starts listening for onDisconnect and onConnect events.
     * Sets the 'connected' boolean to the correct status.
     */
    public RegisterConnectionListener() {
        this.dsiconnectedSubscription = this.network.onDisconnect().subscribe(() => {
            this.connected = false;
            console.log('Network Service: disconnected from network source')
            if (!this.toastShown) {
                this.toast.showWithOptions({
                    message: 'Geen internet verbinding',
                    duration: 10000,
                    position: 'top',
                    styling: {
                        backgroundColor: '#dd2c38',
                        horizontalPadding: 100
                    }
                }).subscribe(toast => {
                    this.toastShown = true;
                });
            }
        });

        this.connectedSubscription = this.network.onConnect().subscribe(() => {
            console.log('Network Service: connected to network source')
            setTimeout(() => {
                this.connected = this.HasValidConnection();
                this.toastShown = false;
            }, 3000);
        });
    }
}