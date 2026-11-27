import type { QuizQuestion } from "@/types/security";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-pw-1",
    category: "passwords",
    difficulty: "beginner",
    questionEn: "Which password is significantly more resistant to modern offline GPU cracking?",
    questionHi: "आधुनिक ऑफ़लाइन GPU क्रैकिंग के खिलाफ कौन-सा पासवर्ड अधिक सुरक्षित है?",
    optionsEn: [
      "P@ssw0rd!26",
      "timber-lantern-quartz-cobalt-beacon",
      "Admin@1234",
      "Qwerty!99",
    ],
    optionsHi: [
      "P@ssw0rd!26",
      "timber-lantern-quartz-cobalt-beacon",
      "Admin@1234",
      "Qwerty!99",
    ],
    correctIndex: 1,
    explanationEn:
      "A 5-word random passphrase has vastly higher entropy and length than short passwords using predictable leet-speak substitutions.",
    explanationHi:
      "5 यादृच्छिक शब्दों वाले पासफ़्रेज़ की लंबाई और एंट्रॉपी छोटे लीट-स्पीक पासवर्ड से कहीं अधिक होती है।",
    xp: 50,
  },
  {
    id: "q-pw-2",
    category: "passwords",
    difficulty: "intermediate",
    questionEn: "What does NIST SP 800-63B recommend regarding periodic 90-day password expiration?",
    questionHi: "हर 90 दिन में पासवर्ड बदलने के बारे में NIST SP 800-63B की क्या सलाह है?",
    optionsEn: [
      "Force users to change passwords every 30 days",
      "Avoid arbitrary periodic expiration unless compromise is suspected",
      "Require only 6-character numeric PINs",
      "Allow reusing the same password across departments",
    ],
    optionsHi: [
      "हर 30 दिन में पासवर्ड बदलना अनिवार्य करें",
      "बिना ब्रीच के संकेत के बार-बार पासवर्ड बदलने की बाध्यता न रखें",
      "केवल 6 अंकों का PIN अनिवार्य करें",
      "एक ही पासवर्ड कई सेवाओं में इस्तेमाल करने दें",
    ],
    correctIndex: 1,
    explanationEn:
      "Forced periodic rotation leads users to make predictable incremental tweaks. Rotate only when a compromise or reuse risk is detected.",
    explanationHi:
      "बार-बार बदलने की मजबूरी से लोग केवल छोटे अनुमान लगाने योग्य बदलाव करते हैं। केवल संदेह या ब्रीच पर ही पासवर्ड बदलें।",
    xp: 65,
  },
  {
    id: "q-pw-3",
    category: "passwords",
    difficulty: "advanced",
    questionEn: "How does k-Anonymity protect your password in Have I Been Pwned's Pwned Passwords check?",
    questionHi: "Have I Been Pwned जांच में k-Anonymity आपके पासवर्ड की सुरक्षा कैसे करता है?",
    optionsEn: [
      "It encrypts your plaintext password with AES and sends it to the server",
      "Only the first 5 characters of the SHA-1 hash are transmitted; matching happens locally",
      "It sends your email and password together over HTTP",
      "It checks only the last 4 characters of your password",
    ],
    optionsHi: [
      "यह पासवर्ड को AES से एन्क्रिप्ट करके सर्वर को भेजता है",
      "SHA-1 हैश के केवल पहले 5 अक्षर भेजे जाते हैं; मिलान आपके ब्राउज़र में होता है",
      "यह ईमेल और पासवर्ड दोनों HTTP से भेजता है",
      "यह केवल अंतिम 4 अक्षर जांचता है",
    ],
    correctIndex: 1,
    explanationEn:
      "By sending only a 5-hex-character SHA-1 prefix (~1M range), the server never learns which specific password hash you are checking.",
    explanationHi:
      "केवल 5-अक्षर का SHA-1 प्रीफ़िक्स भेजने से सर्वर को कभी पता नहीं चलता कि आप किस सटीक पासवर्ड की जांच कर रहे हैं।",
    xp: 80,
  },
  {
    id: "q-phish-1",
    category: "phishing",
    difficulty: "beginner",
    questionEn: "In the URL https://paypal.security-alert.example.xyz/login, what is the true root domain?",
    questionHi: "URL https://paypal.security-alert.example.xyz/login में असली रूट डोमेन कौन-सा है?",
    optionsEn: [
      "paypal.com",
      "security-alert.com",
      "example.xyz",
      "paypal.security-alert",
    ],
    optionsHi: [
      "paypal.com",
      "security-alert.com",
      "example.xyz",
      "paypal.security-alert",
    ],
    correctIndex: 2,
    explanationEn:
      "The true registered domain sits immediately before the first single '/'. 'paypal' and 'security-alert' are merely subdomains controlled by example.xyz.",
    explanationHi:
      "पहले '/' से ठीक पहले वाले दो भाग असली डोमेन होते हैं। यहाँ असली डोमेन example.xyz है, और paypal केवल एक सबडोमेन है।",
    xp: 50,
  },
  {
    id: "q-phish-2",
    category: "phishing",
    difficulty: "intermediate",
    questionEn: "Why do phishing emails often include phrases like 'Account will be suspended in 2 hours'?",
    questionHi: "फ़िशिंग ईमेल में अक्सर '2 घंटे में खाता बंद हो जाएगा' जैसी भाषा क्यों होती है?",
    optionsEn: [
      "Legal compliance rules require urgent tone",
      "Artificial urgency triggers panic so victims skip verifying the sender and domain",
      "Email servers prioritize urgent subjects",
      "Banks always suspend accounts within 2 hours of inactivity",
    ],
    optionsHi: [
      "कानूनी नियमों के कारण",
      "नकली जल्दबाजी और डर पैदा करके उपयोगकर्ता को बिना जांचे क्लिक करने के लिए उकसाना",
      "ईमेल सर्वर ऐसे संदेश तेज़ी से भेजते हैं",
      "बैंक हमेशा 2 घंटे में खाता बंद कर देते हैं",
    ],
    correctIndex: 1,
    explanationEn:
      "Urgency and fear are core social engineering levers designed to override critical thinking.",
    explanationHi:
      "डर और जल्दबाजी सोशल इंजीनियरिंग की मुख्य तकनीक है ताकि व्यक्ति बिना सोचे लिंक पर क्लिक कर दे।",
    xp: 60,
  },
  {
    id: "q-mfa-1",
    category: "mfa",
    difficulty: "intermediate",
    questionEn: "Which MFA method is inherently resistant to Adversary-in-the-Middle (AitM) phishing pages?",
    questionHi: "कौन-सा MFA तरीका नकली फ़िशिंग लॉगिन पेजों (AitM) के खिलाफ सबसे सुरक्षित है?",
    optionsEn: [
      "SMS 6-digit OTP",
      "Email verification code",
      "FIDO2 / WebAuthn Passkeys",
      "Security questions (Mother's maiden name)",
    ],
    optionsHi: [
      "SMS 6-अंकीय OTP",
      "ईमेल सत्यापन कोड",
      "FIDO2 / WebAuthn पासकी",
      "सुरक्षा प्रश्न (Security Questions)",
    ],
    correctIndex: 2,
    explanationEn:
      "FIDO2/Passkeys cryptographically verify the browser origin, refusing to sign authentication challenges for lookalike domains.",
    explanationHi:
      "FIDO2/पासकी ब्राउज़र के असली डोमेन की क्रिप्टोग्राफिक पुष्टि करती है और नकली डोमेन पर काम नहीं करती।",
    xp: 75,
  },
  {
    id: "q-mfa-2",
    category: "mfa",
    difficulty: "beginner",
    questionEn: "You receive an unexpected MFA push prompt while you are NOT trying to log in. What should you do?",
    questionHi: "जब आप लॉगिन नहीं कर रहे हों और अचानक MFA पुश नोटिफिकेशन आए, तो क्या करें?",
    optionsEn: [
      "Approve it once to stop the notifications",
      "Deny the prompt and immediately change that account's password",
      "Ignore it permanently without changing anything",
      "Share the code with IT support on WhatsApp",
    ],
    optionsHi: [
      "नोटिफिकेशन बंद करने के लिए स्वीकार कर लें",
      "अस्वीकार (Deny) करें और तुरंत उस खाते का पासवर्ड बदलें",
      "बिना कुछ किए अनदेखा कर दें",
      "कोड किसी को भेज दें",
    ],
    correctIndex: 1,
    explanationEn:
      "An unexpected MFA prompt means someone already has your password (MFA fatigue attack). Deny it and rotate your password immediately.",
    explanationHi:
      "अनचाहा MFA अनुरोध बताता है कि हमलावर के पास आपका पासवर्ड है। इसे तुरंत अस्वीकार करें और पासवर्ड बदलें।",
    xp: 55,
  },
  {
    id: "q-net-1",
    category: "network",
    difficulty: "intermediate",
    questionEn: "What does an 'xn--' prefix inside a domain name indicate?",
    questionHi: "डोमेन नाम में 'xn--' प्रीफ़िक्स क्या दर्शाता है?",
    optionsEn: [
      "Extra-secure military encryption",
      "Punycode encoding for Internationalized Domain Names (potential homograph risk)",
      "Verified government portal",
      "Temporary CDN cache",
    ],
    optionsHi: [
      "अतिरिक्त सैन्य एन्क्रिप्शन",
      "अंतरराष्ट्रीय डोमेन नामों के लिए प्यूनीकोड (होमोग्राफ़ नकल का संभावित जोखिम)",
      "सत्यापित सरकारी पोर्टल",
      "अस्थायी CDN कैश",
    ],
    correctIndex: 1,
    explanationEn:
      "Attackers sometimes register internationalized domains with visually identical characters (homographs) that resolve to 'xn--' Punycode.",
    explanationHi:
      "हमलावर असली दिखने वाले विदेशी अक्षरों के डोमेन रजिस्टर कर सकते हैं, जो 'xn--' प्यूनीकोड के रूप में दिखते हैं।",
    xp: 70,
  },
];
