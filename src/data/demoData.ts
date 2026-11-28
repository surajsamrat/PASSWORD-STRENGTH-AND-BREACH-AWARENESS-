import type {
  ActivityItem,
  DemoEmailBreach,
  HygieneChecklistItem,
} from "@/types/security";

export interface SecurityTip {
  id: string;
  categoryEn: string;
  categoryHi: string;
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
}

export const DAILY_SECURITY_TIPS: SecurityTip[] = [
  {
    id: "tip-passphrase",
    categoryEn: "Password Hygiene",
    categoryHi: "पासवर्ड सुरक्षा",
    titleEn: "Prefer 4–5 Random Words Over Complex Short Passwords",
    titleHi: "छोटे जटिल पासवर्ड के बजाय 4–5 यादृच्छिक शब्दों का पासफ़्रेज़ चुनें",
    bodyEn:
      "A 5-word diceware passphrase (e.g., falcon-cedar-orbit-quartz-ember) provides high entropy and resists GPU brute-forcing far better than 8 characters with symbols.",
    bodyHi:
      "5 यादृच्छिक शब्दों वाला पासफ़्रेज़ याद रखने में आसान और ब्रूट-फ़ोर्स हमलों के खिलाफ कहीं अधिक मजबूत होता है।",
  },
  {
    id: "tip-passkeys",
    categoryEn: "Phishing Resistance",
    categoryHi: "फ़िशिंग से बचाव",
    titleEn: "Upgrade Critical Accounts to Passkeys or TOTP",
    titleHi: "मुख्य खातों पर पासकी या ऑथेंटिकेटर ऐप (TOTP) चालू करें",
    bodyEn:
      "Passkeys bind cryptographically to the real domain, preventing attackers from stealing your login even on a convincing lookalike phishing site.",
    bodyHi:
      "पासकी केवल असली वेबसाइट डोमेन पर काम करती है, जिससे नकली फ़िशिंग वेबसाइट पर आपका खाता सुरक्षित रहता है।",
  },
  {
    id: "tip-kanon",
    categoryEn: "Breach Privacy",
    categoryHi: "डेटा ब्रीच गोपनीयता",
    titleEn: "Never Paste Real Passwords Into Unverified Sites",
    titleHi: "किसी भी अनजान वेबसाइट पर अपना असली पासवर्ड न जांचें",
    bodyEn:
      "SecureCheck checks breached passwords via k-Anonymity: only the first 5 characters of your password's SHA-1 hash leave your browser.",
    bodyHi:
      "SecureCheck k-Anonymity का उपयोग करता है: आपके पासवर्ड के SHA-1 हैश के केवल पहले 5 अक्षर ही जांच के लिए भेजे जाते हैं।",
  },
  {
    id: "tip-recovery",
    categoryEn: "Account Recovery",
    categoryHi: "खाता रिकवरी",
    titleEn: "Store 2FA Backup Codes Offline",
    titleHi: "2FA बैकअप कोड ऑफ़लाइन सुरक्षित स्थान पर रखें",
    bodyEn:
      "If you lose your phone, printed or encrypted offline backup codes prevent permanent lockout from your email and financial accounts.",
    bodyHi:
      "फ़ोन खो जाने की स्थिति में ऑफ़लाइन सुरक्षित रखे गए बैकअप कोड आपको अपने खातों से लॉक होने से बचाते हैं।",
  },
];

/**
 * CLEARLY MARKED DEMO DATA:
 * HIBP Email Breach lookup requires a paid server-side API key.
 * These sample records demonstrate breach awareness reports without faking a live email API.
 */
export const DEMO_EMAIL_BREACH_PROFILES: Record<string, DemoEmailBreach[]> = {
  "demo@securecheck.local": [
    {
      id: "demo-breach-1",
      breachName: "CloudCart Retail (Demo Dataset)",
      domain: "cloudcart-demo.example",
      breachDate: "2024-08-14",
      pwnCountLabel: "4.2M records (Demo)",
      dataClasses: ["Email addresses", "Salted SHA-1 passwords", "Phone numbers"],
      severity: "high",
      descriptionEn:
        "Simulated e-commerce credential dump illustrating legacy weak hashing exposure.",
      descriptionHi:
        "कमज़ोर हैशिंग से प्रभावित ई-कॉमर्स डेटा ब्रीच का एक डेमो उदाहरण।",
    },
    {
      id: "demo-breach-2",
      breachName: "DevForum Community (Demo Dataset)",
      domain: "devforum-demo.example",
      breachDate: "2023-03-22",
      pwnCountLabel: "890K records (Demo)",
      dataClasses: ["Email addresses", "Usernames", "IP addresses"],
      severity: "medium",
      descriptionEn:
        "Simulated forum metadata exposure used to demonstrate targeted phishing follow-ups.",
      descriptionHi:
        "लक्षित फ़िशिंग जोखिम को समझाने के लिए डेमो फ़ोरम डेटा लीक रिकॉर्ड।",
    },
  ],
  "alex.rivera@example.com": [
    {
      id: "demo-breach-3",
      breachName: "StreamPulse Media (Demo Dataset)",
      domain: "streampulse-demo.example",
      breachDate: "2025-01-19",
      pwnCountLabel: "1.6M records (Demo)",
      dataClasses: ["Email addresses", "Passwords", "Billing ZIP codes"],
      severity: "high",
      descriptionEn:
        "Simulated third-party streaming breach demonstrating credential reuse risk.",
      descriptionHi:
        "एक ही पासवर्ड को दोबारा उपयोग करने के जोखिम को दिखाने वाला डेमो डेटा ब्रीच।",
    },
  ],
};

export const PHISHING_SAMPLE_CASES = [
  {
    id: "sample-phish-bank",
    labelEn: "Misleading Subdomain + KYC",
    labelHi: "भ्रामक सबडोमेन + KYC",
    url: "http://sbi.kyc-update.verify-login.xyz/auth/otp",
    message:
      "URGENT: Dear Customer, your account will be suspended within 24 hours. Enter your OTP and verify KYC immediately.",
  },
  {
    id: "sample-ip-host",
    labelEn: "IP-Based Login URL",
    labelHi: "IP-आधारित लॉगिन URL",
    url: "http://198.51.100.42:8080/signin/verify",
    message: "",
  },
  {
    id: "sample-shortener",
    labelEn: "Shortened Link (bit.ly)",
    labelHi: "शॉर्ट लिंक (bit.ly)",
    url: "https://bit.ly/3xSampleVerify",
    message: "",
  },
  {
    id: "sample-typosquat",
    labelEn: "Typosquatted Brand",
    labelHi: "नकली टाइपोस्क्वैटिंग डोमेन",
    url: "https://paypa1-secure-update.com/signin/password",
    message:
      "Unauthorized login detected on your account. Confirm your password immediately to prevent permanent lock.",
  },
  {
    id: "sample-safe",
    labelEn: "Official Advisory (Safe)",
    labelHi: "आधिकारिक वेबसाइट (सुरक्षित)",
    url: "https://github.com/settings/security",
    message:
      "Review your active SSH keys and passkeys directly in your GitHub Security Settings.",
  },
];

export const INITIAL_HYGIENE_CHECKLIST: HygieneChecklistItem[] = [
  {
    id: "hyg-manager",
    completed: false,
    titleEn: "Use a dedicated Password Manager",
    titleHi: "एक समर्पित पासवर्ड मैनेजर का उपयोग करें",
    descriptionEn: "Never memorize or reuse passwords across unrelated services.",
    descriptionHi: "अलग-अलग सेवाओं के लिए एक ही पासवर्ड दोबारा उपयोग न करें।",
    weight: 25,
  },
  {
    id: "hyg-mfa",
    completed: false,
    titleEn: "Enable Passkey or TOTP MFA on primary email",
    titleHi: "मुख्य ईमेल पर पासकी या TOTP MFA चालू करें",
    descriptionEn: "Your email is the master recovery key for nearly every other account.",
    descriptionHi: "आपका ईमेल लगभग हर दूसरे खाते की रिकवरी कुंजी होता है।",
    weight: 30,
  },
  {
    id: "hyg-recovery",
    completed: false,
    titleEn: "Back up 2FA recovery codes offline",
    titleHi: "2FA रिकवरी कोड ऑफ़लाइन सुरक्षित रखें",
    descriptionEn: "Prevent account lockouts if your authenticator device is lost.",
    descriptionHi: "फ़ोन खोने की स्थिति में खाता लॉक होने से बचें।",
    weight: 20,
  },
  {
    id: "hyg-updates",
    completed: false,
    titleEn: "Enable automatic OS & browser security patches",
    titleHi: "OS और ब्राउज़र के स्वचालित सुरक्षा अपडेट चालू रखें",
    descriptionEn: "Timely patching closes zero-day exploits targeted by malicious links.",
    descriptionHi: "समय पर अपडेट करने से ब्राउज़र और सिस्टम की कमजोरियां दूर होती हैं।",
    weight: 25,
  },
];

export const DEMO_SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: "demo-act-1",
    type: "analyzer",
    titleEn: "Audited password entropy (84.2 bits — Strong)",
    titleHi: "पासवर्ड एंट्रॉपी की जांच की (84.2 बिट्स — मजबूत)",
    meta: "Demo Profile",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    isDemo: true,
  },
  {
    id: "demo-act-2",
    type: "phishing",
    titleEn: "Flagged typosquatted domain in Phishing Detector",
    titleHi: "फ़िशिंग डिटेक्टर में संदिग्ध डोमेन चिह्नित किया",
    meta: "Demo Profile",
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    isDemo: true,
  },
  {
    id: "demo-act-3",
    type: "breach",
    titleEn: "Verified password k-Anonymity check in Breach Checker",
    titleHi: "ब्रीच चेकर में k-Anonymity पासवर्ड जांच पूरी की",
    meta: "Demo Profile",
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    isDemo: true,
  },
];
