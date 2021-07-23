export class AppSettings {
    // API
    public static apiUrl: string = 'https://api.fotosimpel.app/';
    // public static apiUrl: string = 'http://localhost:52457/';
    // public static apiUrl: string = 'https://api.medialectua.com/fotosimpel/vnext/';
    public static appVersion: string = '3.1.3';

    // Currency
    public static currencySign: string = '€';

    // Google
    public static googleAnalyticsId: string = 'UA-88094752-1';

    public static rollbar: any = {
        enabled: true,
        token: '12dcc739f06d4689836034e5f588c304',
    };
    


    // Auth0
    public static auth0ClientId: string = 'lYlyZeALxNhw0VlSRk3sfw3BWd0Ut47S';
    public static auth0Domain: string = 'fotosimpel.eu.auth0.com';
    public static auth0Connections: string[] = ['FotoSimpel', 'google-oauth2', 'facebook'];
    public static auth0Connection: string = 'FotoSimpel';
    public static auth0Audience: string = 'https://api.medialectua.com/fotosimpel/v3/';
    public static auth0Scope: string = 'openid profile offline_access'


    // Images
    public static loginIconLocation: string = '';

    // Adobe CSDK Image Editor
    public static imageEditorOptions: any = {
        outputType: 0, // CSDKImageEditor.OutputType.JPEG,
        //   outputType: 1, // CSDKImageEditor.OutputType.PNG,
        tools: [
            // 0, // CSDKImageEditor.ToolType.SHARPNESS,
            1, // CSDKImageEditor.ToolType.EFFECTS,
            // 2, // CSDKImageEditor.ToolType.REDEYE,
            3, // CSDKImageEditor.ToolType.CROP,
            // 4, // CSDKImageEditor.ToolType.WHITEN,
            // 5, // CSDKImageEditor.ToolType.DRAW,
            // 6, // CSDKImageEditor.ToolType.STICKERS,
            // 7, // CSDKImageEditor.ToolType.TEXT,
            // 8, // CSDKImageEditor.ToolType.BLEMISH,
            // 9, // CSDKImageEditor.ToolType.MEME,
            // 10, // CSDKImageEditor.ToolType.ORIENTATION,
            // 11, // CSDKImageEditor.ToolType.ENHANCE,
            12, // CSDKImageEditor.ToolType.FRAMES,
            // 13, // CSDKImageEditor.ToolType.SPLASH,
            // 14, // CSDKImageEditor.ToolType.FOCUS,
            // 15, // CSDKImageEditor.ToolType.BLUR,
            // 16, // CSDKImageEditor.ToolType.VIGNETTE,
            // 17, // CSDKImageEditor.ToolType.LIGHTING,
            // 18, // CSDKImageEditor.ToolType.COLOR,
            // 19, // CSDKImageEditor.ToolType.OVERLAYS,
            // 20 // CSDKImageEditor.ToolType.ADJUST
        ],
        quality: 90,
    };

    // Sharing
    public static shareMessage: string = 'Dit is je unieke gratis code voor €5 Fotosimpel tegoed: \'{referralCode}\'! Gebruik deze code en nodig daarna ook een vriend / vriendin uit om gebruik te maken van de Fotosimpel app. Want dan verdien jij nog een keer €5 extra tegoed, zodat je nog meer foto’s van je smartphone af kunt drukken. => {appStoreLink}';
    public static shareSubject: string = 'Fotosimpel referentie code \'{referralCode}\' voor €5 tegoed in de Fotosimpel app';

    // App stores
    public static appleAppStore: string = 'https://itunes.apple.com/app/fotosimpel/id874307336?mt=8';
    public static googlePlayStore: string = 'https://play.google.com/store/apps/details?id=com.provalue.fotosimpel';

    // PushWoosh
    public static pushWooshAppId: string = '2DB3D-D58D4';
    public static pushWooshGoogleProjectNumber: string = '550342690443';
}