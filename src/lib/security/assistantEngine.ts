import type { Language } from "@/types/security";

export interface AssistantReply {
  answer: string;
  tags: string[];
  suggestedFollowUps: string[];
}

interface TopicRule {
  keywords: string[];
  tags: string[];
  en: string;
  hi: string;
  followUpsEn: string[];
  followUpsHi: string[];
}

const RULES: TopicRule[] = [
  {
    keywords: ["breach", "pwned", "leaked", "hacked", "compromised", "लीक", "ब्रीच", "हैक"],
    tags: ["Incident Response", "Breach Triage"],
    en: `**Immediate Breach Containment Playbook:**
1. **Change the exposed password first** — use a unique 16+ character CSPRNG password (never reuse it anywhere).
2. **Rotate any other accounts** that shared that same or similar password (credential stuffing is automated).
3. **Revoke active sessions & OAuth tokens** inside account security settings.
4. **Enable phishing-resistant MFA** (Passkey / FIDO2 hardware key or Authenticator app — avoid SMS where possible).
5. **Watch for follow-up phishing** — attackers often send fake "account recovery" emails using leaked metadata.`,
    hi: `**डेटा ब्रीच होने पर तुरंत उठाए जाने वाले कदम:**
1. **सबसे पहले लीक हुआ पासवर्ड बदलें** — 16+ अक्षरों का नया और अद्वितीय पासवर्ड उपयोग करें।
2. **उन सभी अन्य खातों का पासवर्ड बदलें** जहाँ वही या मिलता-जुलता पासवर्ड इस्तेमाल किया गया था।
3. **सक्रिय लॉगिन सत्र (Active Sessions) और थर्ड-पार्टी ऐप्स** को सुरक्षा सेटिंग्स से लॉगआउट/रिवोक करें।
4. **मजबूत MFA चालू करें** (पासकी / ऑथेंटिकेटर ऐप का उपयोग करें; केवल SMS OTP पर निर्भर न रहें)।
5. **फ़ॉलो-अप फ़िशिंग से सावधान रहें** — हमलावर लीक जानकारी का उपयोग करके नकली अलर्ट ईमेल भेज सकते हैं।`,
    followUpsEn: ["How do passkeys compare to TOTP apps?", "How should I audit my reused passwords?"],
    followUpsHi: ["पासकी और ऑथेंटिकेटर ऐप में क्या अंतर है?", "दोबारा उपयोग किए गए पासवर्ड की जांच कैसे करें?"],
  },
  {
    keywords: ["phish", "link", "email", "sms", "scam", "otp", "kyc", "फ़िशिंग", "लिंक", "स्कैम"],
    tags: ["Phishing Defense", "Verification"],
    en: `**How to Verify a Suspicious Message or URL:**
1. **Inspect the true root domain** (the two labels immediately before the first \`/\`, e.g., \`example.com\` in \`login.bank.example.com\`).
2. **Ignore urgency & fear triggers** — "Account suspended in 24h" or "Verify KYC now" are classic social engineering pressures.
3. **Never authenticate via an inbound link** — open a fresh tab and type the official bookmark or domain manually.
4. **Check for lookalike characters** (typosquatting like \`rn\` vs \`m\`, or \`xn--\` punycode domains).
5. **Test it inside SecureCheck's Phishing Detector** to inspect domain structure, TLDs, and linguistic lures locally.`,
    hi: `**संदिग्ध संदेश या लिंक की जांच करने के 5 नियम:**
1. **असली रूट डोमेन जांचें** — पहले \`/\` से ठीक पहले के दो हिस्से देखें (जैसे \`login.bank.example.com\` में असली डोमेन \`example.com\` है)।
2. **जल्दबाजी या डर के दबाव में न आएं** — "24 घंटे में खाता बंद" या "तुरंत KYC अपडेट करें" आम ठगी के तरीके हैं।
3. **संदेश में दिए लिंक से लॉगिन न करें** — हमेशा नया टैब खोलकर आधिकारिक वेबसाइट स्वयं टाइप करें।
4. **मिलते-जुलते अक्षरों से सावधान रहें** (जैसे \`l\` की जगह \`1\`, या \`xn--\` डोमेन)।
5. **SecureCheck के Phishing Detector** में लिंक या टेक्स्ट पेस्ट करके स्थानीय रूप से जांच करें।`,
    followUpsEn: ["What makes a domain typosquatted?", "Why is SMS OTP vulnerable to phishing?"],
    followUpsHi: ["टाइपोस्क्वैटिंग डोमेन कैसे पहचानें?", "SMS OTP क्यों कम सुरक्षित माना जाता है?"],
  },
  {
    keywords: ["mfa", "2fa", "passkey", "fido", "authenticator", "totp", "sms", "दो-कारक"],
    tags: ["Authentication", "NIST 800-63B"],
    en: `**MFA Strength Hierarchy (Strongest to Weakest):**
1. **Passkeys / FIDO2 Hardware Keys (Best)** — Cryptographically bound to the exact origin domain, making them immune to phishing and AitM proxies.
2. **Authenticator Apps (TOTP)** — Much safer than SMS because codes stay offline on your device, though still phishable on fake login pages.
3. **Push Notifications (with Number Matching)** — Convenient, but guard against MFA fatigue attacks (never approve unexpected prompts).
4. **SMS / Voice OTP (Weakest)** — Vulnerable to SIM-swapping and SS7 interception; replace with an authenticator app or passkey whenever supported.`,
    hi: `**MFA सुरक्षा स्तर (सबसे मजबूत से कमजोर):**
1. **पासकी / FIDO2 हार्डवेयर कुंजी (सर्वश्रेष्ठ)** — यह डोमेन के साथ क्रिप्टोग्राफिक रूप से जुड़ी होती है, इसलिए फ़िशिंग से पूरी तरह सुरक्षित है।
2. **ऑथेंटिकेटर ऐप (TOTP)** — SMS से कहीं अधिक सुरक्षित क्योंकि कोड आपके डिवाइस पर ऑफ़लाइन बनते हैं।
3. **पुश नोटिफिकेशन (नंबर मैचिंग के साथ)** — सुविधाजनक है, लेकिन अनचाहे लॉगिन अनुरोध को कभी स्वीकार न करें।
4. **SMS / कॉल OTP (सबसे कमजोर)** — सिम-स्वैपिंग का जोखिम रहता है; जहाँ संभव हो, ऐप या पासकी अपनाएं।`,
    followUpsEn: ["How do I back up 2FA recovery codes safely?", "What does NIST SP 800-63B recommend?"],
    followUpsHi: ["2FA रिकवरी कोड सुरक्षित कैसे रखें?", "पासवर्ड के लिए NIST नियम क्या कहते हैं?"],
  },
  {
    keywords: ["password", "entropy", "passphrase", "length", "nist", "manager", "पासवर्ड", "एंट्रॉपी"],
    tags: ["Password Intelligence", "Entropy"],
    en: `**Modern Password Best Practices (NIST SP 800-63B & OWASP):**
- **Length beats complexity tricks:** A 16-character random password or 5-word diceware passphrase provides far stronger entropy than an 8-character password with \`@\` and \`!\`.
- **Avoid predictable substitutions:** Rules like \`P@ssw0rd2026!\` are cracked rapidly using rule-based dictionary attacks.
- **Uniqueness is mandatory:** Every account needs its own distinct password so one third-party breach never cascades.
- **Use a trusted Password Manager** to store high-entropy passwords securely so you only memorize one strong master passphrase.`,
    hi: `**आधुनिक पासवर्ड सुरक्षा सिद्धांत (NIST SP 800-63B):**
- **जटिलता से अधिक लंबाई मायने रखती है:** 16+ अक्षरों का यादृच्छिक पासवर्ड या 5 शब्दों का पासफ़्रेज़, 8 अक्षरों के कठिन पासवर्ड से कहीं अधिक सुरक्षित होता है।
- **आम बदलावों से बचें:** \`P@ssw0rd2026!\` जैसे पैटर्न क्रैकिंग टूल्स द्वारा बहुत तेजी से तोड़ दिए जाते हैं।
- **हर खाते के लिए अलग पासवर्ड रखें:** ताकि एक वेबसाइट के डेटा ब्रीच का असर आपके अन्य खातों पर न पड़े।
- **पासवर्ड मैनेजर का उपयोग करें:** आपको केवल एक मजबूत मास्टर पासफ़्रेज़ याद रखने की आवश्यकता होती है।`,
    followUpsEn: ["How is password entropy calculated?", "Should I rotate strong passwords every 90 days?"],
    followUpsHi: ["पासवर्ड एंट्रॉपी कैसे मापी जाती है?", "क्या हर 90 दिन में पासवर्ड बदलना जरूरी है?"],
  },
  {
    keywords: ["90 day", "rotate", "expire", "expiration", "बदलना"],
    tags: ["Policy", "NIST Guidelines"],
    en: `**Should You Rotate Passwords Every 90 Days?**
No — modern NIST SP 800-63B and NCSC guidance explicitly **discourage arbitrary periodic expiration**. Forced 90-day rotation leads people to make tiny predictable increments (\`Winter2025!\` -> \`Spring2026!\`).
**When you SHOULD change a password:**
- Immediately if there is evidence of a breach or compromise.
- If the password was shared, reused, or fails entropy checks.`,
    hi: `**क्या हर 90 दिन में पासवर्ड बदलना चाहिए?**
नहीं — आधुनिक NIST SP 800-63B दिशानिर्देश **बिना कारण बार-बार पासवर्ड बदलने की सलाह नहीं देते**। इससे लोग केवल छोटे बदलाव (\`Winter2025!\` -> \`Spring2026!\`) करने लगते हैं।
**पासवर्ड कब बदलना चाहिए:**
- जब किसी डेटा ब्रीच या संदिग्ध लॉगिन का संकेत मिले।
- जब पासवर्ड किसी अन्य सेवा के साथ साझा या दोबारा उपयोग किया गया हो।`,
    followUpsEn: ["Give me a breach containment checklist", "Compare Passkeys vs TOTP"],
    followUpsHi: ["ब्रीच होने पर क्या कदम उठाएं?", "पासकी और ऑथेंटिकेटर ऐप की तुलना करें"],
  },
];

/**
 * Local deterministic Cybersecurity Advisor Engine.
 * Clearly operates offline without fabricating external LLM API calls.
 */
export function generateLocalSecurityReply(
  query: string,
  lang: Language
): AssistantReply {
  const normalized = query.toLowerCase().trim();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return {
        answer: lang === "hi" ? rule.hi : rule.en,
        tags: rule.tags,
        suggestedFollowUps: lang === "hi" ? rule.followUpsHi : rule.followUpsEn,
      };
    }
  }

  return {
    answer:
      lang === "hi"
        ? `मैं **SecureCheck स्थानीय सुरक्षा सलाहकार** हूँ (बिना किसी बाहरी क्लाउड AI के आपके ब्राउज़र में चलने वाला नियम-आधारित मार्गदर्शक)।\n\nआप मुझसे इन विषयों पर पूछ सकते हैं:\n- **पासवर्ड एंट्रॉपी और NIST दिशानिर्देश**\n- **डेटा ब्रीच होने पर तुरंत सुरक्षा कदम**\n- **फ़िशिंग लिंक और संदेश की पहचान**\n- **MFA, पासकी और ऑथेंटिकेटर ऐप की सुरक्षा**\n- **90-दिन पासवर्ड रोटेशन नीति**`
        : `I am the **SecureCheck Local Security Advisor** — a deterministic, privacy-preserving cybersecurity knowledge engine running entirely in your browser (no external LLM API is connected).\n\nTry asking me about:\n- **Password entropy & NIST SP 800-63B rules**\n- **Immediate breach containment steps**\n- **How to spot phishing links, OTP scams & typosquatting**\n- **MFA hierarchy (Passkeys vs TOTP vs SMS)**\n- **Whether 90-day password expiration is still recommended**`,
    tags: ["Local Knowledge Mode", "Cyber Hygiene"],
    suggestedFollowUps:
      lang === "hi"
        ? [
            "डेटा ब्रीच होने पर क्या करना चाहिए?",
            "फ़िशिंग लिंक की पहचान कैसे करें?",
            "पासवर्ड के लिए NIST नियम क्या हैं?",
          ]
        : [
            "What should I do after a password breach?",
            "How do I verify a suspicious phishing link?",
            "Compare Passkeys vs TOTP vs SMS MFA",
          ],
  };
}
