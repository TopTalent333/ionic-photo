export class UserProfile {
    id: number;

    uuid: string;
    externalId: string;
    username: string;

    title: string;
    gender: string;
    firstname: string;
    lastname: string;
    email: string;
    company: string;
    zip: string;
    address: string;
    city: string;
    credits: number = 0;
    referralCode: string;
    usedReferralCodes: string[];
}