import { AppSettings } from "../settings/AppSettings";

export const AUTH_CONFIG = {
    // Needed for Auth0 (capitalization: ID):
    clientID: AppSettings.auth0ClientId,
    // Needed for Auth0Cordova (capitalization: Id):
    clientId: AppSettings.auth0ClientId,
    domain: AppSettings.auth0Domain,
    packageIdentifier: 'com.provalue.fotosimpel'
}