export type Language = "en" | "hi";

export const translations = {
  en: {
    nav: {
      howItWorks: "How it works",
      trySample: "Try an example",
      independentPrototype: "Independent Claim Assistant",
      notOfficial: "Not affiliated with EPFO"
    },
    hero: {
      eyebrow: "MANY UPDATES. ONE EVIDENCE-BACKED ANSWER.",
      headlineFirst: "One claim.",
      headlineSecond: "One clear answer.",
      supporting: "When your portal, SMS alerts, and passbook tell different stories, ClaimClarity compares the records and explains what is actually happening with your claim.",
      trySample: "Try an example case",
      addCustom: "Check my claim records",
      reconcilesNotice: "ClaimClarity compares your records and explains what they indicate.",
      disclaimer: "Privacy-first · No login required · Evaluates your records safely · Independent service"
    },
    scenarios: {
      eyebrow: "CHOOSE AN EXAMPLE",
      title: "Select a claim situation",
      subtitle: "See how ClaimClarity compares contradictory records without guessing.",
      caseA: "Why do my records disagree?",
      caseB: "It says processing. Was I already paid?",
      caseC: "Can you tell what happened?",
      caseConflict: "Two records give incompatible outcomes",
      reconcileCta: "Check these records"
    },
    review: {
      header: "YOUR CLAIM RECORDS",
      subtext: "We'll compare these records. We won't add information that isn't present.",
      viewFields: "View extracted details",
      hideFields: "Hide extracted details",
      reconcileBtn: "Check these records"
    },
    loading: {
      steps: [
        "Reviewing your records…",
        "Matching claim numbers…",
        "Ordering timeline by date…",
        "Checking for conflicting outcomes…",
        "Preparing your evidence summary…"
      ],
      caption: "Cross-checking dates, claim numbers, and available rules..."
    },
    result: {
      eyebrow: "EVIDENCE-BACKED ANSWER",
      whatHappened: "WHAT HAPPENED?",
      whyHeading: "WHY WE REACHED THIS ANSWER",
      whatProvesIt: "WHAT PROVES IT?",
      evidenceLedger: "RECORD TIMELINE (CHRONOLOGICAL EVIDENCE)",
      whatShouldIDo: "WHAT SHOULD I DO?",
      dontDoThisYet: "DON'T DO THIS YET (PROTECT YOUR CLAIM)",
      whyThisNotAnother: "WHY THIS STATUS, NOT ANOTHER?",
      traceCtaShow: "View Verification Details & Audit Log",
      traceCtaHide: "Hide Verification Details",
      resetDemo: "Start over",
      earlierRecord: "Earlier record",
      laterOutcome: "Later outcome",
      superseded: "Superseded by newer record",
      highConfidence: "High confidence",
      mediumConfidence: "Moderate confidence",
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
      },
      diagnostic: {
        eyebrow: "DIAGNOSTIC CLASSIFICATION",
        rawObservationLabel: "RECORD OBSERVED:",
        recommendedStepLabel: "Recommended Step:",
        prerequisitesLabel: "PREREQUISITES:",
        escalationNoticeLabel: "When to escalate:"
      },
      timing: {
        eyebrow: "TIMELINE & SERVICE BENCHMARK",
        elapsedNotice: "Elapsed since submission:",
        benchmarkNotice: "Citizen Charter guideline (informational):"
      },
      partition: {
        eyebrow: "CLAIM CONTEXT & RECORD SEPARATION",
        multiClaimNotice: "We found records relating to distinct claims or forms.",
        unresolvedNotice: "Some records could not be confidently linked to this claim."
      },
      attribution: {
        eyebrow: "PAYMENT VERIFICATION & LINKAGE",
        attributedNotice: "Payment verified and linked to this claim reference.",
        unattributedNotice: "Payment received, but we could not confidently link it to this claim.",
        candidateNotice: "Payment amount and date are compatible with this claim, but direct claim reference is unconfirmed.",
        conflictedNotice: "Payment details match multiple active claims or show conflicting references."
      },
      matrix: {
        eyebrow: "EVIDENCE VERIFICATION MATRIX",
        title: "Structured Evidence Verification",
        subtitle: "Breakdown of observed records versus ClaimClarity verification findings.",
        colCheck: "Check / Attribute",
        colSource: "Source & Date",
        colObserved: "Observed Evidence",
        colFinding: "ClaimClarity Finding",
        colStatus: "Status",
        statusVerified: "Verified",
        statusSupported: "Supported",
        statusNeedsReview: "Needs Review",
        statusUnclear: "Unclear",
        statusConflict: "Conflicted",
        statusSuperseded: "Superseded",
        toggleShow: "View Structured Verification Matrix",
        toggleHide: "Hide Verification Matrix"
      },
      dossier: {
        eyebrow: "EVIDENCE & GRIEVANCE SUPPORT DOSSIER",
        title: "Evidence & Grievance Support Dossier",
        subtitle: "Download an organized PDF summary of your records, verification findings, timeline, and guidance for your personal records or official follow-up.",
        downloadBtn: "Download PDF Dossier",
        generatingBtn: "Preparing Dossier...",
        disclaimerNotice: "Independent evidence-organizing aid. Not an official EPFO / EPFiGMS submission."
      }
    },
    custom: {
      title: "Add your claim records",
      pasteLabel: "Paste claim text or message",
      pastePlaceholder: "Paste a tracker update, SMS notification, passbook entry, or bank message…",
      addPasted: "Add message record",
      uploadLabel: "Attach screenshot or document (PNG, JPG, PDF, TXT — max 3 MB)",
      reconcileBtn: "Check my records",
      emptyNotice: "Add at least one claim record or message to check."
    }
  },
  hi: {
    nav: {
      howItWorks: "यह कैसे काम करता है",
      trySample: "उदाहरण देखें",
      independentPrototype: "स्वतंत्र क्लेम सहायक",
      notOfficial: "ईपीएफओ से संबद्ध नहीं"
    },
    hero: {
      eyebrow: "अलग-अलग रिकॉर्ड। एक स्पष्ट सबूत-आधारित जवाब।",
      headlineFirst: "एक दावा।",
      headlineSecond: "एक साफ जवाब।",
      supporting: "जब पोर्टल, एसएमएस और पासबुक अलग-अलग बातें कहें, तो ClaimClarity रिकॉर्ड्स की तुलना कर सही स्थिति समझाता है।",
      trySample: "उदाहरण केस देखें",
      addCustom: "अपने रिकॉर्ड्स जांचें",
      reconcilesNotice: "ClaimClarity रिकॉर्ड्स की तुलना कर बताता है कि क्या स्थिति साबित होती है।",
      disclaimer: "गोपनीयता सुरक्षित · लॉगिन की आवश्यकता नहीं · रिकॉर्ड्स की सुरक्षित जांच · स्वतंत्र सेवा"
    },
    scenarios: {
      eyebrow: "उदाहरण चुनें",
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
      subtext: "हम केवल मौजूद रिकॉर्ड्स की तुलना करेंगे। कोई भी बात अपनी ओर से नहीं जोड़ेंगे।",
      viewFields: "निकाले गए विवरण देखें",
      hideFields: "विवरण छिपाएं",
      reconcileBtn: "इन रिकॉर्ड्स की जांच करें"
    },
    loading: {
      steps: [
        "दस्तावेज़ों व रिकॉर्ड्स की समीक्षा हो रही है…",
        "दावा संख्या मिलाई जा रही है…",
        "तारीखों के क्रम में रिकॉर्ड्स लगाए जा रहे हैं…",
        "विरोधाभासी परिणामों की जांच हो रही है…",
        "आपका सारांश तैयार किया जा रहा है…"
      ],
      caption: "तारीखों, दावा संख्या व उपलब्ध नियमों के आधार पर सटीक जांच।"
    },
    result: {
      eyebrow: "सबूत-आधारित जवाब",
      whatHappened: "क्या स्थिति है?",
      whyHeading: "यह निष्कर्ष क्यों निकला?",
      whatProvesIt: "इसका क्या सबूत है?",
      evidenceLedger: "रिकॉर्ड्स का समय-क्रम (समयरेखा)",
      whatShouldIDo: "अब क्या करना चाहिए?",
      dontDoThisYet: "अभी यह गलती न करें (दावे की सुरक्षा)",
      whyThisNotAnother: "यह स्थिति क्यों, दूसरी क्यों नहीं?",
      traceCtaShow: "सत्यापन का पूरा तकनीकी विवरण देखें",
      traceCtaHide: "तकनीकी विवरण छिपाएं",
      resetDemo: "दोबारा शुरू करें",
      earlierRecord: "पुराना रिकॉर्ड",
      laterOutcome: "नया परिणाम",
      superseded: "नए अपडेट द्वारा बदला गया",
      highConfidence: "मजबूत सबूत",
      mediumConfidence: "मध्यम विश्वास",
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
      },
      diagnostic: {
        eyebrow: "निदान एवं वर्गीकरण",
        rawObservationLabel: "देखा गया रिकॉर्ड:",
        recommendedStepLabel: "सुझाया गया कदम:",
        prerequisitesLabel: "ज़रूरी शर्तें:",
        escalationNoticeLabel: "शिकायत कब दर्ज करें:"
      },
      timing: {
        eyebrow: "समयरेखा व सेवा दिशानिर्देश",
        elapsedNotice: "दावा दर्ज होने के बाद बीते दिन:",
        benchmarkNotice: "नागरिक चार्टर मानक (सूचनात्मक):"
      },
      partition: {
        eyebrow: "दावा संदर्भ व रिकॉर्ड पृथक्करण",
        multiClaimNotice: "रिकॉर्ड्स में अलग-अलग दावों या फॉर्मों से संबंधित विवरण पाए गए।",
        unresolvedNotice: "कुछ रिकॉर्ड्स को निश्चित रूप से इस दावे से नहीं जोड़ा जा सका।"
      },
      attribution: {
        eyebrow: "भुगतान सत्यापन व जुड़ाव",
        attributedNotice: "प्राप्त भुगतान सत्यापित है और इस दावा संदर्भ से जुड़ा हुआ है।",
        unattributedNotice: "बैंक में राशि जमा हुई है, लेकिन इसे इस दावे से निश्चित रूप से नहीं जोड़ा जा सका।",
        candidateNotice: "जमा राशि और तारीख इस दावे से मेल खाती है, लेकिन दावे की सीधी पुष्टि लंबित है।",
        conflictedNotice: "भुगतान विवरण कई सक्रिय दावों से मेल खाते हैं या विरोधाभासी हैं।"
      },
      matrix: {
        eyebrow: "साक्ष्य सत्यापन मैट्रिक्स",
        title: "संरचित साक्ष्य सत्यापन",
        subtitle: "देखे गए रिकॉर्ड्स और ClaimClarity सत्यापन निष्कर्षों का विवरण।",
        colCheck: "जांच / विवरण",
        colSource: "स्रोत व तारीख",
        colObserved: "देखा गया साक्ष्य",
        colFinding: "ClaimClarity निष्कर्ष",
        colStatus: "स्थिति",
        statusVerified: "सत्यापित",
        statusSupported: "समर्थित",
        statusNeedsReview: "समीक्षा आवश्यक",
        statusUnclear: "अस्पष्ट",
        statusConflict: "विरोधाभासी",
        statusSuperseded: "अमान्य (बदला गया)",
        toggleShow: "संरचित सत्यापन मैट्रिक्स देखें",
        toggleHide: "सत्यापन मैट्रिक्स छिपाएं"
      },
      dossier: {
        eyebrow: "साक्ष्य एवं शिकायत सहायता डोजियर",
        title: "साक्ष्य डोजियर डाउनलोड करें",
        subtitle: "अपने रिकॉर्ड्स, सत्यापन निष्कर्षों, समयरेखा और मार्गदर्शन का एक व्यवस्थित पीडीएफ सारांश अपने व्यक्तिगत रिकॉर्ड या आधिकारिक फॉलो-अप के लिए डाउनलोड करें।",
        downloadBtn: "पीडीएफ डोजियर डाउनलोड करें",
        generatingBtn: "डोजियर तैयार हो रहा है...",
        disclaimerNotice: "स्वतंत्र साक्ष्य-संगठन सहायता। यह आधिकारिक ईपीएफओ / ईपीएफआईजीएमएस दस्तावेज नहीं है।"
      }
    },
    custom: {
      title: "अपने दावा रिकॉर्ड जोड़ें",
      pasteLabel: "दावे से जुड़ा संदेश या विवरण चिपकाएं",
      pastePlaceholder: "पोर्टल का स्टेटस, एसएमएस, पासबुक प्रविष्टि या बैंक संदेश यहां पेस्ट करें…",
      addPasted: "संदेश जोड़ें",
      uploadLabel: "फ़ाइल जोड़ें (PNG, JPG, PDF, TXT — अधिकतम 3 MB)",
      reconcileBtn: "मेरे रिकॉर्ड्स की जांच करें",
      emptyNotice: "जांच के लिए कम से कम एक दस्तावेज़ या रिकॉर्ड जोड़ें।"
    }
  }
};
