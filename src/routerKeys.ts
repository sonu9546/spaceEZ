export const ROUTES = {
    WELCOME:{
        WELCOME:`/`
    },
    // Auth group
    AUTH:{
        LOGIN: "/login",
        REGISTER: "/register",
        VERIFY_OTP: "/otp-verify",
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: "/reset-password",
    },

    // Protected group
    PRIVATE:{
        HOME: "/dashboard",
        PROFILE: "/profile",
        SETTING:"/setting",
        DASHBOARD: "/dashboard",
        PARKS: "/parks",
        ADD_PARK: "/parks/add",
    },

    // Common public pages
    COMMON:{
        DELETE_ACCOUNT: "/delete-account",
        TERMS: "/terms",
        PRIVACY: "/privacy",
        CONTACT: "/contact",
    },
} as const