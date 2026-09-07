import type { Artifact, Source } from "@/lib/schemas";

/**
 * CURATED REJECTION & PROBLEM TAXONOMY
 * 
 * Bounded diagnostic taxonomy of 12 meaningful clusters + safe fallback.
 * Internal ClaimClarity classification - NOT official EPFO internal system codes.
 */
export const REJECTION_CATEGORIES = [
  "REJ_KYC_IDENTITY_MISMATCH",
  "REJ_BANK_ACCOUNT_MISMATCH",
  "REJ_SERVICE_ELIGIBILITY",
  "REJ_DUPLICATE_CLAIM",
  "REJ_MEMBER_SIGNATURE_DOCS",
  "REJ_CONTRIBUTION_WAGE_DISCREPANCY",
  "REJ_ESTABLISHMENT_CLOSED_UNATTACHED",
  "REJ_FORM_PURPOSE_INELIGIBLE",
  "REJ_FATHER_SPOUSE_NAME_MISMATCH",
  "REJ_TRANSFER_ANNEXURE_K",
  "REJ_TECHNICAL_SYSTEM_ERROR",
  "REJ_UNSPECIFIED"
] as const;

export type RejectionCategory = typeof REJECTION_CATEGORIES[number];

export type RejectionCertainty = "exact" | "supported" | "probable" | "unspecified";

export type ResolutionStage = "INFORM" | "PREVENT_PROTECT" | "REMEDIATE" | "ESCALATE";

export interface RejectionDiagnostic {
  category: RejectionCategory;
  rawText: string;
  sourceArtifactId: string;
  sourceType: Source;
  channelDetail: string | null;
  certainty: RejectionCertainty;
  matchingRuleId: string;
  matchedKeywords: string[];
  diagnosticTitle: { en: string; hi: string };
  interpretation: { en: string; hi: string };
  resolutionGuidance: {
    stage: ResolutionStage;
    prerequisites: string[];
    action: { en: string; hi: string };
    doNotDo: { en: string; hi: string } | null;
    escalationCondition: { en: string; hi: string } | null;
  };
}

interface TaxonomyRule {
  category: RejectionCategory;
  ruleId: string;
  patterns: { regex: RegExp; label: string; exact?: boolean }[];
  title: { en: string; hi: string };
  interpretation: { en: string; hi: string };
  stage: ResolutionStage;
  prerequisites: string[];
  action: { en: string; hi: string };
  doNotDo: { en: string; hi: string } | null;
  escalationCondition: { en: string; hi: string } | null;
}

const TAXONOMY_RULES: TaxonomyRule[] = [
  {
    category: "REJ_BANK_ACCOUNT_MISMATCH",
    ruleId: "RULE_REJ_BANK_01",
    patterns: [
      { regex: /bank\s*(account|ac|no|number|details?)\s*mismatch/i, label: "bank account mismatch", exact: true },
      { regex: /ifsc(\s*code)?\s*(mismatch|invalid|incorrect)/i, label: "IFSC mismatch", exact: true },
      { regex: /name\s*(mismatch|differ(s)?)\s*in\s*bank/i, label: "name mismatch in bank", exact: true },
      { regex: /(cancelled|canceled)\s*cheque\s*(not\s*clear|missing|invalid|illegible)/i, label: "cancelled cheque issue", exact: true },
      { regex: /passbook\s*(copy|page|image)\s*(not\s*clear|attestation\s*missing)/i, label: "passbook copy issue", exact: true },
      { regex: /bank\s*kyc|account\s*not\s*active|inactive\s*bank/i, label: "bank KYC issue" }
    ],
    title: {
      en: "Bank Account / KYC Discrepancy",
      hi: "बैंक खाता / केवाईसी विसंगति"
    },
    interpretation: {
      en: "Your records indicate that the claim could not be processed due to a mismatch in bank account details, IFSC code, or an unclear cheque/passbook copy.",
      hi: "आपके रिकॉर्ड्स दर्शाते हैं कि बैंक खाता संख्या, आईएफएससी कोड में विसंगति या चेक/पासबुक की अस्पष्ट प्रति के कारण दावा खारिज हुआ।"
    },
    stage: "REMEDIATE",
    prerequisites: [
      "Active bank account matching UAN name exactly",
      "Valid IFSC code of current operational branch",
      "Clear image of cancelled cheque showing name & account number"
    ],
    action: {
      en: "Verify and update your bank KYC details in the Unified Member Portal under Manage > KYC. Once approved by your employer/bank, submit a fresh claim.",
      hi: "यूनिफाइड मेंबर पोर्टल में Manage > KYC के तहत अपने बैंक विवरण की पुष्टि और सुधार करें। नियोक्ता/बैंक द्वारा सत्यापन के बाद नया दावा दर्ज करें।"
    },
    doNotDo: {
      en: "Do not re-apply immediately with the same unverified bank account details.",
      hi: "बिना बैंक विवरण सुधारे तुरंत दोबारा उसी खाते के साथ आवेदन न करें।"
    },
    escalationCondition: {
      en: "If your updated bank KYC remains unapproved by the bank/employer after 15 business days, raise a grievance via EPFiGMS.",
      hi: "यदि बैंक/नियोक्ता द्वारा 15 कार्यदिवसों के बाद भी बैंक केवाईसी स्वीकृत नहीं होती है, तो EPFiGMS पर शिकायत दर्ज करें।"
    }
  },
  {
    category: "REJ_FATHER_SPOUSE_NAME_MISMATCH",
    ruleId: "RULE_REJ_FATHER_01",
    patterns: [
      { regex: /father('?s)?\s*name\s*(mismatch|differ(s)?|incorrect)/i, label: "father's name mismatch", exact: true },
      { regex: /(husband|spouse)('?s)?\s*name\s*(mismatch|differ(s)?)/i, label: "spouse name mismatch", exact: true },
      { regex: /father\s*name\s*not\s*matching/i, label: "father name not matching", exact: true }
    ],
    title: {
      en: "Father / Spouse Name Mismatch",
      hi: "पिता या पति/पत्नी के नाम में विसंगति"
    },
    interpretation: {
      en: "Your records suggest a difference in the father's or spouse's name between your EPFO member profile and identity documents.",
      hi: "आपके रिकॉर्ड्स दर्शाते हैं कि ईपीएफओ प्रोफाइल और पहचान प्रमाण के बीच पिता या पति/पत्नी के नाम में भिन्नता है।"
    },
    stage: "REMEDIATE",
    prerequisites: [
      "Aadhaar or Government ID with correct parent/spouse name",
      "Joint Declaration Form signed by member and employer"
    ],
    action: {
      en: "Submit an online Joint Declaration request via the Member Portal (Manage > Joint Declaration) or provide the physical Joint Declaration endorsed by your employer to the regional EPFO office.",
      hi: "मेंबर पोर्टल (Manage > Joint Declaration) पर ऑनलाइन सुधार अनुरोध दर्ज करें या नियोक्ता द्वारा सत्यापित संयुक्त घोषणा पत्र क्षेत्रीय कार्यालय में जमा करें।"
    },
    doNotDo: {
      en: "Do not submit duplicate claims before the member profile details are corrected.",
      hi: "प्रोफाइल में सुधार होने से पहले दोबारा दावा दर्ज न करें।"
    },
    escalationCondition: {
      en: "If Joint Declaration correction is delayed beyond 30 days, file an official grievance referencing your Joint Declaration tracking ID.",
      hi: "यदि संयुक्त घोषणा पत्र सुधार 30 दिनों से अधिक लंबित रहे, तो ट्रैकिंग संख्या के साथ EPFiGMS पर शिकायत दर्ज करें।"
    }
  },
  {
    category: "REJ_KYC_IDENTITY_MISMATCH",
    ruleId: "RULE_REJ_KYC_01",
    patterns: [
      { regex: /(?<!father'?s?\s*|spouse\s*|husband'?s?\s*|bank\s*)name\s*mismatch/i, label: "name mismatch", exact: true },
      { regex: /dob\s*mismatch|date\s*of\s*birth\s*(mismatch|differ)/i, label: "date of birth mismatch", exact: true },
      { regex: /aadhaar\s*(not\s*seeded|mismatch|not\s*verified|not\s*linked)/i, label: "Aadhaar verification issue", exact: true },
      { regex: /pan\s*(not\s*seeded|mismatch|invalid)/i, label: "PAN issue", exact: true },
      { regex: /kyc\s*(incomplete|pending|rejected|not\s*approved)/i, label: "incomplete KYC" }
    ],
    title: {
      en: "Identity / Profile Information Mismatch",
      hi: "पहचान व व्यक्तिगत विवरण विसंगति"
    },
    interpretation: {
      en: "Your records point to a discrepancy in name, date of birth, or Aadhaar/PAN validation between EPFO records and identity records.",
      hi: "रिकॉर्ड्स के अनुसार ईपीएफओ प्रोफाइल और आधार/पैन दस्तावेजों के नाम, जन्मतिथि या पहचान विवरण में अंतर है।"
    },
    stage: "REMEDIATE",
    prerequisites: [
      "Aadhaar card with exact name and date of birth",
      "Active mobile linked to Aadhaar for OTP verification"
    ],
    action: {
      en: "Update your basic details in the Member Portal under Manage > Modify Basic Details and get Aadhaar re-verified.",
      hi: "मेंबर पोर्टल में Manage > Modify Basic Details पर जाकर आधार अनुसार अपना नाम व जन्मतिथि सुधारें।"
    },
    doNotDo: {
      en: "Do not apply again until name and DOB in Aadhaar match your EPFO UAN profile exactly.",
      hi: "जब तक आधार और ईपीएफओ प्रोफाइल एक समान न हो जाएं, दोबारा दावा न करें।"
    },
    escalationCondition: null
  },
  {
    category: "REJ_MEMBER_SIGNATURE_DOCS",
    ruleId: "RULE_REJ_SIG_01",
    patterns: [
      { regex: /signature\s*(mismatch|differ(s)?|not\s*matching|unclear|illegible|missing)/i, label: "signature mismatch", exact: true },
      { regex: /unsigned\s*(form|document|claim)/i, label: "unsigned form", exact: true },
      { regex: /employer\s*(signature|seal|attestation)\s*missing/i, label: "employer attestation missing", exact: true },
      { regex: /form\s*(19|10c|31)\s*(not\s*signed|invalid)/i, label: "form not signed", exact: true },
      { regex: /document(s)?\s*(unclear|illegible|not\s*readable)/i, label: "unclear documents" }
    ],
    title: {
      en: "Signature or Document Verification Issue",
      hi: "हस्ताक्षर या दस्तावेज सत्यापन समस्या"
    },
    interpretation: {
      en: "The record indicates that the submitted physical form or uploaded documents lacked required member/employer signatures or were not clearly legible.",
      hi: "प्रस्तुत फॉर्म या अपलोड किए गए दस्तावेजों में हस्ताक्षर का मिलान न होने या दस्तावेज स्पष्ट न होने के कारण दावा अस्वीकृत हुआ।"
    },
    stage: "PREVENT_PROTECT",
    prerequisites: [
      "Properly signed Form/Joint Declaration",
      "High-contrast, legible scan of supporting certificates"
    ],
    action: {
      en: "Ensure all uploaded scans are high-resolution and match registered signatures before re-uploading.",
      hi: "सुनिश्चित करें कि सभी अपलोड किए गए दस्तावेज स्पष्ट हैं और हस्ताक्षर प्रमाणित हैं।"
    },
    doNotDo: {
      en: "Do not upload blurry or cropped photos of document corners.",
      hi: "धुंधली या कटे हुए किनारों वाली तस्वीरें अपलोड न करें।"
    },
    escalationCondition: null
  },
  {
    category: "REJ_SERVICE_ELIGIBILITY",
    ruleId: "RULE_REJ_SERVICE_01",
    patterns: [
      { regex: /service\s*(less\s*than|insufficient|period\s*issue)/i, label: "service period issue", exact: true },
      { regex: /(doe|date\s*of\s*exit)\s*(missing|not\s*updated|invalid)/i, label: "date of exit missing", exact: true },
      { regex: /ncp\s*days|non\s*contributory\s*period/i, label: "NCP days issue" },
      { regex: /service\s*overlap|concurrent\s*service/i, label: "concurrent service overlap", exact: true },
      { regex: /service\s*not\s*eligible/i, label: "service not eligible" }
    ],
    title: {
      en: "Service Eligibility or Date of Exit Missing",
      hi: "सेवा अवधि या नौकरी छोड़ने की तारीख (DOE) की समस्या"
    },
    interpretation: {
      en: "The rejection text references service length criteria, missing Date of Exit (DOE), or service overlap between establishments.",
      hi: "रिकॉर्ड्स के अनुसार सेवा की न्यूनतम अवधि पूरी न होने या नौकरी छोड़ने की तारीख (DOE) दर्ज न होने के कारण दावा रुका है।"
    },
    stage: "REMEDIATE",
    prerequisites: [
      "Date of Exit updated by employer or member via portal",
      "Scheme Certificate / Service records updated across all member IDs"
    ],
    action: {
      en: "Check your Service History in the Member Portal. If Date of Exit is missing, mark your Date of Exit under Manage > Mark Exit (if 2 months have passed since leaving).",
      hi: "पोर्टल में Service History जांचें। यदि Date of Exit दर्ज नहीं है, तो Manage > Mark Exit में जाकर तारीख दर्ज करें।"
    },
    doNotDo: {
      en: "Do not file final settlement Form 19/10C while Date of Exit is blank.",
      hi: "बिना Date of Exit दर्ज किए Form 19/10C का अंतिम दावा न भरें।"
    },
    escalationCondition: {
      en: "If the former employer refuses to verify Date of Exit or service records, file a grievance on EPFiGMS with relieving letters attached.",
      hi: "यदि पूर्व नियोक्ता नौकरी छोड़ने की तारीख सत्यापित नहीं करता है, तो कार्यमुक्ति पत्र के साथ EPFiGMS पर शिकायत करें।"
    }
  },
  {
    category: "REJ_DUPLICATE_CLAIM",
    ruleId: "RULE_REJ_DUP_01",
    patterns: [
      { regex: /duplicate\s*claim/i, label: "duplicate claim", exact: true },
      { regex: /claim\s*already\s*(settled|processed|registered|in\s*process)/i, label: "claim already processed", exact: true },
      { regex: /previous\s*claim\s*(pending|exists|settled)/i, label: "previous claim exists", exact: true }
    ],
    title: {
      en: "Duplicate or Concurrent Claim Detected",
      hi: "दोहरा या पहले से दर्ज दावा"
    },
    interpretation: {
      en: "The records indicate an existing or previously settled claim was already active for this form type and member account.",
      hi: "रिकॉर्ड्स दर्शाते हैं कि इस दावे या फॉर्म के लिए पहले से कोई अनुरोध प्रक्रियाधीन या पास हो चुका है।"
    },
    stage: "INFORM",
    prerequisites: ["Verification of earlier claim settlement status"],
    action: {
      en: "Check your passbook ledger and prior claim history to verify whether a previous withdrawal for the same purpose was already settled.",
      hi: "अपनी पासबुक और पिछले क्लेम इतिहास में जांचें कि क्या इसी उद्देश्य का पूर्व दावा पहले ही पास हो चुका है।"
    },
    doNotDo: {
      en: "Do not submit parallel claims for the same purpose while one is being processed.",
      hi: "एक दावा प्रक्रिया में होने पर उसी प्रकार का दूसरा समानांतर दावा न लगाएं।"
    },
    escalationCondition: null
  },
  {
    category: "REJ_FORM_PURPOSE_INELIGIBLE",
    ruleId: "RULE_REJ_FORM_01",
    patterns: [
      { regex: /ineligible\s*for\s*advance/i, label: "ineligible for advance", exact: true },
      { regex: /wrong\s*form\s*type|invalid\s*form/i, label: "wrong form type", exact: true },
      { regex: /not\s*eligible\s*under\s*para/i, label: "ineligible under para", exact: true },
      { regex: /(marriage|construction|illness|education)\s*advance\s*condition\s*not\s*met/i, label: "advance criteria not met", exact: true },
      { regex: /continuous\s*service\s*criteria/i, label: "continuous service criteria" }
    ],
    title: {
      en: "Claim Purpose or Form Rule Ineligibility",
      hi: "दावे का प्रकार या अग्रिम नियम अपात्रता"
    },
    interpretation: {
      en: "The rejection mentions that the specific advance reason or form category selected does not satisfy the eligibility rules under the relevant EPF scheme paragraph.",
      hi: "चयनित अग्रिम (Advance) नियम या फॉर्म प्रकार ईपीएफ नियमों के तहत पात्रता शर्तों को पूरा नहीं करता।"
    },
    stage: "INFORM",
    prerequisites: ["Review of EPF advance rules for the selected purpose"],
    action: {
      en: "Review the service requirements for the chosen advance reason (e.g., Illness, Marriage, Construction) before applying with the appropriate category.",
      hi: "आवेदन करने से पहले चुने गए अग्रिम कारण (जैसे बीमारी, विवाह, गृह निर्माण) की सेवा शर्तों की जांच करें।"
    },
    doNotDo: {
      en: "Do not re-apply under the same ineligible advance paragraph without fulfilling service duration.",
      hi: "न्यूनतम सेवा अवधि पूरी किए बिना उसी नियम के तहत दोबारा आवेदन न करें।"
    },
    escalationCondition: null
  },
  {
    category: "REJ_TRANSFER_ANNEXURE_K",
    ruleId: "RULE_REJ_TRANS_01",
    patterns: [
      { regex: /annexure\s*k/i, label: "Annexure-K", exact: true },
      { regex: /transfer\s*(not\s*complete|pending|unconfirmed)/i, label: "transfer incomplete", exact: true },
      { regex: /previous\s*account\s*balance\s*not\s*transferred/i, label: "balance not transferred" }
    ],
    title: {
      en: "Transfer Pending / Annexure-K Required",
      hi: "स्थानांतरण लंबित / एनेक्सचर-के की आवश्यकता"
    },
    interpretation: {
      en: "Your records show that a transfer of past PF accumulation between regional field offices is pending confirmation via Annexure-K.",
      hi: "रिकॉर्ड्स दर्शाते हैं कि पिछले संस्थान से पीएफ राशि का स्थानांतरण एनेक्सचर-के सत्यापन के अभाव में अधूरा है।"
    },
    stage: "REMEDIATE",
    prerequisites: ["Online Transfer Claim (Form 13) status"],
    action: {
      en: "Track your transfer claim in the Member Portal under View > Track Claim Status to ensure your previous member ID accumulation has merged.",
      hi: "मेंबर पोर्टल में View > Track Claim Status पर जाकर ट्रांसफर दावे की स्थिति जांचें ताकि पुराना पीएफ वर्तमान खाते में जुड़ सके।"
    },
    doNotDo: {
      en: "Do not attempt full final withdrawal before prior account transfers are fully credited.",
      hi: "पुराने खातों का पैसा जुड़े बिना अंतिम निकासी का प्रयास न करें।"
    },
    escalationCondition: null
  },
  {
    category: "REJ_ESTABLISHMENT_CLOSED_UNATTACHED",
    ruleId: "RULE_REJ_EST_01",
    patterns: [
      { regex: /establishment\s*closed/i, label: "establishment closed", exact: true },
      { regex: /unattached|un-exempted\s*trust|exempted\s*trust/i, label: "trust / establishment issue" },
      { regex: /closed\s*(unit|company|employer)/i, label: "closed company" }
    ],
    title: {
      en: "Closed Establishment / Trust Issue",
      hi: "संस्थान बंद होने या ट्रस्ट संबंधी समस्या"
    },
    interpretation: {
      en: "The claim indicates complications related to a closed establishment or an un-exempted/exempted private trust.",
      hi: "रिकॉर्ड्स दर्शाते हैं कि पूर्व संस्थान बंद होने या निजी ट्रस्ट संबंधी कारणों से दावा लंबित है।"
    },
    stage: "ESCALATE",
    prerequisites: ["Bank attestation and verification by authorized bank manager / EPFO officer"],
    action: {
      en: "For closed establishments, submit a physically attested claim form counter-signed by an authorized bank manager to the EPFO regional office.",
      hi: "कंपनी बंद होने की स्थिति में अधिकृत बैंक प्रबंधक द्वारा सत्यापित भौतिक फॉर्म क्षेत्रीय ईपीएफओ कार्यालय में जमा करें।"
    },
    doNotDo: {
      en: "Do not wait for online employer approval if the establishment is officially shut down.",
      hi: "यदि कंपनी आधिकारिक रूप से बंद है, तो ऑनलाइन नियोक्ता स्वीकृति की प्रतीक्षा न करें।"
    },
    escalationCondition: {
      en: "Raise an official EPFiGMS grievance with bank attestation proof attached.",
      hi: "बैंक सत्यापन प्रमाण के साथ EPFiGMS पर सीधे शिकायत दर्ज करें।"
    }
  },
  {
    category: "REJ_CONTRIBUTION_WAGE_DISCREPANCY",
    ruleId: "RULE_REJ_CONTRIB_01",
    patterns: [
      { regex: /wage\s*ceiling/i, label: "wage ceiling discrepancy", exact: true },
      { regex: /missing\s*contribution|contribution\s*not\s*received/i, label: "missing contribution", exact: true },
      { regex: /remittance\s*pending|employer\s*share\s*pending/i, label: "remittance pending" }
    ],
    title: {
      en: "Contribution or Wage Discrepancy",
      hi: "अंशदान या वेतन विसंगति"
    },
    interpretation: {
      en: "The rejection mentions discrepancies in monthly contributions deposited by the employer or wage ceiling limits.",
      hi: "रिकॉर्ड्स के अनुसार नियोक्ता द्वारा जमा किए गए मासिक अंशदान या वेतन सीमा में विसंगति पाई गई है।"
    },
    stage: "REMEDIATE",
    prerequisites: ["Salary slips and Form 3A/passbook statement from employer"],
    action: {
      en: "Contact your employer's payroll team to reconcile missing monthly remittances with the EPFO field office.",
      hi: "नियोक्ता के वेतन विभाग से संपर्क करें ताकि छूटे हुए मासिक अंशदान को ईपीएफओ कार्यालय में जमा कराया जा सके।"
    },
    doNotDo: {
      en: "Do not resubmit claims until the employer rectifies missing contribution records.",
      hi: "जब तक नियोक्ता छूटा हुआ अंशदान जमा न करे, दोबारा दावा न करें।"
    },
    escalationCondition: {
      en: "If the employer fails to deposit deducted contributions, lodge a formal non-remittance grievance on EPFiGMS.",
      hi: "यदि नियोक्ता काटा गया अंशदान जमा नहीं करता है, तो EPFiGMS पर गैर-जमा संबंधी शिकायत दर्ज करें।"
    }
  },
  {
    category: "REJ_TECHNICAL_SYSTEM_ERROR",
    ruleId: "RULE_REJ_TECH_01",
    patterns: [
      { regex: /technical\s*(error|failure|glitch)/i, label: "technical error", exact: true },
      { regex: /system\s*(error|timeout|failure)/i, label: "system error", exact: true },
      { regex: /batch\s*(processing\s*)?failure/i, label: "batch processing failure", exact: true },
      { regex: /server\s*error|internal\s*error/i, label: "server error" }
    ],
    title: {
      en: "System or Processing Error",
      hi: "सिस्टम या तकनीकी त्रुटि"
    },
    interpretation: {
      en: "The record references an intermittent portal or batch processing technical failure rather than a member document fault.",
      hi: "रिकॉर्ड्स दर्शाते हैं कि यह किसी दस्तावेज की कमी नहीं बल्कि पोर्टल या बैच प्रोसेसिंग की अस्थायी तकनीकी त्रुटि है।"
    },
    stage: "INFORM",
    prerequisites: ["Wait 24-48 hours before retry"],
    action: {
      en: "Wait 24 to 48 hours for the system cache to clear, then verify your claim status in the portal before re-submitting.",
      hi: "24 से 48 घंटे प्रतीक्षा करें और पोर्टल में स्थिति जांचने के बाद पुनः प्रयास करें।"
    },
    doNotDo: {
      en: "Do not modify working bank or KYC details in response to a temporary server glitch.",
      hi: "अस्थायी सर्वर खराबी के कारण सही बैंक या केवाईसी विवरण में अनावश्यक बदलाव न करें।"
    },
    escalationCondition: null
  }
];

/**
 * Fallback diagnostic for unclassified or missing rejection reasons.
 */
function createUnspecifiedDiagnostic(
  rawText: string,
  sourceArtifactId: string,
  sourceType: Source,
  channelDetail: string | null
): RejectionDiagnostic {
  return {
    category: "REJ_UNSPECIFIED",
    rawText,
    sourceArtifactId,
    sourceType,
    channelDetail,
    certainty: "unspecified",
    matchingRuleId: "RULE_REJ_FALLBACK_UNSPECIFIED",
    matchedKeywords: [],
    diagnosticTitle: {
      en: "Unspecified Rejection Reason",
      hi: "अनिर्दिष्ट अस्वीकृति कारण"
    },
    interpretation: {
      en: "The record indicates that the claim was rejected or returned, but the provided text does not contain a standard specific rejection code or reason.",
      hi: "रिकॉर्ड दर्शाता है कि दावा अस्वीकृत हुआ है, लेकिन उपलब्ध विवरण में स्पष्ट कारण निर्दिष्ट नहीं है।"
    },
    resolutionGuidance: {
      stage: "INFORM",
      prerequisites: ["Detailed rejection letter or portal rejection remarks"],
      action: {
        en: "Check the Unified Portal under View > Track Claim Status for detailed remarks, or download the formal rejection notice letter.",
        hi: "विस्तृत टिप्पणी देखने के लिए मेंबर पोर्टल में View > Track Claim Status देखें या औपचारिक अस्वीकृति पत्र डाउनलोड करें।"
      },
      doNotDo: {
        en: "Do not guess the rejection reason or alter profile details randomly.",
        hi: "बिना स्पष्ट कारण जाने प्रोफाइल विवरण में कोई मनमाना बदलाव न करें।"
      },
      escalationCondition: {
        en: "If no rejection remarks are provided after 7 business days, request clarification via EPFiGMS.",
        hi: "यदि 7 कार्यदिवसों के बाद भी कारण उपलब्ध न हो, तो EPFiGMS पर स्पष्टीकरण का अनुरोध करें।"
      }
    }
  };
}

/**
 * Deterministically analyzes rejection evidence text against the curated 12-category taxonomy.
 * Preserves raw text, provenance, matching rule, and uncertainty.
 * Resistant to false positives and resolves competing matches by specificity.
 */
export function classifyRejectionEvidence(
  artifact: Artifact
): RejectionDiagnostic | null {
  const combinedText = `${artifact.status || ""} ${artifact.text || ""}`.trim();
  if (!combinedText) return null;

  // 1. Check for purely positive / neutral phrases that should not trigger false rejections
  const isPurelyPositive =
    /(?:no\s+mismatch|without\s+error|verified\s+successfully|no\s+error\s+found|successfully\s+credited)/i.test(
      combinedText
    ) && !/(?:reject|denied|not\s+approved|returned|failed)/i.test(combinedText);

  if (isPurelyPositive) return null;

  // 2. Check if text contains an active rejection or discrepancy signal
  const isRejectionSignal =
    /(?:reject|denied|not\s+approved|returned|cancelled|failed|discrepancy|mismatch)/i.test(combinedText);
  if (!isRejectionSignal) return null;

  // 3. Score all matching candidate rules across the entire text
  interface CandidateMatch {
    rule: TaxonomyRule;
    exactCount: number;
    supportedCount: number;
    totalMatches: number;
    maxPatternLength: number;
    matchedKeywords: string[];
    isCausal: boolean;
  }

  const candidates: CandidateMatch[] = [];

  // Identify if a causal reason clause exists (e.g. "rejected because...", "reason: ...", "due to...")
  const causalClauseMatch = /(?:because|due\s+to|reason\s*:|remarks\s*:|cause\s*:)\s*([^.;,\n]+)/i.exec(combinedText);
  const causalText = causalClauseMatch ? causalClauseMatch[1] : "";

  for (const rule of TAXONOMY_RULES) {
    const matchedKeywords: string[] = [];
    let exactCount = 0;
    let supportedCount = 0;
    let maxPatternLength = 0;
    let isCausal = false;

    for (const p of rule.patterns) {
      const match = p.regex.exec(combinedText);
      if (match) {
        matchedKeywords.push(p.label);
        if (match[0].length > maxPatternLength) {
          maxPatternLength = match[0].length;
        }
        if (p.exact) {
          exactCount++;
        } else {
          supportedCount++;
        }
        if (causalText && p.regex.test(causalText)) {
          isCausal = true;
        }
      }
    }

    if (matchedKeywords.length > 0) {
      candidates.push({
        rule,
        exactCount,
        supportedCount,
        totalMatches: matchedKeywords.length,
        maxPatternLength,
        matchedKeywords,
        isCausal
      });
    }
  }

  // If no taxonomy rule matched, fall back safely to REJ_UNSPECIFIED
  if (candidates.length === 0) {
    return createUnspecifiedDiagnostic(
      combinedText,
      artifact.id,
      artifact.source,
      artifact.channelDetail
    );
  }

  // 4. Sort candidates by:
  //    a) Causal clause match (highest priority)
  //    b) Exact pattern count
  //    c) Max matched pattern length
  //    d) Total matched keywords
  candidates.sort((a, b) => {
    if (a.isCausal && !b.isCausal) return -1;
    if (!a.isCausal && b.isCausal) return 1;
    if (a.exactCount !== b.exactCount) return b.exactCount - a.exactCount;
    if (a.maxPatternLength !== b.maxPatternLength) return b.maxPatternLength - a.maxPatternLength;
    return b.totalMatches - a.totalMatches;
  });

  const best = candidates[0];

  // 5. If multiple distinct categories compete with equal exact/causal strength,
  //    preserve safety and fall back to REJ_UNSPECIFIED rather than arbitrarily guessing.
  if (
    candidates.length > 1 &&
    candidates[1].rule.category !== best.rule.category &&
    !best.isCausal &&
    candidates[1].exactCount === best.exactCount
  ) {
    return createUnspecifiedDiagnostic(
      combinedText,
      artifact.id,
      artifact.source,
      artifact.channelDetail
    );
  }

  const certainty: RejectionCertainty =
    best.exactCount > 0 ? "exact" : best.supportedCount > 1 ? "supported" : "probable";

  return {
    category: best.rule.category,
    rawText: combinedText,
    sourceArtifactId: artifact.id,
    sourceType: artifact.source,
    channelDetail: artifact.channelDetail,
    certainty,
    matchingRuleId: best.rule.ruleId,
    matchedKeywords: best.matchedKeywords,
    diagnosticTitle: best.rule.title,
    interpretation: best.rule.interpretation,
    resolutionGuidance: {
      stage: best.rule.stage,
      prerequisites: best.rule.prerequisites,
      action: best.rule.action,
      doNotDo: best.rule.doNotDo,
      escalationCondition: best.rule.escalationCondition
    }
  };
}

/**
 * Scans all artifacts to find the most relevant diagnostic interpretation.
 */
export function findRejectionDiagnostic(artifacts: Artifact[]): RejectionDiagnostic | null {
  for (const artifact of artifacts) {
    const diagnostic = classifyRejectionEvidence(artifact);
    if (diagnostic) {
      return diagnostic;
    }
  }
  return null;
}
