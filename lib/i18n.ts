export type Language = "en" | "hi";

export const translations = {
  en: {
    nav: {
      howItWorks: "How it works",
      trySample: "Try an example",
      independentPrototype: "Independent Claim Assistant",
      notOfficial: "Not affiliated with EPFO"
    },
    footer: {
      disclaimer: "ClaimClarity is an independent civic utility for claim verification. Not affiliated with or endorsed by EPFO. We do not access or modify government systems."
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
      backBtn: "← Back",
      CASE_A: {
        title: "1. Why do my records disagree?",
        subtitle: "Older trackers show Under Process, but a newer passbook record shows credit.",
        conflictPreview: "Portal → Processing · SMS → Processing · Passbook → ₹45,000 credited"
      },
      CASE_B: {
        title: "2. It says processing. Was I already paid?",
        subtitle: "Full chronological progression from initial submission to verified credit.",
        conflictPreview: "Submitted → Processing → Settled → ₹52,000 Credited"
      },
      CASE_C: {
        title: "3. Can you tell what happened?",
        subtitle: "Vague, undated notification with no claim ID or verifiable status.",
        conflictPreview: "SMS: 'Your request has been received.' (No date · No claim ID)"
      },
      CASE_CONFLICT: {
        title: "4. Two records give incompatible outcomes",
        subtitle: "Official record shows Rejection, but a subsequent record indicates Credit.",
        conflictPreview: "Tracker → Rejected · Bank → ₹30,000 Credited"
      },
      reconcileCta: "Check these records"
    },
    review: {
      header: "YOUR CLAIM RECORDS",
      subtext: "We'll compare these records. We won't add information that isn't present.",
      backBtn: "← Back to scenarios",
      viewFields: "View extracted details",
      hideFields: "Hide extracted details",
      reconcileBtn: "Check these records",
      undated: "Undated observation",
      unstated: "Unstated status"
    },
    loading: {
      eyebrow: "VERIFYING YOUR RECORDS",
      title: "Checking claim records",
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
      whyConfusingHeader: "WHY RECORDS LOOK CONFUSING:",
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
        whyHighlight: "Your records contain two incompatible terminal outcomes: one official record indicates rejection, while another subsequent record indicates credit.",
        whatWeKnow: "WHAT WE KNOW",
        whatWeKnowText: "A financial credit entry referencing this claim is recorded in the evidence.",
        whatWeCannotConfirm: "WHAT WE CANNOT CONFIRM",
        whatWeCannotConfirmText: "We cannot confirm whether that credit resolves the same claim as the official rejection notice without regional office verification.",
        action: "Verify the official claim outcome directly through official records before taking another action."
      },
      unknown: {
        headline: "We don't have enough information yet.",
        subtext: "We can see that your request was received, but we cannot determine whether it was processing, approved, rejected, settled or credited.",
        whatsMissing: "WHAT'S MISSING?",
        missingClaimId: "✓ Claim ID: No explicit claim number found",
        missingDate: "✓ Date: No verifiable timestamp on the notification",
        missingOutcome: "✓ Clear outcome: Message does not state whether claim was approved or rejected",
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
        conflictedNotice: "Payment details match multiple active claims or show conflicting references.",
        badgeVerified: "Verified Link",
        badgeCandidate: "Candidate Match",
        badgeConflicted: "Conflicted",
        badgeUnlinked: "Unlinked Payment",
        observed: "observed",
        creditObserved: "Credit entry observed"
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
        toggleHide: "Hide Verification Matrix",
        totalChecks: "Total Checks:",
        verifiedCount: "Verified / Supported:",
        conflictsCount: "Conflicts:",
        unresolvedCount: "Unresolved / Review:"
      },
      dossier: {
        eyebrow: "EVIDENCE & GRIEVANCE SUPPORT DOSSIER",
        title: "Evidence & Grievance Support Dossier",
        subtitle: "Download an organized PDF summary of your records, verification findings, timeline, and guidance for your personal records or official follow-up.",
        downloadBtn: "Download PDF Dossier",
        generatingBtn: "Preparing Dossier...",
        disclaimerNotice: "Independent evidence-organizing aid. Not an official EPFO / EPFiGMS submission."
      },
      traceChecks: {
        identity: "Identity verified ✓",
        chronology: "Chronological order ✓",
        outcome: "Outcome supported ✓",
        superseded: "Earlier record superseded ✓",
        conflictFlagged: "Incompatible outcomes flagged ⚠",
        noConflict: "No unresolved contradiction ✓"
      }
    },
    custom: {
      title: "Add your claim records",
      subtitleText: "Bring together multiple records to compare them.",
      privacyTip: "Please crop or blur unnecessary personal details such as Aadhaar or bank account numbers before uploading.",
      backBtn: "← Back",
      pasteLabel: "Paste claim text or message",
      pastePlaceholder: "Paste a tracker update, SMS notification, passbook entry, or bank message…",
      addPasted: "Add message record",
      uploadLabel: "Attach screenshot or document (PNG, JPG, PDF, TXT — max 3 MB)",
      addedRecordsLabel: "Added records:",
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
    footer: {
      disclaimer: "ClaimClarity दावा सत्यापन के लिए एक स्वतंत्र नागरिक सेवा है। ईपीएफओ से संबद्ध या समर्थित नहीं है। हम सरकारी प्रणालियों तक पहुँच या बदलाव नहीं करते हैं।"
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
      backBtn: "← पीछे जाएं",
      CASE_A: {
        title: "1. मेरे रिकॉर्ड्स में अलग-अलग स्थिति क्यों दिख रही है?",
        subtitle: "पुराने पोर्टल ट्रैकर में Under Process दिख रहा है, लेकिन नई पासबुक में जमा (Credit) दिख रहा है।",
        conflictPreview: "पोर्टल → प्रोसेसिंग · एसएमएस → प्रोसेसिंग · पासबुक → ₹45,000 जमा"
      },
      CASE_B: {
        title: "2. प्रोसेसिंग दिख रहा है, क्या पैसे मिल चुके हैं?",
        subtitle: "दावा सबमिट होने से लेकर बैंक में पैसे जमा होने तक की पूरी समयरेखा।",
        conflictPreview: "दर्ज हुआ → प्रोसेसिंग → पास (Settled) → ₹52,000 जमा हुआ"
      },
      CASE_C: {
        title: "3. क्या आप बता सकते हैं क्या हुआ?",
        subtitle: "बिना तारीख और बिना क्लेम आईडी का अस्पष्ट मैसेज।",
        conflictPreview: "एसएमएस: 'आपका अनुरोध प्राप्त हुआ।' (कोई तारीख नहीं · कोई क्लेम आईडी नहीं)"
      },
      CASE_CONFLICT: {
        title: "4. दो रिकॉर्ड्स में परस्पर विरोधी परिणाम हैं",
        subtitle: "आधिकारिक रिकॉर्ड निरस्त (Rejected) दिखाता है, लेकिन बाद का बैंक मैसेज जमा (Credit) दिखाता है।",
        conflictPreview: "पोर्टल → निरस्त · बैंक → ₹30,000 जमा"
      },
      reconcileCta: "इन रिकॉर्ड्स की जांच करें"
    },
    review: {
      header: "आपके दस्तावेज़ व रिकॉर्ड",
      subtext: "हम केवल मौजूद रिकॉर्ड्स की तुलना करेंगे। कोई भी बात अपनी ओर से नहीं जोड़ेंगे।",
      backBtn: "← उदाहरणों पर वापस जाएं",
      viewFields: "निकाले गए विवरण देखें",
      hideFields: "विवरण छिपाएं",
      reconcileBtn: "इन रिकॉर्ड्स की जांच करें",
      undated: "बिना तारीख का रिकॉर्ड",
      unstated: "अस्पष्ट स्थिति"
    },
    loading: {
      eyebrow: "रिकॉर्ड्स का सत्यापन हो रहा है",
      title: "दावा रिकॉर्ड्स की जांच जारी है",
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
      whyConfusingHeader: "रिकॉर्ड्स में अस्पष्टता के कारण:",
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
        whyHighlight: "आपके रिकॉर्ड्स में दो विरोधी परिणाम हैं: एक आधिकारिक रिकॉर्ड दावा निरस्त (Rejected) दिखाता है, जबकि बाद का रिकॉर्ड बैंक में राशि जमा (Credit) दिखाता है।",
        whatWeKnow: "हमें क्या पता चला",
        whatWeKnowText: "साक्ष्यों में इस दावे के संदर्भ वाला एक बैंक क्रेडिट प्रविष्टि दर्ज है।",
        whatWeCannotConfirm: "हम क्या पक्का नहीं कह सकते",
        whatWeCannotConfirmText: "हम बिना क्षेत्रीय कार्यालय सत्यापन के यह पक्का नहीं कह सकते कि बैंक क्रेडिट उसी दावे का है जो निरस्त हुआ था।",
        action: "कोई भी नया कदम उठाने से पहले आधिकारिक ईपीएफओ कार्यालय से दावे की सही स्थिति स्पष्ट करें।"
      },
      unknown: {
        headline: "अभी इतनी जानकारी नहीं है कि पक्का बताया जा सके।",
        subtext: "हम देख सकते हैं कि अनुरोध दर्ज हुआ था, लेकिन यह नहीं बताया जा सकता कि दावा पास हुआ, निरस्त हुआ या पैसे भेजे गए।",
        whatsMissing: "क्या जानकारी गायब है?",
        missingClaimId: "✓ दावा संख्या: कोई स्पष्ट दावा संख्या नहीं मिली",
        missingDate: "✓ तारीख: सूचना पर कोई सत्यापित तारीख नहीं है",
        missingOutcome: "✓ स्पष्ट परिणाम: संदेश में यह दर्ज नहीं है कि दावा मंजूर हुआ या खारिज",
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
        conflictedNotice: "भुगतान विवरण कई सक्रिय दावों से मेल खाते हैं या विरोधाभासी हैं।",
        badgeVerified: "सत्यापित जुड़ाव",
        badgeCandidate: "संभावित मिलान",
        badgeConflicted: "विरोधाभासी",
        badgeUnlinked: "असंबद्ध भुगतान",
        observed: "दर्ज किया गया",
        creditObserved: "बैंक जमा प्रविष्टि दर्ज"
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
        toggleHide: "सत्यापन मैट्रिक्स छिपाएं",
        totalChecks: "कुल जांच:",
        verifiedCount: "सत्यापित / समर्थित:",
        conflictsCount: "विरोधाभास:",
        unresolvedCount: "समीक्षा आवश्यक:"
      },
      dossier: {
        eyebrow: "साक्ष्य एवं शिकायत सहायता डोजियर",
        title: "साक्ष्य डोजियर डाउनलोड करें",
        subtitle: "अपने रिकॉर्ड्स, सत्यापन निष्कर्षों, समयरेखा और मार्गदर्शन का एक व्यवस्थित पीडीएफ सारांश अपने व्यक्तिगत रिकॉर्ड या आधिकारिक फॉलो-अप के लिए डाउनलोड करें।",
        downloadBtn: "पीडीएफ डोजियर डाउनलोड करें",
        generatingBtn: "डोजियर तैयार हो रहा है...",
        disclaimerNotice: "स्वतंत्र साक्ष्य-संगठन सहायता। यह आधिकारिक ईपीएफओ / ईपीएफआईजीएमएस दस्तावेज नहीं है।"
      },
      traceChecks: {
        identity: "पहचान सत्यापित ✓",
        chronology: "कालक्रम व्यवस्थित ✓",
        outcome: "परिणाम समर्थित ✓",
        superseded: "पुराना रिकॉर्ड अमान्य ✓",
        conflictFlagged: "विरोधाभासी परिणाम चिह्नित ⚠",
        noConflict: "कोई विरोधाभास नहीं ✓"
      }
    },
    custom: {
      title: "अपने दावा रिकॉर्ड जोड़ें",
      subtitleText: "तुलना करने के लिए कई रिकॉर्ड्स को एक साथ जोड़ें।",
      privacyTip: "अपलोड करने से पहले कृपया आधार या बैंक खाता संख्या जैसे अनावश्यक व्यक्तिगत विवरणों को छिपाएं या धुंधला करें।",
      backBtn: "← पीछे जाएं",
      pasteLabel: "दावे से जुड़ा संदेश या विवरण चिपकाएं",
      pastePlaceholder: "पोर्टल का स्टेटस, एसएमएस, पासबुक प्रविष्टि या बैंक संदेश यहां पेस्ट करें…",
      addPasted: "संदेश जोड़ें",
      uploadLabel: "फ़ाइल जोड़ें (PNG, JPG, PDF, TXT — अधिकतम 3 MB)",
      addedRecordsLabel: "जोड़े गए रिकॉर्ड:",
      reconcileBtn: "मेरे रिकॉर्ड्स की जांच करें",
      emptyNotice: "जांच के लिए कम से कम एक दस्तावेज़ या रिकॉर्ड जोड़ें।"
    }
  }
};

/**
 * Translates dynamic engine text strings to Hindi when lang === "hi".
 */
export function translateEngineText(text: string | null | undefined, lang: Language): string {
  if (!text) return "";
  if (lang !== "hi") return text;

  // Direct mapping dictionary for deterministic engine output strings
  const map: Array<[RegExp, string]> = [
    [/A newer record shows bank credit.*received.*Earlier records still showing Under Process.*are superseded/i, "एक नया रिकॉर्ड बैंक में राशि प्राप्त होने की पुष्टि करता है। पुराने Under Process या Submitted रिकॉर्ड अमान्य हो गए हैं।"],
    [/Verify the credit received in your bank passbook or statement; no duplicate claim or follow-up is needed/i, "अपनी बैंक पासबुक या खाते में राशि जमा होने की पुष्टि करें; दोबारा क्लेम करने या फॉलो-अप की आवश्यकता नहीं है।"],
    [/Do not submit another claim just because an older tracker or SMS still shows Under Process/i, "केवल इसलिए नया क्लेम न करें क्योंकि कोई पुराना मैसेज या स्टेटस Under Process दिखा रहा है।"],
    [/Official records confirm this claim was settled.*Processing has finished/i, "आधिकारिक रिकॉर्ड पुष्टि करते हैं कि यह दावा पास (Settled) हो चुका है। प्रक्रिया पूरी हो गई है।"],
    [/Check your bank account for disbursement credit within 2 to 3 working days/i, "2 से 3 कार्य दिवसों के भीतर अपने बैंक खाते में राशि जमा होने की जांच करें।"],
    [/Do not file a duplicate claim; the supplied evidence already confirms official settlement/i, "दोबारा क्लेम न करें; प्रस्तुत साक्ष्य आधिकारिक रूप से दावे के पास होने की पुष्टि करते हैं।"],
    [/Official records indicate this claim was rejected by the field office/i, "आधिकारिक रिकॉर्ड से पता चलता है कि क्षेत्रीय कार्यालय द्वारा यह दावा निरस्त (Rejected) कर दिया गया था।"],
    [/Review the rejection reason in your official EPFO portal before taking any corrective step/i, "कोई भी सुधारात्मक कदम उठाने से पहले आधिकारिक पोर्टल पर निरस्त होने का कारण देखें।"],
    [/Do not submit an identical claim without rectifying the stated rejection reason/i, "बताए गए कारण को सुधारे बिना दोबारा वही क्लेम सबमिट न करें।"],
    [/Based on the evidence provided, processing has started/i, "दिए गए साक्ष्यों के आधार पर दावे की जांच की प्रक्रिया शुरू हो चुकी है।"],
    [/Allow processing to complete before expecting disbursement credit/i, "राशि जमा होने की अपेक्षा करने से पहले प्रक्रिया पूरी होने का समय दें।"],
    [/Do not submit duplicate claims while processing is in progress/i, "जब तक प्रक्रिया चल रही है, दोबारा क्लेम न करें।"],
    [/Your claim has been submitted and registered at the portal/i, "आपका दावा दर्ज हो चुका है और पोर्टल पर पंजीकृत है।"],
    [/Wait for processing to begin at the field office/i, "क्षेत्रीय कार्यालय में जांच प्रक्रिया शुरू होने की प्रतीक्षा करें।"],
    [/Do not submit another claim form while your initial submission is pending/i, "जब तक पिछला क्लेम लंबित है, दूसरा फॉर्म सबमिट न करें।"],
    [/Refused to declare final state because supplied evidence contains mutually incompatible terminal outcomes/i, "अंतिम स्थिति बताने से इंकार किया गया क्योंकि प्रस्तुत साक्ष्यों में परस्पर विरोधी परिणाम मौजूद हैं।"],
    [/Your supplied records contain two incompatible outcomes/i, "आपके दिए गए रिकॉर्ड्स में दो विरोधी परिणाम हैं। हम पक्का नहीं कह सकते कि बैंक क्रेडिट उसी दावे का है या नहीं।"],
    [/Verify the official claim outcome directly through your EPFO regional office/i, "कोई भी नया कदम उठाने से पहले ईपीएफओ क्षेत्रीय कार्यालय या शिकायत पोर्टल से सही स्थिति स्पष्ट करें।"],
    [/Do not submit another claim or assume payment until the rejection and credit records are officially clarified/i, "जब तक स्थिति स्पष्ट न हो, दोबारा क्लेम न करें और न ही राशि प्राप्त मानें।"],
    [/A bank credit was received, but the records provide insufficient proof linking it to an active EPFO claim/i, "बैंक में राशि जमा हुई है, लेकिन इसे किसी सक्रिय ईपीएफओ दावे से जोड़ने के पर्याप्त सबूत नहीं हैं।"],
    [/Verify your EPFO passbook or bank statement narration for explicit claim reference details/i, "स्पष्ट दावा संदर्भ की जांच के लिए अपनी पासबुक या बैंक विवरण देखें।"],
    [/Do not assume payment corresponds to a pending claim without reference confirmation/i, "बिना संदर्भ पुष्टि के यह न मानें कि प्राप्त राशि लंबित दावे की ही है।"],
    [/Bank credit record.*provides explicit financial proof of disbursement, superseding earlier in-flight records/i, "बैंक क्रेडिट रिकॉर्ड राशि जमा होने का स्पष्ट वित्तीय प्रमाण प्रदान करता है, जो पुराने रिकॉर्ड्स को अमान्य बनाता है।"],
    [/Official settlement record.*establishes terminal lifecycle completion/i, "आधिकारिक पास (Settled) रिकॉर्ड दावे की प्रक्रिया पूरी होने की पुष्टि करता है।"],
    [/Official rejection notice.*is the definitive terminal outcome/i, "आधिकारिक निरस्त (Rejected) नोटिस ही अंतिम परिणाम है।"],
    [/A newer record shows bank credit received\. Earlier records showing Under Process.*are superseded/i, "नया रिकॉर्ड बैंक क्रेडिट की पुष्टि करता है। पुराने Under Process रिकॉर्ड अमान्य माने जाएंगे।"],
    [/Official tracker record confirms settlement, superseding earlier processing notices/i, "आधिकारिक पोर्टल रिकॉर्ड दावे के पास होने की पुष्टि करता है, जो पुराने मैसेज से अधिक मान्य है।"]
  ];

  for (const [pattern, translation] of map) {
    if (pattern.test(text)) {
      return translation;
    }
  }

  return text;
}
