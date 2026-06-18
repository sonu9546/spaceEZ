// Web OTP API typings (experimental)
interface OTPCredential extends Credential {
    code: string;
}

interface OTPCredentialRequestOptions {
    otp: {
        transport: Array<'sms'>;
    };
}

interface CredentialRequestOptions {
    otp?: {
        transport: Array<'sms'>;
    };
}
