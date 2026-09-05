export type Language = "en" | "hi";

export const translations = {
  en: {
    nav: {
      howItWorks: "How it works",
      trySample: "Try a sample",
      independentPrototype: "Independent prototype",
      notOfficial: "Not official EPFO"
    },
    hero: {
      eyebrow: "MANY SIGNALS. ONE EVIDENCE-BACKED ANSWER.",
      headlineFirst: "One claim.",
      headlineSecond: "One clear answer.",
      supporting: "When your portal, SMS and passbook tell different stories, ClaimClarity compares the evidence and explains what it supports.",
      trySample: "Try a sample claim",
      addCustom: "Add my evidence",
      reconcilesNotice: "ClaimClarity compares the evidence and explains what it supports.",
      disclaimer: "No login · Synthetic evidence · No live EPFO access · Independent prototype · Not official EPFO"
    },
    scenarios: {
      eyebrow: "CHOOSE A SCENARIO",
      title: "Select a claim situation",
      subtitle: "See how ClaimClarity compares contradictory records without guessing.",
      caseA: "Why do my records disagree?",
      caseB: "It says processing. Was I already paid?",
      caseC: "Can you tell what happened?",
      caseConflict: "Two records give incompatible outcomes",
      reconcileCta: "Reconcile these records"
    },
    review: {
      header: "YOUR EVIDENCE",
      subtext: "We'll compare these records. We won't add information that isn't present.",
      viewFields: "View extracted facts",
      hideFields: "Hide extracted facts",
      reconcileBtn: "Reconcile these records"
    },
    loading: {
      steps: [
        "Reviewing evidence…",
        "Matching claim details…",
        "Ordering dated records…",
        "Checking for conflicting outcomes…",
        "Preparing your answer…"
      ],
      caption: "Deterministic audit based strictly on the provided evidence."
    },
    result: {
      eyebrow: "EVIDENCE-BACKED ANSWER",
      whatHappened: "WHAT HAPPENED?",
      whyHeading: "WHY?",
      whatProvesIt: "WHAT PROVES IT?",
      evidenceLedger: "WHY WE REACHED THIS ANSWER",
      whatShouldIDo: "WHAT SHOULD I DO?",
      dontDoThisYet: "DON'T DO THIS YET",
      whyThisNotAnother: "WHY THIS STATE, NOT ANOTHER?",
      traceCtaShow: "See why we reached this answer",
      traceCtaHide: "Hide technical reasoning",
      resetDemo: "Reset demo",
      earlierRecord: "Earlier record",
      laterOutcome: "Later outcome",
      superseded: "Superseded",
      highConfidence: "High confidence",
      mediumConfidence: "Medium confidence",
      lowConfidence: "Needs verification",
      conflict: {
        headline: "We found a conflict.",
        subtext: "Your supplied records contain incompatible outcomes.",
        whatWeKnow: "WHAT WE KNOW",
        whatWeCannotConfirm: "WHAT WE CANNOT CONFIRM",
        action: "Verify the official claim outcome directly through official records before taking another action."
      },
      unknown: {
        headline: "We don't have enough information yet.",
        subtext: "We can see that your request was received, but we cannot determine whether it was processing, approved, rejected, settled or credited.",
        whatsMissing: "WHAT'S MISSING?",
        nextStepTitle: "NEXT STEP",
        nextStepAction: "Add another dated claim-status record or passbook entry."
      }
    },
    custom: {
      title: "Add your evidence",
      pasteLabel: "Paste claim text",
      pastePlaceholder: "Paste a tracker snippet, SMS notification, passbook entry, or bank message…",
      addPasted: "Add text record",
      uploadLabel: "Upload file (PNG, JPG, PDF, TXT — max 3 MB)",
      reconcileBtn: "Reconcile my evidence",
      emptyNotice: "Add at least one piece of evidence to reconcile."
    }
  },
  hi: {
    nav: {
      howItWorks: "यह कैसे काम करता है",
      trySample: "नमूना देखें",
      independentPrototype: "स्वतंत्र प्रोटोटाइप",
      notOfficial: "आधिकारिक ईपीएफओ सेवा नहीं"
    },
    hero: {
      eyebrow: "अलग-अलग रिकॉर्ड। एक स्पष्ट सबूत-आधारित जवाब।",
      headlineFirst: "एक दावा।",
      headlineSecond: "एक साफ जवाब।",
      supporting: "जब पोर्टल, एसएमएस और पासबुक अलग-अलग बातें कहें, तो ClaimClarity सबूतों की तुलना कर सही स्थिति समझाता है।",
      trySample: "नमूना दावा देखें",
      addCustom: "अपना सबूत जोड़ें",
      reconcilesNotice: "ClaimClarity रिकॉर्ड्स की तुलना कर बताता है कि क्या स्थिति साबित होती है।",
      disclaimer: "लॉगिन की आवश्यकता नहीं · काल्पनिक डेटा · कोई लाइव सिस्टम नहीं · स्वतंत्र प्रोटोटाइप"
    },
    scenarios: {
      eyebrow: "स्थिति चुनें",
      title: "दावे की स्थिति चुनें",
      subtitle: "देखें कि ClaimClarity परस्पर विरोधी रिकॉर्ड्स की जांच बिना किसी अनुमान के कैसे करता है।",
      caseA: "मेरे रिकॉर्ड्स में अलग-अलग स्थिति क्यों दिख रही है?",
      caseB: "प्रोसेसिंग दिख रहा है, क्या पैसे मिल चुके हैं?",
      caseC: "क्या आप बता सकते हैं क्या हुआ?",
      caseConflict: "दो रिकॉर्ड्स में परस्पर विरोधी परिणाम हैं",
      reconcileCta: "इन रिकॉर्ड्स की जांच करें"
    },
    review: {
      header: "आपके दस्तावेज़ व रिकॉर्ड",
      subtext: "हम केवल मौजूद सबूतों की तुलना करेंगे। कोई भी बात अपनी ओर से नहीं जोड़ेंगे।",
      viewFields: "निकाले गए तथ्य देखें",
      hideFields: "तथ्य छिपाएं",
      reconcileBtn: "इन रिकॉर्ड्स की जांच करें"
    },
    loading: {
      steps: [
        "दस्तावेज़ों की समीक्षा हो रही है…",
        "दावे की पहचान मिलाई जा रही है…",
        "तारीखों के क्रम में रिकॉर्ड्स लगाए जा रहे हैं…",
        "विरोधाभासी परिणामों की जांच हो रही है…",
        "आपका जवाब तैयार किया जा रहा है…"
      ],
      caption: "केवल आपके द्वारा दिए गए सबूतों पर आधारित सटीक जांच।"
    },
    result: {
      eyebrow: "सबूत-आधारित जवाब",
      whatHappened: "क्या स्थिति है?",
      whyHeading: "कारण क्या है?",
      whatProvesIt: "इसका क्या सबूत है?",
      evidenceLedger: "यह निष्कर्ष क्यों निकला?",
      whatShouldIDo: "अब क्या करना चाहिए?",
      dontDoThisYet: "अभी यह गलती न करें",
      whyThisNotAnother: "यह स्थिति क्यों, दूसरी क्यों नहीं?",
      traceCtaShow: "जांच का पूरा तकनीकी विवरण देखें",
      traceCtaHide: "तकनीकी विवरण छिपाएं",
      resetDemo: "दोबारा शुरू करें",
      earlierRecord: "पुराना रिकॉर्ड",
      laterOutcome: "नया परिणाम",
      superseded: "बदला गया",
      highConfidence: "मजबूत सबूत",
      mediumConfidence: "संभावित स्थिति",
      lowConfidence: "सत्यापन आवश्यक",
      conflict: {
        headline: "रिकॉर्ड्स में विरोधाभास मिला।",
        subtext: "आपके दिए गए दस्तावेज़ों में दो परस्पर विरोधी परिणाम मौजूद हैं।",
        whatWeKnow: "हमें क्या पता चला",
        whatWeCannotConfirm: "हम क्या पक्का नहीं कह सकते",
        action: "कोई भी नया कदम उठाने से पहले आधिकारिक ईपीएफओ कार्यालय से दावे की सही स्थिति स्पष्ट करें।"
      },
      unknown: {
        headline: "अभी इतनी जानकारी नहीं है कि पक्का बताया जा सके।",
        subtext: "हम देख सकते हैं कि अनुरोध दर्ज हुआ था, लेकिन यह नहीं बताया जा सकता कि दावा पास हुआ, निरस्त हुआ या पैसे भेजे गए।",
        whatsMissing: "क्या जानकारी गायब है?",
        nextStepTitle: "अगला कदम",
        nextStepAction: "तारीख व स्पष्ट स्थिति वाला कोई अन्य रिकॉर्ड या पासबुक की प्रविष्टि जोड़ें।"
      }
    },
    custom: {
      title: "अपना सबूत जोड़ें",
      pasteLabel: "दावे से जुड़ा संदेश या विवरण चिपकाएं",
      pastePlaceholder: "पोर्टल का स्टेटस, एसएमएस, पासबुक प्रविष्टि या बैंक संदेश यहां पेस्ट करें…",
      addPasted: "विवरण जोड़ें",
      uploadLabel: "फ़ाइल अपलोड करें (PNG, JPG, PDF, TXT — अधिकतम 3 MB)",
      reconcileBtn: "मेरे सबूतों की जांच करें",
      emptyNotice: "जांच के लिए कम से कम एक दस्तावेज़ या रिकॉर्ड जोड़ें।"
    }
  }
};
