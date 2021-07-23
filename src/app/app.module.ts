import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppVersion } from '@ionic-native/app-version';
import { Badge } from '@ionic-native/badge';
import { Clipboard } from '@ionic-native/clipboard';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FCM } from '@ionic-native/fcm';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Insomnia } from '@ionic-native/insomnia';
import { Keyboard } from '@ionic-native/keyboard';
import { Network } from '@ionic-native/network';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Toast } from '@ionic-native/toast';
import { IonicStorageModule } from '@ionic/storage';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { NotificationController } from '../infra/notification-controller';
import { RollbarErrorHandler, rollbarFactory, RollbarService } from '../infra/rollbar-error-handler';
import { AboutPage } from '../pages/about/about';
import { AuthModal } from '../pages/auth-modal/auth-modal';
import { CanvasPage } from '../pages/canvas/canvas';
import { CartPage } from '../pages/cart/cart';
import { CheckoutPage } from '../pages/checkout/checkout';
import { ContactPage } from '../pages/contact/contact';
import { CreditInfoModal } from '../pages/credit-info-modal/credit-info-modal';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { MemberGetsMemberModal } from '../pages/member-gets-member-modal/member-gets-member-modal';
import { MemberGetsMemberPage } from '../pages/member-gets-member/member-gets-member';
import { MosaicPage } from '../pages/mosaic/mosaic';
import { PosterPage } from '../pages/poster/poster';
import { PricesPage } from '../pages/prices/prices';
import { PrintPage } from '../pages/print/print';
import { ProductSelectionPage } from '../pages/product-selection/product-selection';
import { SalesPage } from '../pages/sales/sales';
import { UploadPage } from '../pages/upload/upload';
import { UserProfileEditPage } from '../pages/user-profile-edit/user-profile-edit';
import { UserProfilePage } from '../pages/user-profile/user-profile';
import { AuthService } from '../services/AuthService';
import { CartService } from '../services/CartService';
import { ImageService } from '../services/ImageService';
import { NetworkService } from '../services/NetworkService';
import { NotificationService } from '../services/NotificationService';
import { OrderService } from '../services/OrderService';
import { ProductService } from '../services/ProductService';
import { UserProfileService } from '../services/UserProfileService';
import { VoucherService } from '../services/VoucherService';
import { Utilities } from '../util/Utilities';
import { Fotosimpel } from './app.component';

@NgModule({
    declarations: [
        Fotosimpel,
        AboutPage,
        ContactPage,
        HomePage,
        CartPage,
        CanvasPage,
        PosterPage,
        PricesPage,
        ProductSelectionPage,
        CheckoutPage,
        PrintPage,
        UploadPage,
        UserProfileEditPage,
        AuthModal,
        CreditInfoModal,
        UserProfilePage,
        MosaicPage,
        MemberGetsMemberPage,
        MemberGetsMemberModal,
        SalesPage,
        LoginPage
    ],
    imports: [
        IonicModule.forRoot(
            Fotosimpel,
            {
                backButtonText: 'Terug',
                iconMode: 'md',
                modalEnter: 'modal-slide-in',
                modalLeave: 'modal-slide-out',
                pageTransition: 'ios'
            }),
        BrowserModule,
        HttpModule,
        IonicStorageModule.forRoot()
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        Fotosimpel,
        AboutPage,
        ContactPage,
        HomePage,
        CartPage,
        PricesPage,
        MosaicPage,
        CanvasPage,
        PosterPage,
        ProductSelectionPage,
        CheckoutPage,
        PrintPage,
        UploadPage,
        UserProfileEditPage,
        AuthModal,
        CreditInfoModal,
        MemberGetsMemberModal,
        UserProfilePage,
        MemberGetsMemberPage,
        SalesPage,
        LoginPage
    ],
    providers: [
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        GoogleAnalytics,
        InAppBrowser,
        Diagnostic,
        Badge,
        FCM,
        StatusBar,
        SplashScreen,
        AppVersion,
        CartService,
        OrderService,
        Utilities,
        ProductService,
        File,
        VoucherService,
        UserProfileService,
        AuthService,
        ImageService,
        NotificationController,
        NotificationService,
        Network,
        NetworkService,
        Toast,
        Clipboard,
        SocialSharing,
        Keyboard,
        FileTransfer,
        Insomnia,
        { provide: ErrorHandler, useClass: RollbarErrorHandler },
        { provide: RollbarService, useFactory: rollbarFactory }
    ]
})
export class AppModule { }
