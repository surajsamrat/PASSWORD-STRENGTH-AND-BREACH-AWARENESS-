export type KbCategory =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I";

export interface KnowledgeBaseEntry {
  id: string;
  number: number;
  category: KbCategory;
  questionEn: string;
  questionHi: string;
  /** Exact/normalized phrases & weighted keyword groups for natural-language matching */
  matchPhrases: string[];
  /** Word sets where ALL words in at least one set must appear in the query */
  keywordSets: string[][];
  tags: string[];
  answerEn: string;
  answerHi: string;
  answerHinglish: string;
  followUpsEn: string[];
  followUpsHi: string[];
}

export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  // =========================================================================
  // CATEGORY A: CHECKING & PRIVACY (1 - 5)
  // =========================================================================
  {
    id: "kb-1",
    number: 1,
    category: "A",
    questionEn: "Is it safe to type my password here?",
    questionHi: "क्या यहाँ अपना पासवर्ड टाइप करना सुरक्षित है?",
    matchPhrases: [
      "is it safe to type my password here",
      "is my password safe here",
      "safe to enter my password",
      "safe to check my password here",
      "kya password check karna safe hai",
      "kya yahan password dalna surakshit hai",
    ],
    keywordSets: [
      ["safe", "password", "here"],
      ["safe", "type", "password"],
      ["safe", "enter", "password"],
      ["surakshit", "password"],
    ],
    tags: ["Privacy", "Browser-Only"],
    answerEn: `### Yes — Password Analysis Runs 100% Locally
- **In-browser only:** Strength, entropy, and crack-time checks run locally inside your browser using JavaScript — nothing is sent to our servers.
- **Zero storage:** Your typed password is held only in temporary memory and cleared when you leave the page.
- **Breach checks:** Only the first **5 characters** of a SHA-1 hash are sent to Have I Been Pwned (k-Anonymity), never your password.

> **Important:** Never paste real passwords into any AI chat box — use the **Password Analyzer** instead.`,
    answerHi: `### हाँ — पासवर्ड जांच 100% आपके ब्राउज़र में होती है
- **केवल स्थानीय विश्लेषण:** पासवर्ड की मजबूती, एंट्रॉपी और क्रैक-समय की गणना सीधे आपके ब्राउज़र में होती है; पासवर्ड हमारे सर्वर पर नहीं भेजा जाता।
- **कोई स्टोरेज नहीं:** टाइप किया गया पासवर्ड केवल अस्थायी मेमोरी में रहता है और पेज छोड़ने पर साफ़ हो जाता है।
- **ब्रीच जांच:** Have I Been Pwned को पूरा पासवर्ड नहीं, बल्कि SHA-1 हैश के केवल पहले **5 अक्षर** भेजे जाते हैं।

> **सावधानी:** अपना वास्तविक पासवर्ड कभी भी चैट बॉक्स में न लिखें।`,
    answerHinglish: `### Haan — Password Analysis 100% aapke browser mein chalta hai
- **Local processing:** Password strength, entropy aur crack-time calculation sirf aapke device/browser mein hoti hai, server par nahi bheji jaati.
- **Zero storage:** Password save nahi hota aur page chhodte hi memory se clear ho jaata hai.
- **Breach check privacy:** Sirf SHA-1 hash ke pehle **5 characters** HIBP ko jaate hain, aapka actual password kabhi nahi.

> **Warning:** Apna real password kabhi chat box mein type na karein.`,
    followUpsEn: [
      "Does this website store or save the passwords I test?",
      "Is my password sent to a server?",
      "How does the breach checker protect my privacy?",
    ],
    followUpsHi: [
      "क्या यह वेबसाइट मेरे जांचे गए पासवर्ड को सेव करती है?",
      "क्या मेरा पासवर्ड सर्वर पर भेजा जाता है?",
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
    ],
  },
  {
    id: "kb-2",
    number: 2,
    category: "A",
    questionEn: "Why is my password score not 100%?",
    questionHi: "मेरे पासवर्ड का स्कोर 100% क्यों नहीं है?",
    matchPhrases: [
      "why is my password score not 100",
      "why is my score not 100",
      "why is my password score low",
      "why did i get a low score",
      "score 100 kyu nahi hai",
      "password score kam kyu hai",
    ],
    keywordSets: [
      ["score", "100"],
      ["score", "low"],
      ["why", "low", "score"],
      ["score", "kam"],
    ],
    tags: ["Password Score", "Diagnostics"],
    answerEn: `### Why Scores Fall Below 100%
SecureCheck checks both mathematical entropy and real-world attacker patterns (via \`zxcvbn\`):
- **Too short:** Under 12–16 characters limits total combinations.
- **Predictable patterns:** Common words, names, years (\`2024\`), keyboard walks (\`qwerty\`), or repeats (\`aaa\`).
- **Simple substitutions:** Swapping \`a -> @\` or \`o -> 0\` is easily guessed by cracking rules.
- **Low diversity:** Using only letters or only numbers lowers the character pool.

> **Tip:** Aim for **16+ random characters** or a **4–5 random word passphrase** rather than forcing tricky symbols.`,
    answerHi: `### पासवर्ड स्कोर 100% से कम रहने के मुख्य कारण
SecureCheck गणितीय एंट्रॉपी के साथ वास्तविक क्रैकिंग पैटर्न (\`zxcvbn\`) भी जांचता है:
- **कम लंबाई:** 12–16 अक्षरों से कम पासवर्ड में संभावनाएं सीमित रहती हैं।
- **अनुमानित पैटर्न:** आम शब्द, नाम, वर्ष (\`2024\`), कीबोर्ड क्रम (\`qwerty\`) या दोहराए गए अक्षर (\`aaa\`)।
- **आसान बदलाव:** \`a\` को \`@\` या \`o\` को \`0\` लिखने से क्रैकिंग टूल्स चकमा नहीं खाते।
- **कम विविधता:** केवल अक्षर या केवल अंक उपयोग करने से स्कोर घटता है।`,
    answerHinglish: `### Score 100% se kam kyu aata hai?
SecureCheck entropy ke saath real-world attack patterns (\`zxcvbn\`) bhi check karta hai:
- **Kam length:** 12–16 characters se chhota password jaldi guess ho sakta hai.
- **Common patterns:** Dictionary words, naam, year (\`2025\`), \`qwerty\`, ya repeated chars (\`aaa\`).
- **Predictable symbols:** \`P@ssw0rd\` jaise simple swaps cracking rules aasani se tod lete hain.

> **Tip:** **16+ random characters** ya **4–5 unrelated words** ka passphrase try karein.`,
    followUpsEn: [
      "How can I improve my password score?",
      "Why is my password weak even with symbols and special characters?",
      "Is a longer password always better?",
    ],
    followUpsHi: [
      "मैं अपने पासवर्ड का स्कोर कैसे सुधार सकता हूँ?",
      "सिंबल और स्पेशल कैरेक्टर होने पर भी पासवर्ड कमज़ोर क्यों है?",
      "क्या लंबा पासवर्ड हमेशा बेहतर होता है?",
    ],
  },
  {
    id: "kb-3",
    number: 3,
    category: "A",
    questionEn: "Does this website store or save the passwords I test?",
    questionHi: "क्या यह वेबसाइट मेरे जांचे गए पासवर्ड को सेव या स्टोर करती है?",
    matchPhrases: [
      "does this website store or save the passwords i test",
      "do you save passwords",
      "store my password",
      "save the password",
      "password save hota hai kya",
    ],
    keywordSets: [
      ["store", "password"],
      ["save", "password", "test"],
      ["website", "save", "password"],
      ["website", "store"],
    ],
    tags: ["Zero Storage", "Privacy"],
    answerEn: `### No — Passwords Are Never Stored
- **Analyzer & Generator:** Passwords exist only in volatile browser RAM while the page is open and are wiped automatically when you navigate away.
- **LocalStorage policy:** SecureCheck only saves your theme, language, hygiene checklist, and anonymized counts (like *"3 passwords audited"*) — **never** password strings or full hashes.
- **Reports & AI Chat:** Only non-sensitive metadata (such as strength score or entropy bits) is ever referenced.`,
    answerHi: `### नहीं — आपके पासवर्ड कभी स्टोर या सेव नहीं होते
- **विश्लेषक और जनरेटर:** पासवर्ड केवल अस्थायी ब्राउज़र मेमोरी में रहते हैं और पेज से बाहर जाते ही हट जाते हैं।
- **ब्राउज़र स्टोरेज:** \`localStorage\` में केवल थीम, भाषा और गैर-संवेदनशील संख्याएं (जैसे कुल ऑडिट) सहेजी जाती हैं — **पासवर्ड या पूरा हैश कभी नहीं**।`,
    answerHinglish: `### Nahi — Aapka password kabhi save ya store nahi hota
- **Memory only:** Tested ya generated password sirf temporary browser RAM mein rehta hai aur page leave karne par clear ho jaata hai.
- **No database logging:** \`localStorage\` mein sirf theme, language aur aggregate counts save hote hain — koi password text ya hash nahi.`,
    followUpsEn: [
      "Can anyone see the password I enter?",
      "Is it safe to type my password here?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "क्या कोई मेरे द्वारा डाला गया पासवर्ड देख सकता है?",
      "क्या यहाँ अपना पासवर्ड टाइप करना सुरक्षित है?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-4",
    number: 4,
    category: "A",
    questionEn: "Can anyone see the password I enter?",
    questionHi: "क्या कोई मेरे द्वारा डाला गया पासवर्ड देख सकता है?",
    matchPhrases: [
      "can anyone see the password i enter",
      "can anyone see my password",
      "can developers see my password",
      "koi mera password dekh sakta hai kya",
    ],
    keywordSets: [
      ["anyone", "see", "password"],
      ["see", "password", "enter"],
      ["koi", "dekh", "password"],
    ],
    tags: ["Privacy", "Confidentiality"],
    answerEn: `### No One on Our End Can See Your Password
- **No server transmission:** Password strength calculation happens completely client-side, so neither site owners nor backend servers ever receive your input.
- **Masked input:** Inputs are hidden (\`••••\`) by default until you toggle the eye icon.
- **Breach check anonymity:** Even during breach checks, only a 5-character SHA-1 prefix leaves your browser.

> **Physical safety reminder:** Make sure no one is shoulder-surfing your screen or recording your display if you click **Show Password**.`,
    answerHi: `### कोई भी आपका पासवर्ड नहीं देख सकता
- **कोई सर्वर ट्रांसमिशन नहीं:** पासवर्ड विश्लेषण पूरी तरह आपके ब्राउज़र में होता है, इसलिए न सर्वर और न ही डेवलपर आपका पासवर्ड देख सकते हैं।
- **मास्क्ड इनपुट:** डिफ़ॉल्ट रूप से पासवर्ड छिपा (\`••••\`) रहता है।

> **ध्यान रखें:** **Show Password** दबाते समय सुनिश्चित करें कि कोई आपकी स्क्रीन न देख रहा हो।`,
    answerHinglish: `### Koi bhi aapka password nahi dekh sakta
- **Client-side execution:** Analysis aapke apne browser mein hota hai, isliye server ya admin ke paas password kabhi pahunchta hi nahi.
- **Shoulder-surfing warning:** Agar aap "Show Password" toggle karein toh aas-paas koi screen na dekh raha ho iska dhyan rakhein.`,
    followUpsEn: [
      "Is my password sent to a server?",
      "How does the breach checker protect my privacy?",
    ],
    followUpsHi: [
      "क्या मेरा पासवर्ड सर्वर पर भेजा जाता है?",
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
    ],
  },
  {
    id: "kb-5",
    number: 5,
    category: "A",
    questionEn: "Is my password sent to a server?",
    questionHi: "क्या मेरा पासवर्ड किसी सर्वर पर भेजा जाता है?",
    matchPhrases: [
      "is my password sent to a server",
      "password sent to server",
      "send password to backend",
      "kya password server par jaata hai",
    ],
    keywordSets: [
      ["password", "sent", "server"],
      ["password", "send", "server"],
      ["password", "backend"],
      ["server", "jaata", "password"],
    ],
    tags: ["Zero-Knowledge", "Architecture"],
    answerEn: `### Never — Neither Analyzer, Generator, Nor AI Receives Passwords
- **Password Analyzer & Generator:** 100% offline-capable in your browser — **zero network calls**.
- **Breach Checker (HIBP):** Uses **k-Anonymity**. Your browser computes the SHA-1 hash locally and sends **only the first 5 hex characters** to \`api.pwnedpasswords.com\`. Your plaintext password and remaining 35 hash characters stay strictly on your device.
- **AI Assistant:** Blocked from accepting plaintext passwords or full 40-char hashes; only non-sensitive metadata (like \`score\` or \`entropyBits\`) may be shared.`,
    answerHi: `### कभी नहीं — आपका पासवर्ड सर्वर पर नहीं भेजा जाता
- **विश्लेषक और जनरेटर:** पूरी तरह ब्राउज़र में चलते हैं — **कोई नेटवर्क कॉल नहीं**।
- **ब्रीच चेकर:** k-Anonymity का उपयोग करके केवल 5-अक्षर का SHA-1 प्रीफ़िक्स भेजता है, पूरा पासवर्ड या हैश नहीं।
- **AI सहायक:** वास्तविक पासवर्ड या पूरा हैश स्वीकार नहीं करता; केवल गैर-संवेदनशील आंकड़े (जैसे स्कोर) उपयोग होते हैं।`,
    answerHinglish: `### Kabhi nahi — Actual password server par nahi jaata
- **Analyzer & Generator:** 100% browser ke andar run hote hain (zero server upload).
- **Breach Checker:** Sirf SHA-1 hash ke first **5 hex chars** API ko bheje jaate hain; remaining 35 chars aur password aapke device par rehte hain.`,
    followUpsEn: [
      "How does the breach checker protect my privacy?",
      "What is Have I Been Pwned?",
    ],
    followUpsHi: [
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
      "Have I Been Pwned क्या है?",
    ],
  },

  // =========================================================================
  // CATEGORY B: PASSWORD STRENGTH (6 - 12)
  // =========================================================================
  {
    id: "kb-6",
    number: 6,
    category: "B",
    questionEn: "Why is my password weak even with symbols and special characters?",
    questionHi: "सिंबल और स्पेशल कैरेक्टर होने पर भी मेरा पासवर्ड कमज़ोर क्यों है?",
    matchPhrases: [
      "why is my password weak even with symbols and special characters",
      "weak even with symbols",
      "special characters still weak",
      "symbol dalne par bhi weak kyu",
    ],
    keywordSets: [
      ["weak", "symbols"],
      ["weak", "special", "characters"],
      ["symbols", "still", "weak"],
    ],
    tags: ["Password Strength", "Pattern Attacks"],
    answerEn: `### Symbols Alone Don't Defeat Modern Cracking Tools
Attackers expect common character tricks, so special characters aren't enough when:
- **Length is short:** An 8-character password with symbols still has a much smaller search space than a 16-character passphrase.
- **Predictable substitutions ("l33tspeak"):** \`P@ssw0rd!\` or \`S3cur!ty1\` are tested in seconds by rule-based dictionary attacks.
- **Symbols sit at the end:** Putting \`!\` or \`123\` at the end of a real word is one of the first rules cracking software tries.

> **Fix:** Increase **length to 14–16+ chars** and place random characters or words unpredictably.`,
    answerHi: `### केवल सिंबल जोड़ने से कमज़ोर पैटर्न सुरक्षित नहीं बनते
आधुनिक क्रैकिंग टूल्स आम ट्रिक्स को पहले से जानते हैं:
- **छोटी लंबाई:** सिंबल के साथ 8 अक्षरों का पासवर्ड, 16 अक्षरों के पासफ़्रेज़ की तुलना में बहुत कम सुरक्षित होता है।
- **अनुमानित बदलाव:** \`P@ssw0rd!\` जैसे बदलाव डिक्शनरी नियमों से सेकंडों में टूट जाते हैं।
- **अंत में \`!\` या \`123\`:** शब्द के अंत में सिंबल लगाना सबसे आम पैटर्न है।`,
    answerHinglish: `### Sirf symbols lagane se password strong nahi banta
- **Short length:** 8 chars + symbols se zyada strong 16 chars ka length hota hai.
- **Common tricks:** \`@\` for \`a\` ya last mein \`!\` lagana cracking tools seconds mein guess kar lete hain.
- **Fix:** Length **14–16+ characters** rakhein aur dictionary words ya predictable patterns avoid karein.`,
    followUpsEn: [
      "What makes a password strong?",
      "Is a longer password always better?",
    ],
    followUpsHi: [
      "पासवर्ड को मजबूत क्या बनाता है?",
      "क्या लंबा पासवर्ड हमेशा बेहतर होता है?",
    ],
  },
  {
    id: "kb-7",
    number: 7,
    category: "B",
    questionEn: "What makes a password strong?",
    questionHi: "पासवर्ड को मजबूत क्या बनाता है?",
    matchPhrases: [
      "what makes a password strong",
      "strong password criteria",
      "characteristics of a strong password",
      "strong password kaise banta hai",
    ],
    keywordSets: [
      ["what", "makes", "password", "strong"],
      ["makes", "strong", "password"],
      ["strong", "password", "criteria"],
    ],
    tags: ["Password Strength", "NIST Guidelines"],
    answerEn: `### The 4 Pillars of a Strong Password
1. **Generous Length:** At least **14–16+ characters** (or 4–5 random words).
2. **True Unpredictability:** Generated randomly without names, birthdates, brands, or keyboard patterns.
3. **Uniqueness:** Never reused on any other website or app.
4. **Breach-Free:** Not found in previously leaked credential databases.

> **Note:** Mixing uppercase, lowercase, numbers, and symbols helps *only* when combined with good length and true randomness.`,
    answerHi: `### मजबूत पासवर्ड के 4 मुख्य आधार
1. **पर्याप्त लंबाई:** कम से कम **14–16+ अक्षर** (या 4–5 अनियमित शब्द)।
2. **वास्तविक यादृच्छिकता:** नाम, जन्मतिथि, या कीबोर्ड पैटर्न से मुक्त।
3. **अद्वितीयता (Unique):** हर खाते के लिए बिल्कुल अलग पासवर्ड।
4. **ब्रीच-मुक्त:** पहले से किसी डेटा लीक में शामिल न हो।`,
    answerHinglish: `### Strong password ke 4 main pillars:
1. **Length:** Kam se kam **14–16+ characters** (ya 4–5 random words).
2. **Unpredictability:** Koi naam, birthdate, common word ya keyboard pattern na ho.
3. **Uniqueness:** Har account ke liye alag password.
4. **Not leaked:** Kisi purane data breach mein na aaya ho.`,
    followUpsEn: [
      "Should I use random characters or a passphrase?",
      "How can I improve my password score?",
    ],
    followUpsHi: [
      "रैंडम अक्षर उपयोग करें या पासफ़्रेज़?",
      "मैं अपने पासवर्ड का स्कोर कैसे सुधार सकता हूँ?",
    ],
  },
  {
    id: "kb-8",
    number: 8,
    category: "B",
    questionEn: "How can I improve my password score?",
    questionHi: "मैं अपने पासवर्ड का स्कोर कैसे सुधार सकता हूँ?",
    matchPhrases: [
      "how can i improve my password score",
      "how to improve password strength",
      "make my password stronger",
      "how can i create a stronger password",
      "password score kaise badhaye",
    ],
    keywordSets: [
      ["improve", "password", "score"],
      ["improve", "password", "strength"],
      ["create", "stronger", "password"],
      ["make", "password", "stronger"],
    ],
    tags: ["Improvement", "Actionable Tips"],
    answerEn: `### Quick Ways to Boost Your Password Score
1. **Add length first:** Push from 8–10 chars to **16+ chars** — length gives the biggest security jump.
2. **Drop predictable parts:** Remove names, years (\`1998\`, \`2026\`), repeated letters (\`aaa\`), and \`1234\` / \`qwerty\`.
3. **Switch to a passphrase:** Combine **4–5 unrelated random words** (e.g., \`velvet-canyon-orbit-tulip\`).
4. **Use SecureCheck's Generator:** Generate a cryptographically random password and store it in a password manager.`,
    answerHi: `### पासवर्ड स्कोर बढ़ाने के आसान तरीके
1. **लंबाई बढ़ाएं:** 8–10 के बजाय **16+ अक्षर** रखें — यह सबसे बड़ा सुधार देता है।
2. **अनुमानित हिस्से हटाएं:** नाम, साल, \`1234\`, \`qwerty\` और दोहराए अक्षर निकालें।
3. **पासफ़्रेज़ अपनाएं:** 4–5 अलग और अनियमित शब्दों को जोड़ें।
4. **SecureCheck जनरेटर का उपयोग करें** और पासवर्ड मैनेजर में सहेजें।`,
    answerHinglish: `### Password score improve karne ke best steps:
1. **Length badhayein:** 16+ characters ya 4–5 unrelated words use karein.
2. **Patterns hatayein:** Names, birth years, \`1234\`, \`qwerty\`, aur repeated letters remove karein.
3. **Generator use karein:** SecureCheck Password Generator se CSPRNG password banakar password manager mein save karein.`,
    followUpsEn: [
      "How do I use the password generator?",
      "Should I use random characters or a passphrase?",
    ],
    followUpsHi: [
      "पासवर्ड जनरेटर का उपयोग कैसे करें?",
      "रैंडम अक्षर उपयोग करें या पासफ़्रेज़?",
    ],
  },
  {
    id: "kb-9",
    number: 9,
    category: "B",
    questionEn: "Is a longer password always better?",
    questionHi: "क्या लंबा पासवर्ड हमेशा बेहतर होता है?",
    matchPhrases: [
      "is a longer password always better",
      "does length matter more",
      "length vs complexity",
      "lamba password behtar hota hai kya",
    ],
    keywordSets: [
      ["longer", "password", "better"],
      ["length", "better", "password"],
      ["length", "matter"],
    ],
    tags: ["Length", "Entropy"],
    answerEn: `### Almost Always Yes — As Long As It's Unpredictable
Every extra random character multiplies the guesses an attacker needs exponentially.
- **Why length wins:** A 16-character lowercase/word passphrase is much stronger than an 8-character password full of symbols.
- **The catch:** A long *predictable* string like \`passwordpassword123\` or repeating one word still scores poorly because attackers guess whole words and repetitions quickly.`,
    answerHi: `### लगभग हमेशा हाँ — बशर्ते वह अनुमानित न हो
हर अतिरिक्त अक्षर संभावित संयोजनों को कई गुना बढ़ा देता है।
- **लंबाई की ताकत:** 16 अक्षरों का साधारण पासफ़्रेज़, 8 अक्षरों के जटिल पासवर्ड से कहीं अधिक सुरक्षित है।
- **अवाद:** \`passwordpassword123\` जैसा लंबा लेकिन अनुमानित पासवर्ड फिर भी कमजोर माना जाता है।`,
    answerHinglish: `### Mostly Haan — Jab tak wo predictable na ho
Har extra random character cracking combinations ko exponentially badhata hai. Lekin \`aaaaaaaaaaaaaaaa\` ya \`passwordpassword\` jaise long *repetitive* strings phir bhi weak rehte hain.`,
    followUpsEn: [
      "Why can two passwords with similar lengths have different strength scores?",
      "What is password entropy?",
    ],
    followUpsHi: [
      "समान लंबाई के दो पासवर्ड के अलग स्कोर क्यों हो सकते हैं?",
      "पासवर्ड एंट्रॉपी क्या है?",
    ],
  },
  {
    id: "kb-10",
    number: 10,
    category: "B",
    questionEn: "Are common words and names unsafe in passwords?",
    questionHi: "क्या पासवर्ड में आम शब्द और नाम असुरक्षित होते हैं?",
    matchPhrases: [
      "are common words and names unsafe in passwords",
      "common words unsafe",
      "names in password",
      "dictionary words unsafe",
    ],
    keywordSets: [
      ["common", "words", "unsafe"],
      ["names", "unsafe", "passwords"],
      ["dictionary", "words", "password"],
    ],
    tags: ["Dictionary Attacks", "Weaknesses"],
    answerEn: `### Yes — Single Dictionary Words & Personal Names Are High Risk
- **Dictionary attacks:** Cracking tools test millions of dictionary words, brand names, slang, and common names in milliseconds.
- **Personal context attacks:** Attackers check your name, username, birthday, city, or pet names from social media first.
- **Exception:** **4–5 truly random, unrelated words** combined together (like a diceware passphrase) *are* strong because guessing 5 random words in order is astronomically hard.`,
    answerHi: `### हाँ — अकेले आम शब्द और व्यक्तिगत नाम बेहद जोखिम भरे हैं
- **डिक्शनरी हमला:** क्रैकिंग सॉफ्टवेयर लाखों आम शब्द और नाम मिलीसेकंड में आज़मा लेते हैं।
- **व्यक्तिगत जानकारी:** आपका नाम, जन्मतिथि या यूज़रनेम हमलावरों के सबसे पहले निशाने पर होता है।
- **अपवाद:** **4–5 अलग और अनियमित शब्दों** का पासफ़्रेज़ सुरक्षित होता है।`,
    answerHinglish: `### Haan — Single dictionary words aur personal names unsafe hain
Cracking tools millions of dictionary words aur aapke social media details (naam, birthday, city) milliseconds mein try kar lete hain. Haan, **4–5 unrelated random words** ka passphrase strong hota hai.`,
    followUpsEn: [
      "Should I use random characters or a passphrase?",
      "What is the difference between brute-force and dictionary attacks?",
    ],
    followUpsHi: [
      "रैंडम अक्षर उपयोग करें या पासफ़्रेज़?",
      "ब्रूट-फ़ोर्स और डिक्शनरी हमले में क्या अंतर है?",
    ],
  },
  {
    id: "kb-11",
    number: 11,
    category: "B",
    questionEn: "Why are repeated characters risky?",
    questionHi: "दोहराए गए अक्षर जोखिम भरे क्यों होते हैं?",
    matchPhrases: [
      "why are repeated characters risky",
      "repeated characters",
      "repeating characters",
      "same letter repeated",
    ],
    keywordSets: [
      ["repeated", "characters"],
      ["repeating", "characters"],
      ["repeat", "characters", "risky"],
    ],
    tags: ["Weaknesses", "Patterns"],
    answerEn: `### Repetitions Shrink Your Real Randomness
Strings like \`aaaa\`, \`1111\`, or \`abcabc\` look long on paper, but carry very little real entropy:
- **Zero new uncertainty:** Repeating \`a\` 6 times doesn't add true combinations — cracking algorithms specifically detect repetitions early.
- **Pattern dictionaries:** Repeated digits/symbols (\`!!!\`, \`000\`, \`777\`) are among the very first patterns tested.`,
    answerHi: `### दोहराए गए अक्षर वास्तविक सुरक्षा घटा देते हैं
\`aaaa\`, \`1111\`, या \`abcabc\` दिखने में लंबे लगते हैं, लेकिन उनमें विविधता नहीं होती:
- क्रैकिंग टूल्स दोहराव को तुरंत पहचान लेते हैं, जिससे अनुमानित लंबाई का लाभ खत्म हो जाता है।`,
    answerHinglish: `### Repeated characters real security kam kar dete hain
\`aaaa\`, \`1111\`, ya \`abcabc\` dekhne mein long lagte hain, par cracking software repetition patterns sabse pehle detect karke guess kar leta hai.`,
    followUpsEn: [
      "Why can two passwords with similar lengths have different strength scores?",
      "Why is my password score not 100%?",
    ],
    followUpsHi: [
      "समान लंबाई के दो पासवर्ड के अलग स्कोर क्यों हो सकते हैं?",
      "मेरे पासवर्ड का स्कोर 100% क्यों नहीं है?",
    ],
  },
  {
    id: "kb-12",
    number: 12,
    category: "B",
    questionEn: "Should I use random characters or a passphrase?",
    questionHi: "मुझे रैंडम अक्षर उपयोग करने चाहिए या पासफ़्रेज़?",
    matchPhrases: [
      "should i use random characters or a passphrase",
      "random characters vs passphrase",
      "passphrase vs random password",
    ],
    keywordSets: [
      ["random", "characters", "passphrase"],
      ["use", "passphrase"],
    ],
    tags: ["Passphrase", "Best Practices"],
    answerEn: `### Both Are Excellent — Choose Based on Where You Use It
- **Random 16+ char passwords (e.g., \`k9$Vm2!qPx7#Lz4R\`):** Best for everyday websites stored inside a **password manager** where you never type them manually.
- **Random 4–6 word passphrases (e.g., \`copper-velvet-orbit-mango-74\`):** Best when you *must* memorize and type it often (device unlock, laptop login, or master vault password).

> **Rule:** Never build a passphrase from song lyrics or famous quotes — always pick **unrelated random words**.`,
    answerHi: `### दोनों सुरक्षित हैं — जरूरत के अनुसार चुनें
- **16+ रैंडम अक्षर:** रोज़मर्रा की वेबसाइटों के लिए सर्वश्रेष्ठ जिन्हें आप **पासवर्ड मैनेजर** में सेव करते हैं।
- **4–6 अनियमित शब्दों का पासफ़्रेज़:** तब सबसे अच्छा जब आपको पासवर्ड **याद रखकर टाइप** करना हो (जैसे लैपटॉप या मास्टर वॉल्ट)।`,
    answerHinglish: `### Dono strong hain — use-case ke hisaab se chunein
- **Random 16+ chars:** Websites ke liye best jab aap **password manager** use karte hain.
- **4–6 random words passphrase:** Jab aapko khud yaad rakhna aur type karna ho (master password ya laptop login).`,
    followUpsEn: [
      "What is a password manager?",
      "How does the password generator work?",
    ],
    followUpsHi: [
      "पासवर्ड मैनेजर क्या है?",
      "पासवर्ड जनरेटर कैसे काम करता है?",
    ],
  },

  // =========================================================================
  // CATEGORY C: PASSWORD SAFETY (13 - 18)
  // =========================================================================
  {
    id: "kb-13",
    number: 13,
    category: "C",
    questionEn: "How often should I change my password?",
    questionHi: "मुझे अपना पासवर्ड कितनी बार बदलना चाहिए?",
    matchPhrases: [
      "how often should i change my password",
      "when should i change my password",
      "rotate password 90 days",
      "password kitne din mein badalna chahiye",
    ],
    keywordSets: [
      ["how", "often", "change", "password"],
      ["when", "change", "password"],
      ["rotate", "password"],
    ],
    tags: ["NIST Guidelines", "Hygiene"],
    answerEn: `### Don't Rotate Strong Unique Passwords on a Timer
Modern **NIST SP 800-63B** guidelines advise *against* forced 30/90-day rotation because it causes people to pick predictable patterns (\`Summer2026!\` → \`Autumn2026!\`).
**Change a password IMMEDIATELY if:**
- It appears in a data breach.
- You reused it on another site.
- You suspect phishing, malware, or unauthorized login activity.`,
    answerHi: `### मजबूत और अद्वितीय पासवर्ड बार-बार बदलने की जरूरत नहीं
आधुनिक **NIST दिशानिर्देशों** के अनुसार हर 90 दिन में पासवर्ड बदलना आवश्यक नहीं है।
**पासवर्ड तुरंत बदलें यदि:**
- वह किसी डेटा ब्रीच में पाया गया हो।
- आपने उसे किसी अन्य वेबसाइट पर भी इस्तेमाल किया हो।
- संदिग्ध लॉगिन या फ़िशिंग का संदेह हो।`,
    answerHinglish: `### Strong unique password ko har 90 din mein badalne ki zaroorat nahi
Modern NIST guidelines kehti hain ki timer par change karne se log predictable updates karte hain. **Turant badlein** agar breach hua ho, password reused ho, ya suspicious login dikhe.`,
    followUpsEn: [
      "What should I do if my password is leaked?",
      "Should I use the same password on multiple websites?",
    ],
    followUpsHi: [
      "अगर मेरा पासवर्ड लीक हो जाए तो क्या करूँ?",
      "क्या मुझे एक ही पासवर्ड कई वेबसाइटों पर इस्तेमाल करना चाहिए?",
    ],
  },
  {
    id: "kb-14",
    number: 14,
    category: "C",
    questionEn: "Should I use the same password on multiple websites?",
    questionHi: "क्या मुझे एक ही पासवर्ड कई वेबसाइटों पर इस्तेमाल करना चाहिए?",
    matchPhrases: [
      "should i use the same password on multiple websites",
      "reuse password",
      "same password everywhere",
      "ek hi password har jagah",
    ],
    keywordSets: [
      ["same", "password", "multiple"],
      ["same", "password", "websites"],
      ["reuse", "password"],
    ],
    tags: ["Credential Stuffing", "Safety"],
    answerEn: `### Never — Password Reuse Is One of the Biggest Security Risks
- **Credential stuffing:** When *one* small website gets breached, attackers automatically test your leaked email + password on your banking, email, and shopping accounts.
- **Domino effect:** Even a 25-character strong password becomes useless everywhere if leaked once from one site.
- **Solution:** Give every account its own unique password generated and stored by a password manager.`,
    answerHi: `### कभी नहीं — एक ही पासवर्ड दोहराना सबसे बड़ा खतरा है
- यदि एक छोटी वेबसाइट हैक हो जाती है, तो हमलावर उसी ईमेल और पासवर्ड से आपके ईमेल, बैंक और सोशल मीडिया खातों में लॉगिन करने की कोशिश (**Credential Stuffing**) करते हैं।
- हर खाते के लिए अलग पासवर्ड बनाएं।`,
    answerHinglish: `### Kabhi nahi — Same password reuse sabse bada risk hai
Agar ek chhoti site breach hui toh attackers wahi email+password automatically aapke bank aur Gmail par try karte hain (**Credential Stuffing**). Har site ke liye unique password rakhein.`,
    followUpsEn: [
      "How do I create a unique password for every account?",
      "What is a password manager?",
    ],
    followUpsHi: [
      "हर खाते के लिए अलग पासवर्ड कैसे बनाऊँ?",
      "पासवर्ड मैनेजर क्या है?",
    ],
  },
  {
    id: "kb-15",
    number: 15,
    category: "C",
    questionEn: "What is Two-Factor Authentication (2FA)?",
    questionHi: "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
    matchPhrases: [
      "what is two-factor authentication",
      "what is 2fa",
      "what is mfa",
      "2fa kya hota hai",
    ],
    keywordSets: [
      ["two-factor", "authentication"],
      ["two", "factor"],
      ["2fa"],
      ["mfa"],
    ],
    tags: ["2FA / MFA", "Account Defense"],
    answerEn: `### Two-Factor Authentication (2FA): A Second Lock Beyond Your Password
Even if an attacker steals your password, 2FA blocks them without your second verification step:
1. **Passkeys / Hardware Security Keys (Best):** Cryptographically linked to the real website, stopping phishing automatically.
2. **Authenticator Apps (Strong):** Apps generate 6-digit offline TOTP codes every 30 seconds.
3. **SMS OTP (Basic):** Better than nothing, though vulnerable to SIM-swapping — prefer Authenticator apps or Passkeys wherever possible.`,
    answerHi: `### टू-फैक्टर ऑथेंटिकेशन (2FA): पासवर्ड के अलावा दूसरी सुरक्षा परत
अगर आपका पासवर्ड चोरी भी हो जाए, तब भी 2FA अनधिकृत लॉगिन को रोकता है:
1. **पासकी / हार्डवेयर कुंजी (सर्वश्रेष्ठ):** फ़िशिंग से पूरी तरह सुरक्षित।
2. **ऑथेंटिकेटर ऐप (मजबूत):** हर 30 सेकंड में ऑफ़लाइन कोड बनाता है।
3. **SMS OTP:** सिम-स्वैपिंग का जोखिम रहता है, इसलिए ऐप या पासकी बेहतर हैं।`,
    answerHinglish: `### 2FA: Password ke baad ek extra security lock
Agar kisi ne aapka password chura bhi liya toh 2FA unhe rokta hai:
- **Passkeys / Security Key:** Best aur phishing-proof.
- **Authenticator App:** SMS OTP se kaafi zyada secure.`,
    followUpsEn: [
      "What should I do if my password is leaked?",
      "What is a password manager?",
    ],
    followUpsHi: [
      "अगर मेरा पासवर्ड लीक हो जाए तो क्या करूँ?",
      "पासवर्ड मैनेजर क्या है?",
    ],
  },
  {
    id: "kb-16",
    number: 16,
    category: "C",
    questionEn: "What is a password manager?",
    questionHi: "पासवर्ड मैनेजर क्या है?",
    matchPhrases: [
      "what is a password manager",
      "password manager",
      "how do password managers work",
    ],
    keywordSets: [["password", "manager"]],
    tags: ["Password Manager", "Storage"],
    answerEn: `### Your Encrypted Digital Vault for Passwords
A **password manager** creates, encrypts, stores, and autofills a unique, complex password for every website you use:
- You only need to remember **one strong master passphrase**.
- It stops **phishing** too — it won't autofill your login on a fake lookalike domain.
- Trusted examples include **Bitwarden, 1Password, KeePassXC,** and built-in platform vaults with 2FA enabled.`,
    answerHi: `### पासवर्ड मैनेजर: आपके पासवर्ड के लिए एन्क्रिप्टेड तिजोरी
यह हर वेबसाइट के लिए अलग और मजबूत पासवर्ड बनाता, सुरक्षित रखता और अपने आप भरता है:
- आपको केवल **एक मजबूत मास्टर पासफ़्रेज़** याद रखना पड़ता है।
- यह नकली (फ़िशिंग) वेबसाइट पर पासवर्ड ऑटो-फ़िल नहीं करता, जिससे अतिरिक्त सुरक्षा मिलती है।`,
    answerHinglish: `### Password Manager: Aapka encrypted password vault
Yeh har site ke liye unique strong password banakar encrypted store karta hai. Aapko sirf **ek strong master passphrase** yaad rakhna hota hai aur yeh fake phishing site par autofill bhi nahi karta.`,
    followUpsEn: [
      "How do I create a unique password for every account?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "हर खाते के लिए अलग पासवर्ड कैसे बनाऊँ?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-17",
    number: 17,
    category: "C",
    questionEn: "What should I do if my password is leaked?",
    questionHi: "अगर मेरा पासवर्ड लीक हो जाए तो मुझे क्या करना चाहिए?",
    matchPhrases: [
      "what should i do if my password is leaked",
      "password is leaked",
      "password was leaked",
      "if password leaked",
      "password leak ho jaye toh kya kare",
    ],
    keywordSets: [
      ["password", "leaked"],
      ["do", "if", "leaked"],
      ["leak", "kya", "kare"],
    ],
    tags: ["Incident Response", "Breach Recovery"],
    answerEn: `### Immediate 5-Step Leak Response
1. **Change the leaked password now** using a fresh **16+ character random password**.
2. **Update every other account** where you reused that same or similar password.
3. **Log out all active sessions** in account security settings and remove unfamiliar connected apps.
4. **Enable 2FA / Passkeys** (prioritize your primary email, banking, and cloud storage first).
5. **Stay alert for scam emails:** Attackers often use leaked details to send fake password-reset phishing links.`,
    answerHi: `### पासवर्ड लीक होने पर तुरंत करें ये 5 काम
1. **लीक हुआ पासवर्ड तुरंत बदलें** और 16+ अक्षरों का नया अनोखा पासवर्ड लगाएं।
2. **उन सभी अन्य खातों का पासवर्ड बदलें** जहाँ वही या मिलता-जुलता पासवर्ड था।
3. **सभी सक्रिय सत्र (Active Sessions) लॉगआउट** करें।
4. **2FA / पासकी चालू करें** (सबसे पहले मुख्य ईमेल और बैंक खातों पर)।
5. **संदिग्ध रीसेट ईमेल से सावधान रहें।**`,
    answerHinglish: `### Password leak hone par turant karein:
1. **Password change karein:** Naya 16+ char unique password set karein.
2. **Reused accounts update karein** jahan same password tha.
3. **All sessions sign out karein** aur **2FA / Passkey** on karein.
4. Fake "account recovery" phishing emails se alert rahein.`,
    followUpsEn: [
      "What does it mean if my password is found in a data breach?",
      "What is Two-Factor Authentication (2FA)?",
    ],
    followUpsHi: [
      "डेटा ब्रीच में पासवर्ड मिलने का क्या अर्थ है?",
      "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
    ],
  },
  {
    id: "kb-18",
    number: 18,
    category: "C",
    questionEn: "How do I create a unique password for every account?",
    questionHi: "मैं हर खाते के लिए एक अलग और अनोखा पासवर्ड कैसे बनाऊँ?",
    matchPhrases: [
      "how do i create a unique password for every account",
      "unique password for every account",
      "manage unique passwords",
    ],
    keywordSets: [
      ["unique", "password", "every", "account"],
      ["different", "password", "every"],
    ],
    tags: ["Workflow", "Password Manager"],
    answerEn: `### Simple Workflow for 100% Unique Passwords
1. Install a reputable **Password Manager** (e.g., Bitwarden, 1Password, or KeePassXC).
2. Protect that vault with one **strong, memorable 5-word passphrase + 2FA**.
3. Whenever you sign up or update an account, generate a fresh random password in **SecureCheck's Password Generator** (or your manager) and save it directly inside the vault.
4. Gradually replace reused passwords starting with Email, Banking, and Social accounts.`,
    answerHi: `### हर खाते के लिए अलग पासवर्ड रखने का सरल तरीका
1. एक भरोसेमंद **पासवर्ड मैनेजर** उपयोग करें।
2. उसके लिए एक मजबूत 5-शब्द का मास्टर पासफ़्रेज़ और 2FA सेट करें।
3. हर नई या पुरानी वेबसाइट के लिए **SecureCheck जनरेटर** से अलग 16+ अक्षरों का पासवर्ड बनाकर वॉल्ट में सेव करें।`,
    answerHinglish: `### Har account ke liye unique password rakhne ka easy tarika:
1. Ek trusted **Password Manager** install karein aur uspe strong master passphrase + 2FA lagayein.
2. Har site par SecureCheck Password Generator se alag 16+ char password banakar save karein — aapko sirf ek master passphrase yaad rakhna hoga.`,
    followUpsEn: [
      "What is a password manager?",
      "How do I use the password generator?",
    ],
    followUpsHi: [
      "पासवर्ड मैनेजर क्या है?",
      "पासवर्ड जनरेटर का उपयोग कैसे करें?",
    ],
  },

  // =========================================================================
  // CATEGORY D: CRACK TIME EXPLAINER (19 - 25)
  // =========================================================================
  {
    id: "kb-19",
    number: 19,
    category: "D",
    questionEn: "What does crack time actually mean?",
    questionHi: "क्रैक टाइम (Crack Time) का वास्तव में क्या अर्थ है?",
    matchPhrases: [
      "what does crack time actually mean",
      "what does crack time mean",
      "meaning of crack time",
      "crack time kya hota hai",
    ],
    keywordSets: [
      ["what", "crack", "time", "mean"],
      ["crack", "time", "meaning"],
      ["crack", "time", "kya"],
    ],
    tags: ["Crack Time", "Concepts"],
    answerEn: `### What "Estimated Crack Time" Tells You
**Crack time** is a mathematical estimate of how long it would take an attacker to guess a password of that complexity at a specific guessing speed (guesses per second).
- It measures **resistance under idealized assumptions**, not a countdown clock.
- It helps you compare weak passwords (*cracked in milliseconds*) against strong ones (*centuries against brute-force*).

> **Important:** Crack time is an **estimate, not a guarantee** — leaked passwords or targeted dictionary attacks bypass brute-force math completely.`,
    answerHi: `### "अनुमानित क्रैक टाइम" का सही अर्थ
**क्रैक टाइम** यह बताता है कि किसी विशेष गति (प्रति सेकंड अनुमान) से हमलावर को गणितीय रूप से उस पासवर्ड का अनुमान लगाने में लगभग कितना समय लग सकता है।
- यह केवल एक **तुलनात्मक अनुमान** है, सटीक गारंटी नहीं।
- यदि पासवर्ड पहले से लीक है या आम शब्दों से बना है, तो हमलावर को सदियों इंतजार नहीं करना पड़ता।`,
    answerHinglish: `### Crack time ka matlab kya hai?
Crack time ek **mathematical estimate** hai ki ek attacker ko specific speed par woh password guess karne mein approx kitna time lag sakta hai. Yeh strength compare karne ke liye hai, **exact guarantee nahi**.`,
    followUpsEn: [
      "Why does crack time change between attack scenarios?",
      "Is the displayed crack time guaranteed?",
      "What is the difference between password strength and crack time?",
    ],
    followUpsHi: [
      "अलग-अलग हमला परिदृश्यों में क्रैक समय क्यों बदलता है?",
      "क्या दिखाया गया क्रैक समय गारंटीड होता है?",
      "पासवर्ड क्षमता और क्रैक समय में क्या अंतर है?",
    ],
  },
  {
    id: "kb-20",
    number: 20,
    category: "D",
    questionEn: "Can a password really take centuries to crack?",
    questionHi: "क्या किसी पासवर्ड को क्रैक करने में सचमुच सदियाँ लग सकती हैं?",
    matchPhrases: [
      "can a password really take centuries to crack",
      "really take centuries",
      "take years to crack",
      "centuries to crack",
    ],
    keywordSets: [
      ["password", "centuries", "crack"],
      ["really", "take", "centuries"],
    ],
    tags: ["Crack Time", "Brute-Force Math"],
    answerEn: `### Mathematically Yes — If It Is Truly Random and Never Leaked
Because every random character multiplies the search space exponentially, a truly random 16+ character password has trillions of trillions of combinations — far beyond even massive GPU clusters testing billions of guesses per second.
**However:**
- That assumes the attacker must **guess blindly** without leaks, phishing, malware, or keyloggers.
- If you reuse that same password on a breached site, an attacker gets it instantly without cracking it at all.`,
    answerHi: `### गणितीय रूप से हाँ — यदि वह सचमुच यादृच्छिक हो और लीक न हुआ हो
16+ अक्षरों के वास्तव में रैंडम पासवर्ड में अनगिनत संयोजन होते हैं, जिन्हें तेज़ GPU क्लस्टर से भी क्रैक करने में सदियाँ लग सकती हैं।
- **लेकिन:** यदि वही पासवर्ड किसी डेटा ब्रीच, फ़िशिंग या मैलवेयर से चोरी हो जाए, तो क्रैक करने की जरूरत ही नहीं पड़ती।`,
    answerHinglish: `### Mathematically haan — agar woh truly random aur unique ho
16+ random chars ke combinations itne zyada hote hain ki pure brute-force mein centuries lag sakti hain. Lekin agar phishing ya breach mein leak ho jaye toh attacker ko crack karne ki zaroorat hi nahi padti.`,
    followUpsEn: [
      "Is the displayed crack time guaranteed?",
      "What is an offline brute-force attack?",
    ],
    followUpsHi: [
      "क्या दिखाया गया क्रैक समय गारंटीड होता है?",
      "ऑफ़लाइन ब्रूट-फ़ोर्स हमला क्या होता है?",
    ],
  },
  {
    id: "kb-21",
    number: 21,
    category: "D",
    questionEn: "Why does crack time change between attack scenarios?",
    questionHi: "अलग-अलग हमला परिदृश्यों के बीच क्रैक टाइम क्यों बदलता है?",
    matchPhrases: [
      "why does crack time change between attack scenarios",
      "crack time scenarios",
      "different crack times",
      "online vs offline crack time",
    ],
    keywordSets: [
      ["crack", "time", "scenarios"],
      ["why", "crack", "time", "change"],
    ],
    tags: ["Attack Scenarios", "Hashing"],
    answerEn: `### Attack Speed Varies by Billions of Times Across Scenarios
SecureCheck shows multiple scenarios because defenders and attackers operate at vastly different speeds:
1. **Online Throttled (~100/hr):** Website login forms block or lock out repeated failed attempts.
2. **Online Unthrottled (~10/sec):** Unprotected login endpoints allow faster automated attempts.
3. **Offline Slow Hash (bcrypt/Argon2):** If a database leaks with strong hashing, GPUs only test ~10,000 guesses/sec.
4. **Offline Fast GPU Cluster (~10B+/sec):** Weak hashes (like MD5/SHA-1) in a leaked database let attackers run billions of guesses per second.`,
    answerHi: `### हर हमले की गति अरबों गुना अलग होती है
- **ऑनलाइन सीमित लॉगिन:** वेबसाइट कुछ गलत प्रयासों के बाद खाता अस्थायी रूप से रोक देती है।
- **ऑफ़लाइन धीमा हैश (bcrypt/Argon2):** मजबूत हैशिंग से GPU बहुत धीमे प्रयास कर पाता है।
- **ऑफ़लाइन तेज़ GPU क्लस्टर:** यदि लीक डेटाबेस कमजोर हैश (MD5/SHA-1) का उपयोग करता है, तो हमलावर प्रति सेकंड अरबों अनुमान लगा सकते हैं।`,
    answerHinglish: `### Har scenario mein attacker ki speed bilkul alag hoti hai
- **Online Throttled:** Website login limits ki wajah se bahut slow (~100/hour).
- **Offline Slow Hash (bcrypt/Argon2):** Database leak ke baad bhi strong hashing GPU ko slow rakhti hai.
- **Offline Fast GPU Cluster:** Weak hash leak hone par GPUs billions of guesses/second try karte hain.`,
    followUpsEn: [
      "What is an online brute-force attack?",
      "What is an offline brute-force attack?",
    ],
    followUpsHi: [
      "ऑनलाइन ब्रूट-फ़ोर्स हमला क्या होता है?",
      "ऑफ़लाइन ब्रूट-फ़ोर्स हमला क्या होता है?",
    ],
  },
  {
    id: "kb-22",
    number: 22,
    category: "D",
    questionEn: "What is an online brute-force attack?",
    questionHi: "ऑनलाइन ब्रूट-फ़ोर्स हमला (Online Brute-Force Attack) क्या है?",
    matchPhrases: [
      "what is an online brute-force attack",
      "online brute force",
      "online attack",
    ],
    keywordSets: [["online", "brute", "force"], ["online", "brute-force"]],
    tags: ["Online Attack", "Crack Time"],
    answerEn: `### Online Brute-Force: Guessing Directly Against a Live Website
An attacker sends automated login requests over the internet to a website's login form.
- **Much slower:** Network latency, CAPTCHAs, rate-limiting, and account lockouts severely restrict guess speed (often dozens to hundreds of attempts per hour).
- **Primary risk:** Simple PINs, top-1000 passwords, and **credential stuffing** using already-leaked passwords.`,
    answerHi: `### ऑनलाइन ब्रूट-फ़ोर्स: लाइव वेबसाइट पर सीधे लॉगिन प्रयास
हमलावर इंटरनेट के माध्यम से वेबसाइट के लॉगिन पेज पर बार-बार पासवर्ड आज़माता है।
- नेटवर्क देरी, रेट-लिमिटिंग और CAPTCHA के कारण इसकी गति बहुत धीमी रहती है।`,
    answerHinglish: `### Online Brute-Force: Live website login form par guessing
Attacker internet ke through live login page par passwords try karta hai. Rate limits, CAPTCHA aur lockouts ki wajah se yeh kaafi slow hota hai.`,
    followUpsEn: [
      "What is an offline brute-force attack?",
      "What is Two-Factor Authentication (2FA)?",
    ],
    followUpsHi: [
      "ऑफ़लाइन ब्रूट-फ़ोर्स हमला क्या होता है?",
      "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
    ],
  },
  {
    id: "kb-23",
    number: 23,
    category: "D",
    questionEn: "What is an offline brute-force attack?",
    questionHi: "ऑफ़लाइन ब्रूट-फ़ोर्स हमला (Offline Brute-Force Attack) क्या है?",
    matchPhrases: [
      "what is an offline brute-force attack",
      "offline brute force",
      "offline cracking",
    ],
    keywordSets: [
      ["offline", "brute", "force"],
      ["offline", "brute-force"],
      ["offline", "attack"],
    ],
    tags: ["Offline Attack", "GPU Cracking"],
    answerEn: `### Offline Brute-Force: Cracking Stolen Password Hashes Locally
If a service suffers a data breach and attackers steal its hashed password database, they take it onto their own high-speed GPU hardware:
- **Zero rate limits:** Websites cannot lock them out because the cracking happens completely offline.
- **Massive speed:** Against weak hashing algorithms, GPU rigs can test **billions of guesses per second**.
- **Your defense:** High-entropy passwords (**14–16+ random chars**) resist offline cracking even if a hash leaks.`,
    answerHi: `### ऑफ़लाइन ब्रूट-फ़ोर्स: चोरी हुए पासवर्ड हैश को अपने कंप्यूटर/GPU पर तोड़ना
जब कोई डेटाबेस लीक हो जाता है, तो हमलावर चोरी किए गए हैश पर बिना किसी लॉगिन सीमा के तेज़ GPU हार्डवेयर चलाते हैं।
- **आपकी सुरक्षा:** उच्च एंट्रॉपी वाले **14–16+ अक्षरों के पासवर्ड** ऑफ़लाइन हमलों से भी सुरक्षा देते हैं।`,
    answerHinglish: `### Offline Brute-Force: Stolen database hashes ko GPU par crack karna
Breach ke baad attackers password hashes apni GPU machines par le jaate hain jahan koi rate limit nahi hoti. Weak hashes par woh billions of guesses/sec run kar sakte hain — isliye high length + randomness zaroori hai.`,
    followUpsEn: [
      "Why does crack time change between attack scenarios?",
      "What is the difference between brute-force and dictionary attacks?",
    ],
    followUpsHi: [
      "अलग-अलग हमला परिदृश्यों में क्रैक समय क्यों बदलता है?",
      "ब्रूट-फ़ोर्स और डिक्शनरी हमले में क्या अंतर है?",
    ],
  },
  {
    id: "kb-24",
    number: 24,
    category: "D",
    questionEn: "What is the difference between brute-force and dictionary attacks?",
    questionHi: "ब्रूट-फ़ोर्स और डिक्शनरी हमलों में क्या अंतर है?",
    matchPhrases: [
      "what is the difference between brute-force and dictionary attacks",
      "brute-force vs dictionary",
      "brute force vs dictionary",
      "difference between brute force and dictionary",
    ],
    keywordSets: [
      ["brute", "dictionary"],
      ["brute-force", "dictionary"],
    ],
    tags: ["Attack Types", "Education"],
    answerEn: `### Brute-Force vs. Dictionary Attacks
- **Brute-Force Attack:** Systematically tries *every possible character combination* (\`aaaa\`, \`aaab\`, \`aaac\`...). Extremely slow against long random passwords.
- **Dictionary Attack:** Tests curated lists of *real words, names, phrases, and leaked passwords* plus common mutations (\`Summer2026!\`, \`P@ssw0rd\`). **Way faster** against human-chosen passwords.

> **Takeaway:** Always defend against **both** by using random generation or 4–5 unrelated words.`,
    answerHi: `### ब्रूट-फ़ोर्स बनाम डिक्शनरी हमला
- **ब्रूट-फ़ोर्स:** हर संभावित अक्षर संयोजन को क्रम से आज़माता है — लंबे रैंडम पासवर्ड के सामने बहुत धीमा पड़ता है।
- **डिक्शनरी हमला:** आम शब्दों, नामों, लीक पासवर्ड और \`@\`/\`123\` जैसे बदलावों की सूची आज़माता है — इंसानों द्वारा चुने गए पासवर्ड पर बेहद तेज़ होता है।`,
    answerHinglish: `### Brute-Force vs Dictionary Attack
- **Brute-Force:** Har possible combination try karta hai — long random password par bahut slow.
- **Dictionary Attack:** Common words, names, leaked passwords aur unke rules (\`@\`/\`123\`) try karta hai — human-made passwords ko seconds mein tod deta hai.`,
    followUpsEn: [
      "Are common words and names unsafe in passwords?",
      "Is the displayed crack time guaranteed?",
    ],
    followUpsHi: [
      "क्या पासवर्ड में आम शब्द और नाम असुरक्षित होते हैं?",
      "क्या दिखाया गया क्रैक समय गारंटीड होता है?",
    ],
  },
  {
    id: "kb-25",
    number: 25,
    category: "D",
    questionEn: "Is the displayed crack time guaranteed?",
    questionHi: "क्या दिखाया गया क्रैक समय गारंटीड होता है?",
    matchPhrases: [
      "is the displayed crack time guaranteed",
      "crack time accurate",
      "crack time guarantee",
      "crack time exact",
    ],
    keywordSets: [
      ["crack", "time", "guaranteed"],
      ["crack", "time", "guarantee"],
      ["crack", "time", "accurate"],
    ],
    tags: ["Limitations", "Estimates"],
    answerEn: `### No — Crack Time Is Strictly an Approximate Estimate
Displayed crack times cannot guarantee real-world survival because:
- Hardware speeds keep advancing (custom ASICs and cloud GPU clusters).
- Websites may use weak hashing or store plaintext in poorly secured systems.
-Targeted attacks using personal information (birthdays, names) bypass uniform math.
- Phishing, malware, or past data breaches expose passwords instantly regardless of length.

> **Important:** Treat crack time as a **relative safety benchmark**, and always pair strong unique passwords with **2FA**.`,
    answerHi: `### नहीं — दिखाया गया क्रैक समय केवल एक अनुमान है, गारंटी नहीं
वास्तविक समय इन कारणों से कम हो सकता है:
- नए और तेज़ GPU/हार्डवेयर का विकास।
- किसी वेबसाइट की कमजोर हैशिंग तकनीक।
- फ़िशिंग, मैलवेयर या डेटा ब्रीच से पासवर्ड का सीधे लीक हो जाना।`,
    answerHinglish: `### Nahi — Crack time sirf ek approximate estimate hai, guarantee nahi
Hardware upgrades, weak website hashing, targeted personal guesses, ya phishing/breach ki wajah se real exposure fast ho sakta hai. Hamesha unique password + **2FA** use karein.`,
    followUpsEn: [
      "What does crack time actually mean?",
      "What is Two-Factor Authentication (2FA)?",
    ],
    followUpsHi: [
      "क्रैक टाइम (Crack Time) का वास्तव में क्या अर्थ है?",
      "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
    ],
  },

  // =========================================================================
  // CATEGORY E: PASSWORD BREACH DETECTOR (26 - 30)
  // =========================================================================
  {
    id: "kb-26",
    number: 26,
    category: "E",
    questionEn: "What does it mean if my password is found in a data breach?",
    questionHi: "अगर मेरा पासवर्ड डेटा ब्रीच में पाया जाता है तो इसका क्या मतलब है?",
    matchPhrases: [
      "what does it mean if my password is found in a data breach",
      "password found in a data breach",
      "has my password been breached",
      "pwned password",
      "breach mein milne ka kya matlab hai",
    ],
    keywordSets: [
      ["found", "data", "breach"],
      ["password", "been", "breached"],
      ["password", "breach", "mean"],
    ],
    tags: ["Breach Exposure", "Warning"],
    answerEn: `### It Means Attackers Already Have That Password on Public Lists
If a password matches in Have I Been Pwned:
- **Compromised globally:** It appeared in real leaked credential dumps traded and tested by automated bots.
- **Even complex strings fail:** Even a 14-character password with symbols becomes unsafe once leaked.
- **Action needed:** Stop using it everywhere immediately and replace it with a newly generated unique password.`,
    answerHi: `### इसका अर्थ है कि यह पासवर्ड पहले से सार्वजनिक लीक सूचियों में मौजूद है
- हैकर्स के स्वचालित बॉट्स ऐसे लीक पासवर्ड्स का उपयोग करके खातों में घुसने की कोशिश करते हैं।
- **तुरंत कदम:** इस पासवर्ड का उपयोग हर जगह बंद करें और नया अनोखा पासवर्ड सेट करें।`,
    answerHinglish: `### Iska matlab yeh password public leaked lists mein aa chuka hai
Automated attacker bots is password ko lists se test karte hain. Chahe kitna bhi complex lage, ek baar leak hone par isse **har account se turant hata dein**.`,
    followUpsEn: [
      "What should I do if my password appears in a breach?",
      "How does the breach checker protect my privacy?",
    ],
    followUpsHi: [
      "अगर मेरा पासवर्ड ब्रीच में दिखे तो मुझे क्या करना चाहिए?",
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
    ],
  },
  {
    id: "kb-27",
    number: 27,
    category: "E",
    questionEn: "What is Have I Been Pwned?",
    questionHi: "Have I Been Pwned (HIBP) क्या है?",
    matchPhrases: [
      "what is have i been pwned",
      "what is hibp",
      "pwned passwords api",
    ],
    keywordSets: [
      ["have", "i", "been", "pwned"],
      ["hibp"],
    ],
    tags: ["HIBP", "Threat Intelligence"],
    answerEn: `### A Trusted Global Breach Intelligence Service
**Have I Been Pwned (HIBP)** is a widely respected cybersecurity service (created by security researcher Troy Hunt) that indexes billions of compromised credentials from real-world data breaches.
- Its **Pwned Passwords** range API lets tools like SecureCheck check whether a password hash has ever appeared in public leaks **without revealing the password itself**.`,
    answerHi: `### एक विश्वसनीय वैश्विक डेटा ब्रीच जांच सेवा
**Have I Been Pwned (HIBP)** एक प्रतिष्ठित साइबर सुरक्षा सेवा है जो वास्तविक डेटा ब्रीच से लीक हुए अरबों पासवर्ड का सुरक्षित हैश डेटाबेस रखती है।
- इसकी **k-Anonymity Range API** पासवर्ड को उजागर किए बिना लीक की जांच करने देती है।`,
    answerHinglish: `### Have I Been Pwned: Trusted global breach database
Troy Hunt dwara banayi gayi security service jo billions of real leaked password hashes index karti hai, taaki k-Anonymity se bina password bataye exposure check ho sake.`,
    followUpsEn: [
      "How does the breach checker protect my privacy?",
      "Is my password safe if no breach is found?",
    ],
    followUpsHi: [
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
      "अगर कोई ब्रीच नहीं मिला तो क्या मेरा पासवर्ड सुरक्षित है?",
    ],
  },
  {
    id: "kb-28",
    number: 28,
    category: "E",
    questionEn: "Is my password safe if no breach is found?",
    questionHi: "अगर कोई ब्रीच नहीं मिला तो क्या मेरा पासवर्ड सुरक्षित है?",
    matchPhrases: [
      "is my password safe if no breach is found",
      "no breach found safe",
      "clean in breach check safe",
    ],
    keywordSets: [
      ["safe", "no", "breach", "found"],
      ["not", "breached", "safe"],
    ],
    tags: ["Limitations", "Password Strength"],
    answerEn: `### No Breach Found Does NOT Automatically Mean Strong
"0 breaches found" only means that password hasn't shown up in known public dumps *yet*:
- Simple passwords like \`MyName123\` might miss a list, yet still get cracked in seconds by brute-force or dictionary tools.
- Unreported private leaks may not be indexed yet.

> **Best practice:** Use **both** the **Breach Checker** (for past leaks) AND the **Password Analyzer** (for length, entropy, and pattern resistance).`,
    answerHi: `### "कोई ब्रीच नहीं" का अर्थ यह नहीं कि पासवर्ड मजबूत है
- इसका मतलब केवल इतना है कि वह पासवर्ड अभी तक ज्ञात सार्वजनिक लीक में नहीं मिला है।
- कमज़ोर या छोटा पासवर्ड बिना लीक हुए भी आसानी से अनुमान लगाया जा सकता है।
- सुरक्षित रहने के लिए **ब्रीच चेकर** और **पासवर्ड विश्लेषक** दोनों का उपयोग करें।`,
    answerHinglish: `### Zero breach ka matlab yeh nahi ki password strong hai
Sirf itna matlab hai ki woh abhi tak public leak lists mein nahi aaya. Weak ya chhota password bina leak ke bhi guess ho sakta hai — isliye **Analyzer + Breach Checker** dono use karein.`,
    followUpsEn: [
      "What makes a password strong?",
      "How do I use the password analyzer?",
    ],
    followUpsHi: [
      "पासवर्ड को मजबूत क्या बनाता है?",
      "मैं पासवर्ड विश्लेषक का उपयोग कैसे करूँ?",
    ],
  },
  {
    id: "kb-29",
    number: 29,
    category: "E",
    questionEn: "How does the breach checker protect my privacy?",
    questionHi: "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
    matchPhrases: [
      "how does the breach checker protect my privacy",
      "k-anonymity",
      "how breach checker works safely",
    ],
    keywordSets: [
      ["breach", "checker", "privacy"],
      ["k-anonymity"],
      ["k", "anonymity"],
    ],
    tags: ["k-Anonymity", "Cryptography"],
    answerEn: `### Zero-Knowledge k-Anonymity Protocol
SecureCheck protects your privacy in 4 strict steps:
1. Your browser hashes your password locally with **SHA-1** using the Web Crypto API.
2. Only the **first 5 hex characters** (the prefix) are sent to \`api.pwnedpasswords.com/range/\`.
3. HIBP sends back *hundreds* of matching hash suffixes sharing that 5-character prefix.
4. Your browser checks the remaining 35 characters **locally in memory** — nobody outside your device can tell which password you checked.`,
    answerHi: `### k-Anonymity द्वारा पूर्ण गोपनीयता सुरक्षा
1. आपका ब्राउज़र स्थानीय रूप से **SHA-1 हैश** बनाता है।
2. सर्वर को हैश के केवल पहले **5 अक्षर** भेजे जाते हैं, पूरा पासवर्ड या पूरा हैश नहीं।
3. मिले हुए सैकड़ों सफ़िक्स की तुलना केवल आपके ब्राउज़र की मेमोरी में होती है।`,
    answerHinglish: `### k-Anonymity Privacy Protection:
1. Browser locally **SHA-1 hash** compute karta hai.
2. Sirf first **5 hex chars** HIBP ko jaate hain — actual password aur baaki 35 chars kabhi device se bahar nahi jaate.
3. Matching locally memory mein hoti hai.`,
    followUpsEn: [
      "Is my password sent to a server?",
      "What does the breach detector check?",
    ],
    followUpsHi: [
      "क्या मेरा पासवर्ड सर्वर पर भेजा जाता है?",
      "ब्रीच डिटेक्टर क्या जांचता है?",
    ],
  },
  {
    id: "kb-30",
    number: 30,
    category: "E",
    questionEn: "What should I do if my password appears in a breach?",
    questionHi: "अगर मेरा पासवर्ड किसी ब्रीच में दिखाई दे तो क्या करना चाहिए?",
    matchPhrases: [
      "what should i do if my password appears in a breach",
      "password appears in a breach",
      "found in breach what to do",
    ],
    keywordSets: [
      ["appears", "breach"],
      ["password", "breach", "do"],
    ],
    tags: ["Incident Response", "Breach Recovery"],
    answerEn: `### Rotate Immediately & Isolate Affected Accounts
1. **Replace it right away** on every account that uses it with a newly generated 16+ character unique password.
2. **Prioritize sensitive accounts:** Email (because attackers reset other logins via email), Banking, Cloud Storage, and Work logins.
3. **Turn on 2FA / Passkeys** and review recent login activity / unknown devices.`,
    answerHi: `### तुरंत पासवर्ड बदलें और खातों को सुरक्षित करें
1. जहाँ भी यह पासवर्ड उपयोग हो रहा हो, उसे तुरंत नए 16+ अक्षरों के अद्वितीय पासवर्ड से बदलें।
2. ईमेल, बैंकिंग और क्लाउड खातों को प्राथमिकता दें।
3. 2FA चालू करें और अनजान लॉगिन सत्र हटाएं।`,
    answerHinglish: `### Turant action lein:
1. Jis bhi account par woh password hai, wahan naya 16+ char unique password lagayein (Email & Banking sabse pehle).
2. **2FA / Passkeys** enable karein aur active sessions check karein.`,
    followUpsEn: [
      "What is Two-Factor Authentication (2FA)?",
      "How do I use the password generator?",
    ],
    followUpsHi: [
      "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
      "पासवर्ड जनरेटर का उपयोग कैसे करें?",
    ],
  },

  // =========================================================================
  // CATEGORY F: PASSWORD GENERATOR (31 - 35)
  // =========================================================================
  {
    id: "kb-31",
    number: 31,
    category: "F",
    questionEn: "How does the password generator work?",
    questionHi: "पासवर्ड जनरेटर कैसे काम करता है?",
    matchPhrases: [
      "how does the password generator work",
      "how generator works",
      "crypto getrandomvalues",
    ],
    keywordSets: [
      ["password", "generator", "work"],
      ["generator", "works"],
    ],
    tags: ["CSPRNG", "Password Generator"],
    answerEn: `### Cryptographically Secure Generation in Your Browser
SecureCheck's generator uses the browser's built-in **Web Crypto API** (\`crypto.getRandomValues()\`), *never* predictable \`Math.random()\`:
- **Rejection sampling:** Eliminates modulo bias so every character or word is picked fairly.
- **Zero persistence:** Generated passwords stay strictly in volatile memory and are never saved to any server or storage.`,
    answerHi: `### ब्राउज़र में सुरक्षित क्रिप्टोग्राफ़िक निर्माण
SecureCheck जनरेटर पूर्वानुमान योग्य \`Math.random()\` के बजाय **\`crypto.getRandomValues()\`** (CSPRNG) का उपयोग करता है।
- हर अक्षर या शब्द निष्पक्ष और यादृच्छिक रूप से चुना जाता है।
- बनाए गए पासवर्ड कहीं सेव नहीं होते।`,
    answerHinglish: `### Web Crypto CSPRNG (\`crypto.getRandomValues()\`)
SecureCheck \`Math.random()\` kabhi use nahi karta — yeh hardware-backed **CSPRNG** aur rejection sampling use karta hai taaki har character unpredictable ho, aur generated passwords save bhi nahi hote.`,
    followUpsEn: [
      "Are randomly generated passwords safer?",
      "How long should my generated password be?",
    ],
    followUpsHi: [
      "क्या रैंडम रूप से बनाए गए पासवर्ड अधिक सुरक्षित होते हैं?",
      "बनाए गए पासवर्ड की लंबाई कितनी होनी चाहिए?",
    ],
  },
  {
    id: "kb-32",
    number: 32,
    category: "F",
    questionEn: "Are randomly generated passwords safer?",
    questionHi: "क्या रैंडम रूप से बनाए गए पासवर्ड अधिक सुरक्षित होते हैं?",
    matchPhrases: [
      "are randomly generated passwords safer",
      "randomly generated passwords safer",
      "random vs human chosen",
    ],
    keywordSets: [
      ["randomly", "generated", "safer"],
      ["random", "passwords", "safer"],
    ],
    tags: ["Randomness", "Defense"],
    answerEn: `### Yes — Much Safer Than Human-Chosen Passwords
Humans unconsciously repeat habits (birthdays, names, keyboard paths, ending with \`1!\`), and cracking software exploits those exact patterns.
- A **CSPRNG random password** removes human bias completely, forcing attackers into slow mathematical brute-force instead of fast dictionary guesses.`,
    answerHi: `### हाँ — इंसान द्वारा सोचे गए पासवर्ड से कहीं अधिक सुरक्षित
इंसान अक्सर जाने-अनजाने पैटर्न (नाम, साल, \`123\`, \`!\`) चुनते हैं, जिनका हमलावर लाभ उठाते हैं। रैंडम पासवर्ड इन पैटर्न को पूरी तरह समाप्त कर देते हैं।`,
    answerHinglish: `### Haan — Human-made passwords se kahin zyada safe
Insaan subconsciously patterns banate hain jinhe dictionary rules fast crack kar leti hain. Truly random passwords mein koi human bias nahi hota.`,
    followUpsEn: [
      "How long should my generated password be?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "बनाए गए पासवर्ड की लंबाई कितनी होनी चाहिए?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-33",
    number: 33,
    category: "F",
    questionEn: "How long should my generated password be?",
    questionHi: "मेरे जनरेट किए गए पासवर्ड की लंबाई कितनी होनी चाहिए?",
    matchPhrases: [
      "how long should my generated password be",
      "recommended password length",
      "ideal password length",
    ],
    keywordSets: [
      ["how", "long", "generated", "password"],
      ["recommended", "password", "length"],
      ["ideal", "password", "length"],
    ],
    tags: ["Length", "Recommendations"],
    answerEn: `### Recommended Password Lengths
- **Minimum safe baseline:** **14–16 characters** for everyday websites.
- **High-value accounts (Email, Banking, Admin, Crypto):** **20–24+ characters** (or **5–6 words** in Passphrase mode).
- SecureCheck lets you customize from **8 to 64 characters** so you can match even strict website limits.`,
    answerHi: `### अनुशंसित पासवर्ड लंबाई
- **सामान्य खाते:** कम से कम **14–16 अक्षर**।
- **ईमेल, बैंकिंग और महत्वपूर्ण खाते:** **20–24+ अक्षर** (या पासफ़्रेज़ मोड में **5–6 शब्द**)।
- SecureCheck में आप 8 से 64 अक्षरों तक की लंबाई चुन सकते हैं।`,
    answerHinglish: `### Recommended Length:
- **Normal accounts:** **14–16+ characters**
- **Email / Banking / Important accounts:** **20–24+ characters** (ya **5–6 random words** passphrase).`,
    followUpsEn: [
      "Can I customize the generated password?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "क्या मैं बनाए गए पासवर्ड को कस्टमाइज़ कर सकता हूँ?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-34",
    number: 34,
    category: "F",
    questionEn: "Can I customize the generated password?",
    questionHi: "क्या मैं बनाए गए पासवर्ड को कस्टमाइज़ कर सकता हूँ?",
    matchPhrases: [
      "can i customize the generated password",
      "customize generated password",
      "generator options",
    ],
    keywordSets: [
      ["customize", "generated", "password"],
      ["customize", "password"],
    ],
    tags: ["Customization", "Generator"],
    answerEn: `### Full Customization Controls Available
In the **Password Generator**, you can configure:
- **Length:** Slider & presets from **8 to 64 characters**.
- **Character sets:** Toggle Uppercase, Lowercase, Numbers, and Symbols independently.
- **Exclude ambiguous characters:** Skip lookalikes like \`0/O\` and \`1/l/I\` for easy reading.
- **Passphrase Mode:** Choose **4–8 words**, separators (\`-\`, \`_\`, \`.\`, space), capitalization, and optional digits.
- **Batch Mode:** Generate multiple secrets at once with live strength metrics.`,
    answerHi: `### पूरा कस्टमाइज़ेशन उपलब्ध है
पासवर्ड जनरेटर में आप यह सेट कर सकते हैं:
- **लंबाई:** 8 से 64 अक्षरों तक।
- **अक्षर प्रकार:** बड़े/छोटे अक्षर, अंक और सिंबल के अलग टॉगल।
- **भ्रामक अक्षर हटाना:** \`0/O\` या \`1/l/I\` जैसे दिखने वाले अक्षर छोड़ें।
- **पासफ़्रेज़ मोड:** 4–8 शब्द और विभाजक चुनें।`,
    answerHinglish: `### Haan, poora control milta hai:
- **Length:** 8 se 64 chars
- **Toggles:** Uppercase, Lowercase, Numbers, Symbols aur **Exclude Ambiguous** (\`0/O\`, \`1/l/I\`)
- **Passphrase mode:** 4–8 random words, separator aur capitalization choose kar sakte hain.`,
    followUpsEn: [
      "How do I use the password generator?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "पासवर्ड जनरेटर का उपयोग कैसे करें?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-35",
    number: 35,
    category: "F",
    questionEn: "How should I securely save a generated password?",
    questionHi: "बनाए गए पासवर्ड को सुरक्षित रूप से कैसे सहेजना चाहिए?",
    matchPhrases: [
      "how should i securely save a generated password",
      "save generated password",
      "where to store password",
    ],
    keywordSets: [
      ["securely", "save", "generated", "password"],
      ["save", "generated", "password"],
      ["where", "save", "password"],
    ],
    tags: ["Password Storage", "Safety"],
    answerEn: `### Store It in an Encrypted Password Manager — Never Plain Text
- **Best option:** Save it inside a trusted encrypted **Password Manager** (protected by a strong master passphrase + 2FA).
- **Avoid:** Plain text files (\`.txt\`), unencrypted notes apps, WhatsApp/email self-messages, or sticky notes.
- **SecureCheck auto-clear:** Remember that copied secrets auto-clear from your clipboard based on your Settings timer for extra hygiene.`,
    answerHi: `### एन्क्रिप्टेड पासवर्ड मैनेजर में सेव करें — सादे टेक्स्ट में कभी नहीं
- भरोसेमंद **पासवर्ड मैनेजर** (जैसे Bitwarden, 1Password, KeePassXC) का उपयोग करें।
- नोटपैड, साधारण नोट्स ऐप, या खुद को ईमेल/मैसेज करके पासवर्ड कभी न रखें।`,
    answerHinglish: `### Encrypted Password Manager mein save karein
Notepad, plain \`.txt\` files, ya khud ko WhatsApp/Email par kabhi save na karein. Trusted Password Manager use karein aur vault par **2FA** zaroor lagayein.`,
    followUpsEn: [
      "What is a password manager?",
      "Does this website store or save the passwords I test?",
    ],
    followUpsHi: [
      "पासवर्ड मैनेजर क्या है?",
      "क्या यह वेबसाइट मेरे जांचे गए पासवर्ड को सेव करती है?",
    ],
  },

  // =========================================================================
  // CATEGORY G: PASSWORD ENTROPY (36 - 40)
  // =========================================================================
  {
    id: "kb-36",
    number: 36,
    category: "G",
    questionEn: "What is password entropy?",
    questionHi: "पासवर्ड एंट्रॉपी (Password Entropy) क्या है?",
    matchPhrases: [
      "what is password entropy",
      "explain password entropy",
      "entropy meaning",
      "entropy kya hota hai",
    ],
    keywordSets: [
      ["what", "password", "entropy"],
      ["explain", "entropy"],
      ["entropy", "meaning"],
      ["entropy", "kya"],
    ],
    tags: ["Entropy", "Math"],
    answerEn: `### Password Entropy: Measuring Unpredictability in Bits
**Entropy** measures how unpredictable a password is, expressed in **bits** using the character pool size ($N$) and length ($L$): \`L × log2(N)\`.
- Larger character variety + longer length = higher theoretical entropy.
- **Effective entropy:** SecureCheck also looks at patterns (via \`zxcvbn\` and Shannon diversity) because predictable words carry much less *real* randomness than pure random characters.`,
    answerHi: `### पासवर्ड एंट्रॉपी: अनिश्चितता को बिट्स में मापना
**एंट्रॉपी** बताती है कि किसी पासवर्ड का अनुमान लगाना गणितीय रूप से कितना कठिन है:
- अधिक अक्षर प्रकार और अधिक लंबाई होने से सैद्धांतिक एंट्रॉपी बढ़ती है।
- SecureCheck **प्रभावी एंट्रॉपी (Effective Entropy)** भी दिखाता है क्योंकि आम शब्दों या पैटर्न से वास्तविक अनिश्चितता घट जाती है।`,
    answerHinglish: `### Password Entropy: Randomness ka measurement (bits mein)
Entropy batati hai ki password kitna unpredictable hai. Zyada length + diverse character sets = higher theoretical bits. Lekin patterns hone par **effective entropy** kam ho jaati hai.`,
    followUpsEn: [
      "What do bits mean in password security?",
      "What is the difference between entropy and password strength?",
    ],
    followUpsHi: [
      "पासवर्ड सुरक्षा में बिट्स (Bits) का क्या अर्थ है?",
      "एंट्रॉपी और पासवर्ड मजबूती में क्या अंतर है?",
    ],
  },
  {
    id: "kb-37",
    number: 37,
    category: "G",
    questionEn: "What do bits mean in password security?",
    questionHi: "पासवर्ड सुरक्षा में बिट्स (Bits) का क्या अर्थ है?",
    matchPhrases: [
      "what do bits mean in password security",
      "what do bits mean",
      "entropy bits",
      "bits kya hote hain",
    ],
    keywordSets: [
      ["what", "bits", "mean"],
      ["bits", "password", "security"],
    ],
    tags: ["Entropy Bits", "Math"],
    answerEn: `### Every +1 Bit Doubles the Guessing Work
If a password has **$E$ bits** of true randomness, an attacker faces **$2^E$** possible combinations:
- **40 bits:** ~1 trillion guesses (weak against offline GPUs).
- **60 bits:** ~1 quintillion guesses (moderate/fair).
- **80+ bits:** Strong resistance against modern brute-force clusters.
- **100+ bits:** Very strong cryptographic-grade resistance.`,
    answerHi: `### हर +1 बिट सुरक्षा की संभावनाओं को दोगुना करता है
यदि वास्तविक एंट्रॉपी **$E$ बिट्स** है, तो कुल संयोजन **$2^E$** होते हैं:
- **< 40 बिट्स:** कमज़ोर (ऑफ़लाइन GPU से जल्दी क्रैक हो सकता है)।
- **60–79 बिट्स:** मध्यम से मजबूत।
- **80+ बिट्स:** आधुनिक ब्रूट-फ़ोर्स हमलों के प्रति अत्यंत मजबूत।`,
    answerHinglish: `### Har +1 bit possibilities ko double (2×) kar deta hai
- **40 bits:** Weak for offline cracking
- **60 bits:** Fair / moderate
- **80+ bits:** Strong brute-force resistance
- **100+ bits:** Very strong.`,
    followUpsEn: [
      "Is higher entropy always better?",
      "Why can two passwords with similar lengths have different strength scores?",
    ],
    followUpsHi: [
      "क्या अधिक एंट्रॉपी हमेशा बेहतर होती है?",
      "समान लंबाई के दो पासवर्ड के अलग स्कोर क्यों हो सकते हैं?",
    ],
  },
  {
    id: "kb-38",
    number: 38,
    category: "G",
    questionEn: "Is higher entropy always better?",
    questionHi: "क्या अधिक एंट्रॉपी हमेशा बेहतर होती है?",
    matchPhrases: [
      "is higher entropy always better",
      "higher entropy better",
    ],
    keywordSets: [["higher", "entropy", "better"]],
    tags: ["Entropy", "Nuance"],
    answerEn: `### Higher *Effective* Entropy Is Better — Raw Pool Math Can Mislead
- True higher entropy (from length + genuine randomness) directly makes guessing harder.
- **Important distinction:** A keyboard pattern like \`Q1w2E3r4T5y6!\` has high *pool* entropy on paper because it mixes 4 character sets, yet very low *effective* entropy because attackers spot keyboard patterns immediately.`,
    answerHi: `### उच्च *प्रभावी* एंट्रॉपी बेहतर होती है — केवल सूत्र काफी नहीं
सच्ची यादृच्छिकता के साथ उच्च एंट्रॉपी हमेशा बेहतर है। लेकिन \`Q1w2E3r4!\` जैसे पैटर्न में अक्षर विविधता दिखने के बावजूद वास्तविक अनिश्चितता कम होती है।`,
    answerHinglish: `### True (effective) high entropy hamesha better hoti hai
Lekin sirf character-pool formula misleading ho sakta hai — \`Q1w2E3r4!\` ka theoretical score high dikhta hai par attacker keyboard pattern jaldi guess kar leta hai.`,
    followUpsEn: [
      "What is the difference between entropy and password strength?",
      "Why can two passwords with similar lengths have different strength scores?",
    ],
    followUpsHi: [
      "एंट्रॉपी और पासवर्ड मजबूती में क्या अंतर है?",
      "समान लंबाई के दो पासवर्ड के अलग स्कोर क्यों हो सकते हैं?",
    ],
  },
  {
    id: "kb-39",
    number: 39,
    category: "G",
    questionEn: "What is the difference between entropy and password strength?",
    questionHi: "एंट्रॉपी और पासवर्ड मजबूती (Strength) में क्या अंतर है?",
    matchPhrases: [
      "what is the difference between entropy and password strength",
      "entropy vs strength",
      "difference between entropy and strength",
    ],
    keywordSets: [
      ["difference", "entropy", "strength"],
      ["entropy", "vs", "strength"],
    ],
    tags: ["Entropy", "Strength"],
    answerEn: `### Theoretical Pool Math vs. Real-World Attack Resistance
- **Raw Entropy (Bits):** A mathematical formula based purely on character variety and length. It assumes every character was chosen randomly.
- **Password Strength:** Evaluates *real-world* guessability too — penalizing dictionary words, names, dates, repeated letters, and keyboard walks via \`zxcvbn\` heuristics.`,
    answerHi: `### गणितीय सूत्र बनाम वास्तविक हमला प्रतिरोध
- **कच्ची एंट्रॉपी (Bits):** केवल लंबाई और अक्षर प्रकार का गणितीय मान बताती है।
- **पासवर्ड मजबूती:** वास्तविक हमलों (डिक्शनरी शब्द, नाम, वर्ष, दोहराव) को भी परखकर समग्र सुरक्षा स्तर बताती है।`,
    answerHinglish: `### Entropy vs Password Strength:
- **Entropy:** Length aur charset pool se nikala gaya mathematical randomness number (bits).
- **Strength:** Real-world guessability bhi check karti hai — dictionary words, dates, repeats aur keyboard walks ko penalize karke.`,
    followUpsEn: [
      "What is the difference between password strength and crack time?",
      "Why can two passwords with similar lengths have different strength scores?",
    ],
    followUpsHi: [
      "पासवर्ड क्षमता और क्रैक समय में क्या अंतर है?",
      "समान लंबाई के दो पासवर्ड के अलग स्कोर क्यों हो सकते हैं?",
    ],
  },
  {
    id: "kb-40",
    number: 40,
    category: "G",
    questionEn: "Why can two passwords with similar lengths have different strength scores?",
    questionHi: "समान लंबाई के दो पासवर्ड के अलग-अलग स्ट्रेंथ स्कोर क्यों हो सकते हैं?",
    matchPhrases: [
      "why can two passwords with similar lengths have different strength scores",
      "similar lengths different strength",
      "same length different score",
    ],
    keywordSets: [
      ["similar", "lengths", "different", "strength"],
      ["same", "length", "different", "score"],
    ],
    tags: ["Strength Analysis", "Patterns"],
    answerEn: `### Predictability & Variety Change Everything at the Same Length
Compare two 12-character passwords:
- \`Password123!\` → **Weak** (1 dictionary word + \`123\` + trailing \`!\` = cracked quickly by rule attacks).
- \`v9#K!m2qP8$z\` → **Strong** (all 4 character types picked unpredictably with no dictionary structure).
Length gives *potential* security; **unpredictability** turns that potential into real strength.`,
    answerHi: `### समान लंबाई पर भी पैटर्न और विविधता स्कोर बदल देते हैं
उदाहरण के लिए दोनों 12 अक्षर के हैं:
- \`Password123!\` → **कमज़ोर** (आम शब्द + \`123\` आसानी से टूट जाता है)।
- \`v9#K!m2qP8$z\` → **मजबूत** (कोई शब्द नहीं, पूर्ण यादृच्छिकता)।`,
    answerHinglish: `### Same length par bhi predictability aur randomness sab kuch badal dete hain
Jaise \`Password123!\` aur \`v9#K!m2qP8$z\` dono 12 chars ke hain — pehla common word + \`123\` hai (weak), doosra unpredictable random characters hai (strong).`,
    followUpsEn: [
      "What makes a password strong?",
      "Why are repeated characters risky?",
    ],
    followUpsHi: [
      "पासवर्ड को मजबूत क्या बनाता है?",
      "दोहराए गए अक्षर जोखिम भरे क्यों होते हैं?",
    ],
  },

  // =========================================================================
  // CATEGORY H: PHISHING DETECTOR (41 - 45)
  // =========================================================================
  {
    id: "kb-41",
    number: 41,
    category: "H",
    questionEn: "What is phishing?",
    questionHi: "फ़िशिंग (Phishing) क्या है?",
    matchPhrases: [
      "what is phishing",
      "explain phishing",
      "phishing kya hai",
    ],
    keywordSets: [
      ["what", "phishing"],
      ["explain", "phishing"],
      ["phishing", "kya"],
    ],
    tags: ["Phishing Awareness", "Social Engineering"],
    answerEn: `### Phishing: Digital Impersonation to Steal Your Logins or Money
**Phishing** is when scammers pretend to be a trusted bank, courier, government agency, or tech service via fake emails, SMS, or lookalike websites:
- Their goal is to trick you into typing your **password, OTP, PIN, or card details** on a fake page.
- They almost always rely on **urgency or fear** (*"Account blocked in 2 hours — verify now"*).`,
    answerHi: `### फ़िशिंग: नकली संदेशों या वेबसाइटों द्वारा जानकारी चुराने की ठगी
**फ़िशिंग** में ठग किसी बैंक, कूरियर या जानी-मानी कंपनी का रूप धारण करके नकली ईमेल, SMS या लिंक भेजते हैं ताकि आप अपना **पासवर्ड, OTP या कार्ड विवरण** दर्ज कर दें।
- इसमें अक्सर जल्दबाजी या डर (*"खाता बंद हो जाएगा"*) दिखाया जाता है।`,
    answerHinglish: `### Phishing: Fake impersonation se password ya OTP churana
Scammers bank, courier ya company banke fake email/SMS/link bhejte hain aur urgency (*"Account suspend ho jayega"*) dikhakar login ya OTP lete hain.`,
    followUpsEn: [
      "How can I recognize a suspicious website?",
      "How does the phishing URL detector work?",
    ],
    followUpsHi: [
      "संदिग्ध वेबसाइट की पहचान कैसे करें?",
      "फ़िशिंग URL डिटेक्टर कैसे काम करता है?",
    ],
  },
  {
    id: "kb-42",
    number: 42,
    category: "H",
    questionEn: "How does the phishing URL detector work?",
    questionHi: "फ़िशिंग URL डिटेक्टर कैसे काम करता है?",
    matchPhrases: [
      "how does the phishing url detector work",
      "how phishing detector works",
      "how does phishing detector work",
    ],
    keywordSets: [
      ["phishing", "url", "detector", "work"],
      ["phishing", "detector", "work"],
    ],
    tags: ["Phishing Detector", "Heuristics"],
    answerEn: `### Two-Layer Inspection (Without Ever Opening the Link)
1. **Local Heuristic Engine:** Validates URL syntax and inspects red flags locally — raw IP hosts, misleading brand subdomains (\`paypal.verify-login.example\`), URL shorteners, punycode lookalikes (\`xn--\`), non-HTTPS logins, and urgent scam keywords.
2. **Optional Threat Intelligence:** When configured on the server, queries Google Safe Browsing for known malicious URLs — **without ever visiting or fetching the webpage**.

> **Important:** Heuristics spot suspicious clues, whereas threat intelligence checks known threat feeds.`,
    answerHi: `### दो-स्तरीय जांच (बिना लिंक खोले)
1. **स्थानीय ह्यूरिस्टिक जांच:** आपके ब्राउज़र में ही IP एड्रेस होस्ट, भ्रामक सबडोमेन, URL शॉर्टनर, \`xn--\` लुकअलाइक डोमेन और धोखाधड़ी वाले शब्दों को जांचती है।
2. **थ्रेट इंटेलिजेंस (यदि कॉन्फ़िगर हो):** लिंक को खोले बिना ज्ञात खतरनाक सूची से जांच की जाती है।`,
    answerHinglish: `### Do layers mein check hota hai — link open kiye bina:
1. **Local Heuristics:** Raw IP host, misleading subdomains, URL shorteners, punycode (\`xn--\`) aur urgent scam words detect karta hai.
2. **Threat Intel (optional):** Google Safe Browsing API se check karta hai — server kabhi URL visit ya fetch nahi karta.`,
    followUpsEn: [
      "Can a URL detector guarantee that a website is safe?",
      "How can I recognize a suspicious website?",
    ],
    followUpsHi: [
      "क्या कोई URL डिटेक्टर गारंटी दे सकता है कि वेबसाइट सुरक्षित है?",
      "संदिग्ध वेबसाइट की पहचान कैसे करें?",
    ],
  },
  {
    id: "kb-43",
    number: 43,
    category: "H",
    questionEn: "How can I recognize a suspicious website?",
    questionHi: "मैं एक संदिग्ध वेबसाइट की पहचान कैसे कर सकता हूँ?",
    matchPhrases: [
      "how can i recognize a suspicious website",
      "spot suspicious website",
      "recognize phishing site",
      "fake website kaise pehchane",
    ],
    keywordSets: [
      ["recognize", "suspicious", "website"],
      ["spot", "suspicious", "website"],
      ["spot", "phishing", "link"],
    ],
    tags: ["Phishing Clues", "Verification"],
    answerEn: `### 5 Red Flags of a Phishing / Fake Site
1. **Check the true root domain:** Look strictly at the part right before the first \`/\`. In \`secure.paypal.com.evil.top\`, the real owner is \`evil.top\`, *not* PayPal.
2. **Lookalike typos:** \`rnicrosoft\`, \`paypa1\`, or extra hyphens like \`hdfc-kyc-update.xyz\`.
3. **Raw IP addresses or no HTTPS:** Legitimate logins rarely use raw IPs (\`http://192.x...\`).
4. **Hidden redirects / shorteners:** Unexpected shortened links in urgent emails or texts.
5. **Artificial urgency:** Countdowns, account-suspension threats, or instant prize claims.

> **Golden rule:** Never click login links in messages — type the official site address yourself.`,
    answerHi: `### संदिग्ध वेबसाइट पहचानने के 5 मुख्य संकेत
1. **असली रूट डोमेन पढ़ें:** पहले \`/\` से ठीक पहले का डोमेन देखें (\`paypal.fake-site.com\` में असली डोमेन \`fake-site.com\` है)।
2. **मिलती-जुलती स्पेलिंग:** जैसे \`paypa1\` या \`kyc-update-bank.xyz\`।
3. **बिना HTTPS या सीधे IP वाला लिंक।**
4. **अज्ञात URL शॉर्टनर।**
5. **डर या जल्दबाजी का दबाव।**`,
    answerHinglish: `### Fake website pehchanne ke 5 clues:
1. **True root domain check karein** (first \`/\` ke theek pehle वाला domain — jaise \`bank.login-verify.xyz\` mein real site \`login-verify.xyz\` hai).
2. Typos (\`paypa1\`) ya raw IP address.
3. Unfamiliar shortened links aur urgent threats ("24h mein block").
4. Login karne ke liye hamesha official site manually type karein.`,
    followUpsEn: [
      "What should I do if I click a phishing link?",
      "Can a URL detector guarantee that a website is safe?",
    ],
    followUpsHi: [
      "अगर मैं किसी फ़िशिंग लिंक पर क्लिक कर दूँ तो क्या करूँ?",
      "क्या कोई URL डिटेक्टर गारंटी दे सकता है कि वेबसाइट सुरक्षित है?",
    ],
  },
  {
    id: "kb-44",
    number: 44,
    category: "H",
    questionEn: "Can a URL detector guarantee that a website is safe?",
    questionHi: "क्या कोई URL डिटेक्टर गारंटी दे सकता है कि वेबसाइट सुरक्षित है?",
    matchPhrases: [
      "can a url detector guarantee that a website is safe",
      "guarantee website is safe",
      "guarantee safe url",
    ],
    keywordSets: [
      ["url", "detector", "guarantee", "safe"],
      ["guarantee", "website", "safe"],
    ],
    tags: ["Limitations", "Safety Disclaimer"],
    answerEn: `### No — No Scanner Can Guarantee 100% Website Safety
- **Brand-new phishing domains:** Attackers register fresh sites every hour before blocklists ever index them.
- **Compromised legitimate sites:** Even real HTTPS domains with a padlock icon can host a hidden phishing page if hacked.
- **Heuristics = clues only:** A clean heuristic scan means *known red flags weren't seen*, **not** a guarantee of legitimacy. Always double-check the sender and root domain independently.`,
    answerHi: `### नहीं — कोई भी डिटेक्टर 100% सुरक्षा की गारंटी नहीं दे सकता
- **नए डोमेन:** ठग हर घंटे बिल्कुल नए फ़िशिंग डोमेन बनाते हैं जो तुरंत ब्लॉकलिस्ट में नहीं होते।
- **HTTPS लॉक का मतलब सुरक्षित नहीं:** आजकल नकली वेबसाइटें भी HTTPS उपयोग करती हैं।
- कम जोखिम स्कोर केवल संकेत है, पूर्ण प्रमाण नहीं — हमेशा आधिकारिक ऐप या वेबसाइट से सत्यापित करें।`,
    answerHinglish: `### Nahi — Koi bhi scanner 100% safe ki guarantee nahi de sakta
Naye phishing domains har ghante bante hain aur HTTPS padlock fake sites par bhi hota hai. Clean heuristic scan sirf itna batata hai ki **known red flags nahi mile** — humesha independent verification karein.`,
    followUpsEn: [
      "How can I recognize a suspicious website?",
      "What should I do if I click a phishing link?",
    ],
    followUpsHi: [
      "संदिग्ध वेबसाइट की पहचान कैसे करें?",
      "अगर मैं किसी फ़िशिंग लिंक पर क्लिक कर दूँ तो क्या करूँ?",
    ],
  },
  {
    id: "kb-45",
    number: 45,
    category: "H",
    questionEn: "What should I do if I click a phishing link?",
    questionHi: "अगर मैं किसी फ़िशिंग लिंक पर क्लिक कर दूँ तो मुझे क्या करना चाहिए?",
    matchPhrases: [
      "what should i do if i click a phishing link",
      "clicked a phishing link",
      "clicked suspicious link",
      "phishing link par click kar diya",
    ],
    keywordSets: [
      ["click", "phishing", "link"],
      ["clicked", "phishing"],
      ["clicked", "suspicious", "link"],
    ],
    tags: ["Incident Response", "Phishing"],
    answerEn: `### Stay Calm & Follow These Immediate Steps
1. **Did you only open the page (entered nothing)?** Close the tab right away, avoid downloading anything, and clear recent site data/cookies.
2. **Did you type a password?** Change that account's password **immediately**, rotate any account reusing it, sign out active sessions, and turn on **2FA / Passkeys**.
3. **Did you enter bank/card details?** Contact your bank's fraud helpline immediately to freeze or block the card.
4. **Did a file download or run?** Disconnect from Wi-Fi/internet and run a full antivirus/OS security scan before logging back in.`,
    answerHi: `### घबराएं नहीं — तुरंत ये कदम उठाएं
1. **यदि केवल लिंक खुला और कुछ दर्ज नहीं किया:** तुरंत टैब बंद करें और कुछ डाउनलोड न करें।
2. **यदि पासवर्ड डाला:** तुरंत नया मजबूत पासवर्ड बदलें, सक्रिय सत्र बंद करें और 2FA चालू करें।
3. **यदि बैंक/कार्ड जानकारी डाली:** तुरंत बैंक हेल्पलाइन से कार्ड ब्लॉक कराएं।
4. **यदि कोई फ़ाइल डाउनलोड हुई:** इंटरनेट बंद करके एंटीवायरस स्कैन चलाएं।`,
    answerHinglish: `### Phishing link click karne par turant karein:
1. **Kuch type nahi kiya:** Tab close karein aur kuch download na karein.
2. **Password type kiya:** Turant password change karein, sessions log out karein aur 2FA lagayein.
3. **Card/Bank details daali:** Bank ko turant call karke card freeze karein.
4. **File download hui:** Wi-Fi disconnect karke full malware scan chalayein.`,
    followUpsEn: [
      "What should I do if my password is leaked?",
      "What is Two-Factor Authentication (2FA)?",
    ],
    followUpsHi: [
      "अगर मेरा पासवर्ड लीक हो जाए तो क्या करूँ?",
      "टू-फैक्टर ऑथेंटिकेशन (2FA) क्या है?",
    ],
  },

  // =========================================================================
  // CATEGORY I: SECURECHECK PLATFORM GUIDE (46 - 51)
  // =========================================================================
  {
    id: "kb-46",
    number: 46,
    category: "I",
    questionEn: "How do I use the password analyzer?",
    questionHi: "मैं पासवर्ड विश्लेषक (Password Analyzer) का उपयोग कैसे करूँ?",
    matchPhrases: [
      "how do i use the password analyzer",
      "how to use password analyzer",
      "use password analyzer",
    ],
    keywordSets: [
      ["use", "password", "analyzer"],
      ["how", "analyzer"],
    ],
    tags: ["Platform Guide", "Password Analyzer"],
    answerEn: `### How to Audit a Password in 4 Steps
1. Open **Password Analyzer** from the sidebar or Dashboard.
2. Type a test password (plus optional personal keywords like your name/company in the context box so it checks for personal hints).
3. Inspect your real-time **Strength Score**, **Entropy (bits)**, **Estimated Crack Times**, and **Detected Weaknesses** (length, repeats, sequences, dictionary words).
4. Follow the **Smart Improvement Plan**, optionally click **Record Audit** (stores only sanitized score/entropy — *never* the password) to include it in your Security Report.`,
    answerHi: `### पासवर्ड विश्लेषक का उपयोग करने के 4 चरण
1. साइडबार से **पासवर्ड विश्लेषक** खोलें।
2. जांचने के लिए पासवर्ड टाइप करें (चाहें तो संदर्भ शब्द जैसे नाम/साल भी लिखें)।
3. तुरंत **स्ट्रेंथ स्कोर**, **एंट्रॉपी बिट्स**, **क्रैक समय अनुमान** और कमज़ोरियाँ देखें।
4. सुझावों के अनुसार सुधार करें; केवल आंकड़े सहेजने के लिए **ऑडिट सहेजें** पर क्लिक करें (पासवर्ड कभी सहेजा नहीं जाता)।`,
    answerHinglish: `### Password Analyzer use karne ke 4 steps:
1. Sidebar se **Password Analyzer** kholein.
2. Apna test password type karein (aur optionally context words jaise naam/brand).
3. Live **Strength Score, Entropy, Crack Times aur Weaknesses** dekhein.
4. Suggestions follow karein aur optionally sanitized audit metrics Security Report ke liye save karein.`,
    followUpsEn: [
      "Is it safe to type my password here?",
      "What is the difference between password strength and crack time?",
    ],
    followUpsHi: [
      "क्या यहाँ अपना पासवर्ड टाइप करना सुरक्षित है?",
      "पासवर्ड क्षमता और क्रैक समय में क्या अंतर है?",
    ],
  },
  {
    id: "kb-47",
    number: 47,
    category: "I",
    questionEn: "How do I use the password generator?",
    questionHi: "मैं पासवर्ड जनरेटर (Password Generator) का उपयोग कैसे करूँ?",
    matchPhrases: [
      "how do i use the password generator",
      "how to use password generator",
      "use password generator",
    ],
    keywordSets: [
      ["use", "password", "generator"],
      ["how", "generator"],
    ],
    tags: ["Platform Guide", "Password Generator"],
    answerEn: `### How to Generate a Strong Secret
1. Open **Password Generator** and pick **Random Password** or **Memorable Passphrase**.
2. Set your length (**16+ chars** or **5+ words** recommended) and toggle character sets or exclude ambiguous characters (\`0/O\`, \`1/l/I\`).
3. Click **Generate / Regenerate**, review its live strength rating, and copy it directly into your Password Manager.
4. Nothing is saved by SecureCheck, and your clipboard auto-clears based on Settings.`,
    answerHi: `### मजबूत पासवर्ड बनाने का तरीका
1. **पासवर्ड जनरेटर** में **रैंडम पासवर्ड** या **पासफ़्रेज़** मोड चुनें।
2. लंबाई (16+ अक्षर या 5+ शब्द अनुशंसित) और अक्षर विकल्प चुनें।
3. **नया बनाएं** पर क्लिक करें, मजबूती देखें और कॉपी करके अपने पासवर्ड मैनेजर में सहेजें।`,
    answerHinglish: `### Password Generator kaise use karein:
1. **Random Password** ya **Memorable Passphrase** mode select karein.
2. Length (**16+ chars** ya **5+ words**) aur toggles set karein.
3. Generate karke seedha apne **Password Manager** mein copy-save kar lein.`,
    followUpsEn: [
      "How does the password generator work?",
      "How should I securely save a generated password?",
    ],
    followUpsHi: [
      "पासवर्ड जनरेटर कैसे काम करता है?",
      "बनाए गए पासवर्ड को सुरक्षित रूप से कहाँ सेव करें?",
    ],
  },
  {
    id: "kb-48",
    number: 48,
    category: "I",
    questionEn: "What is the difference between password strength and crack time?",
    questionHi: "पासवर्ड क्षमता (Strength) और क्रैक समय (Crack Time) में क्या अंतर है?",
    matchPhrases: [
      "what is the difference between password strength and crack time",
      "difference between password strength and crack time",
      "strength vs crack time",
    ],
    keywordSets: [
      ["difference", "password", "strength", "crack", "time"],
      ["strength", "vs", "crack", "time"],
    ],
    tags: ["Concepts", "Platform Guide"],
    answerEn: `### Strength Rating vs. Estimated Crack Time
- **Password Strength (Score & Level):** Combines entropy, length, character variety, and pattern penalties (\`Very Weak\` to \`Very Strong\`) to diagnose *why* a password is weak or strong.
- **Crack Time:** Translates those guesses into approximate **time estimates** across specific online and offline attack speeds (e.g., throttled logins vs. GPU clusters).`,
    answerHi: `### पासवर्ड मजबूती बनाम क्रैक समय
- **पासवर्ड मजबूती (Score):** लंबाई, एंट्रॉपी और कमज़ोर पैटर्न के आधार पर समग्र गुणवत्ता (\`Very Weak\` से \`Very Strong\`) बताती है।
- **क्रैक समय:** यह अनुमान लगाता है कि विभिन्न ऑनलाइन और ऑफ़लाइन हमलों में उस पासवर्ड को तोड़ने में लगभग कितना समय लगेगा।`,
    answerHinglish: `### Password Strength vs Crack Time:
- **Strength:** Overall quality rating (patterns, dictionary hits, entropy aur length dekh kar \`Very Weak\` se \`Very Strong\`).
- **Crack Time:** Unhi guesses ko alag-alag online aur offline attack speeds mein approx time estimate mein convert karta hai.`,
    followUpsEn: [
      "Is the displayed crack time guaranteed?",
      "What is the difference between entropy and password strength?",
    ],
    followUpsHi: [
      "क्या दिखाया गया क्रैक समय गारंटीड होता है?",
      "एंट्रॉपी और पासवर्ड मजबूती में क्या अंतर है?",
    ],
  },
  {
    id: "kb-49",
    number: 49,
    category: "I",
    questionEn: "What does the breach detector check?",
    questionHi: "ब्रीच डिटेक्टर (Breach Detector) क्या जांचता है?",
    matchPhrases: [
      "what does the breach detector check",
      "what does breach checker check",
    ],
    keywordSets: [
      ["what", "breach", "detector", "check"],
      ["what", "breach", "checker", "check"],
    ],
    tags: ["Platform Guide", "Breach Checker"],
    answerEn: `### What SecureCheck's Breach Checker Inspects
1. **Password k-Anonymity Lookup (Real Live Check):** Computes a local SHA-1 hash of your test password, sends only the first 5 characters to Have I Been Pwned, and checks locally whether that password appeared in real leaked credential databases (plus its occurrence count).
2. **Email Awareness Tab (Clearly Labelled Demo Mode):** Demonstrates typical breach metadata (exposed data classes like emails/passwords) using \`[DEMO]\` profiles — without sending personal emails anywhere.`,
    answerHi: `### ब्रीच चेकर क्या जांचता है
1. **पासवर्ड k-Anonymity जांच (वास्तविक लाइव जांच):** स्थानीय SHA-1 हैश के केवल 5-अक्षर के प्रीफ़िक्स द्वारा Have I Been Pwned पर देखता है कि पासवर्ड पहले लीक हुआ है या नहीं।
2. **डेमो ईमेल जागरूकता टैब:** स्पष्ट रूप से चिह्नित \`[DEMO]\` प्रोफ़ाइल से समझाता है कि ईमेल लीक में किस प्रकार का डेटा उजागर होता है।`,
    answerHinglish: `### Breach Checker kya check karta hai:
1. **Live Password k-Anonymity:** SHA-1 ke sirf first 5 chars se Have I Been Pwned par check karta hai ki password real breaches mein kitni baar mila.
2. **Email Tab:** Clearly labelled \`[DEMO]\` examples dikhata hai awareness ke liye.`,
    followUpsEn: [
      "How does the breach checker protect my privacy?",
      "Is my password safe if no breach is found?",
    ],
    followUpsHi: [
      "ब्रीच चेकर मेरी गोपनीयता कैसे सुरक्षित रखता है?",
      "अगर कोई ब्रीच नहीं मिला तो क्या मेरा पासवर्ड सुरक्षित है?",
    ],
  },
  {
    id: "kb-50",
    number: 50,
    category: "I",
    questionEn: "What are the different features available in SecureCheck?",
    questionHi: "SecureCheck में कौन-कौन से फ़ीचर उपलब्ध हैं?",
    matchPhrases: [
      "what are the different features available in securecheck",
      "features in securecheck",
      "what does securecheck offer",
      "securecheck features",
    ],
    keywordSets: [
      ["features", "securecheck"],
      ["what", "features", "available"],
    ],
    tags: ["Platform Overview", "Modules"],
    answerEn: `### All Modules Inside SecureCheck
- **Dashboard:** Security Posture Score, quick actions, recent local activity, and daily cyber tips.
- **Password Analyzer:** Real-time \`zxcvbn\` scoring, entropy bits, multi-scenario crack time estimates, and improvement steps.
- **Password Generator:** CSPRNG passwords (8–64 chars), diceware passphrases, and batch mode.
- **Breach Checker:** Zero-knowledge HIBP k-Anonymity password exposure check + clearly labelled demo email awareness.
- **Phishing Detector:** Heuristic URL/message scanner + optional Safe Browsing threat intel (never visits URLs).
- **Security Report:** Interactive hygiene checklist, sanitized risk summary, and **PDF export**.
- **AI Security Assistant:** Context-aware guide available on the dedicated page and this floating chatbot.
- **Achievements & Settings:** Local badge milestones, Dark/Light mode, English/Hindi UI, and data controls.`,
    answerHi: `### SecureCheck के सभी मुख्य मॉड्यूल
- **डैशबोर्ड:** सुरक्षा स्थिति स्कोर, त्वरित क्रियाएं और दैनिक सुरक्षा सुझाव।
- **पासवर्ड विश्लेषक:** रियल-टाइम स्कोर, एंट्रॉपी, क्रैक-समय और सुधार योजना।
- **पासवर्ड जनरेटर:** सुरक्षित CSPRNG पासवर्ड और पासफ़्रेज़ निर्माण।
- **ब्रीच चेकर:** k-Anonymity द्वारा गोपनीय पासवर्ड लीक जांच।
- **फ़िशिंग डिटेक्टर:** संदिग्ध लिंक और संदेशों का विश्लेषण।
- **सुरक्षा रिपोर्ट:** स्वच्छता चेकलिस्ट और **PDF रिपोर्ट डाउनलोड**।
- **AI सुरक्षा सहायक, उपलब्धियां और सेटिंग्स:** डार्क/लाइट थीम और अंग्रेज़ी/हिन्दी समर्थन।`,
    answerHinglish: `### SecureCheck ke main modules:
- **Dashboard & Security Report (PDF export)**
- **Password Analyzer** (Entropy + Crack Time + zxcvbn)
- **Password Generator** (CSPRNG + Passphrases)
- **Breach Checker** (HIBP k-Anonymity)
- **Phishing Detector** (URL heuristics + Threat Intel)
- **AI Security Assistant**, **Achievements** & **Settings** (Dark/Light + EN/HI).`,
    followUpsEn: [
      "How can I get the best results from SecureCheck?",
      "Is it safe to type my password here?",
    ],
    followUpsHi: [
      "SecureCheck से सर्वश्रेष्ठ परिणाम कैसे प्राप्त करें?",
      "क्या यहाँ अपना पासवर्ड टाइप करना सुरक्षित है?",
    ],
  },
  {
    id: "kb-51",
    number: 51,
    category: "I",
    questionEn: "How can I get the best results from SecureCheck?",
    questionHi: "मैं SecureCheck से सर्वश्रेष्ठ परिणाम कैसे प्राप्त कर सकता हूँ?",
    matchPhrases: [
      "how can i get the best results from securecheck",
      "best results from securecheck",
      "tips for using securecheck",
    ],
    keywordSets: [
      ["best", "results", "securecheck"],
      ["get", "best", "securecheck"],
    ],
    tags: ["Platform Guide", "Workflow"],
    answerEn: `### Recommended 4-Step Security Workflow
1. **Audit first:** Test your password patterns in **Password Analyzer** (add your name/brand in the context box for stricter detection) and fix weak patterns.
2. **Check exposure:** Run the password through **Breach Checker** (k-Anonymity) — replace any leaked password immediately.
3. **Generate stronger replacements:** Use **Password Generator** (16+ random chars or 5-word passphrase) and store them in a Password Manager with **2FA** enabled.
4. **Export your baseline:** Complete the checklist in **Security Report** and download your sanitized PDF summary.`,
    answerHi: `### सर्वोत्तम सुरक्षा परिणामों के लिए 4-चरणीय प्रक्रिया
1. **पासवर्ड विश्लेषक** में अपने पासवर्ड पैटर्न की जांच करें और कमज़ोरियां दूर करें।
2. **ब्रीच चेकर** से सुनिश्चित करें कि पासवर्ड किसी डेटा लीक में न हो।
3. **पासवर्ड जनरेटर** से 16+ अक्षरों का नया पासवर्ड बनाएं और पासवर्ड मैनेजर + 2FA अपनाएं।
4. **सुरक्षा रिपोर्ट** में स्वच्छता चेकलिस्ट पूरी करके PDF रिपोर्ट सहेजें।`,
    answerHinglish: `### Best results ke liye 4-step workflow:
1. **Analyzer** mein weakness aur entropy check karein.
2. **Breach Checker** se verify karein ki password leaked na ho.
3. **Generator** se 16+ char unique password banakar Password Manager + 2FA set karein.
4. **Security Report** mein hygiene checklist complete karke PDF download karein.`,
    followUpsEn: [
      "What are the different features available in SecureCheck?",
      "How do I create a unique password for every account?",
    ],
    followUpsHi: [
      "SecureCheck में कौन-कौन से फ़ीचर उपलब्ध हैं?",
      "हर खाते के लिए अलग पासवर्ड कैसे बनाऊँ?",
    ],
  },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "was",
  "were",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "what",
  "why",
  "how",
  "when",
  "where",
  "if",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "from",
  "by",
  "it",
  "i",
  "my",
  "me",
  "this",
  "that",
  "these",
  "here",
  "or",
  "and",
  "actually",
  "really",
  "between",
  "even",
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’"`]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeContentWords(normalized: string): string[] {
  return normalized
    .split(/[\s-]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export interface KnowledgeMatchResult {
  entry: KnowledgeBaseEntry;
  confidence: number;
}

/**
 * Matches user queries (exact, natural-language English, Hindi, or Hinglish)
 * against all 51 predefined Knowledge Base items.
 */
export function matchKnowledgeBase(query: string): KnowledgeMatchResult | null {
  const normQuery = normalizeText(query);
  if (!normQuery) return null;

  const queryTokens = new Set(tokenizeContentWords(normQuery));
  let bestEntry: KnowledgeBaseEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    const normEn = normalizeText(entry.questionEn);
    const normHi = normalizeText(entry.questionHi);

    if (normQuery === normEn || normQuery === normHi) {
      return { entry, confidence: 100 };
    }

    // 1. Exact phrase / close natural-language phrase inclusion
    for (const phrase of entry.matchPhrases) {
      const normPhrase = normalizeText(phrase);
      if (normQuery === normPhrase) {
        score = Math.max(score, 98);
      } else if (normQuery.includes(normPhrase) || normPhrase.includes(normQuery)) {
        const lenRatio = Math.min(normQuery.length, normPhrase.length) / Math.max(normQuery.length, normPhrase.length);
        score = Math.max(score, 65 + Math.round(lenRatio * 25));
      }
    }

    // 2. Keyword-set matching (all tokens in a keyword group present)
    for (const kwSet of entry.keywordSets) {
      const allMatched = kwSet.every((kw) => {
        const normKw = normalizeText(kw);
        return normQuery.includes(normKw) || queryTokens.has(normKw);
      });
      if (allMatched) {
        score = Math.max(score, 55 + kwSet.length * 10);
      }
    }

    // 3. Content-token overlap with the canonical English or Hindi question
    const enTokens = tokenizeContentWords(normEn);
    const hiTokens = tokenizeContentWords(normHi);
    const overlapEn = enTokens.filter((t) => queryTokens.has(t) || normQuery.includes(t)).length;
    const overlapHi = hiTokens.filter((t) => normQuery.includes(t)).length;

    if (enTokens.length > 0 && overlapEn >= 2) {
      const ratio = overlapEn / enTokens.length;
      if (ratio >= 0.5) {
        score = Math.max(score, Math.round(45 + ratio * 40));
      }
    }
    if (hiTokens.length > 0 && overlapHi >= 2) {
      const ratio = overlapHi / hiTokens.length;
      if (ratio >= 0.5) {
        score = Math.max(score, Math.round(45 + ratio * 40));
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore >= 55) {
    return { entry: bestEntry, confidence: Math.min(100, bestScore) };
  }
  return null;
}
