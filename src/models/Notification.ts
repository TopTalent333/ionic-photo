export class Notification {
    public sendOn: Date;
    public expirationDate: Date;
    public message: string;
    public couponCode: string;
    public selected: boolean = false;
}