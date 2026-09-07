import type { CanonicalStatus, Source } from "@/lib/schemas";

export const sourceLabel: Record<Source, { en: string; hi: string }> = {
  new_tracker: { en: "Unified Member Portal", hi: "यूनिफाइड मेंबर पोर्टल" },
  old_tracker: { en: "Legacy Claim Portal", hi: "पुराना क्लेम स्टेटस पोर्टल" },
  passbook: { en: "EPFO E-Passbook", hi: "ई-पासबुक लेजर" },
  sms: { en: "SMS Notification", hi: "एसएमएस सूचना" },
  bank: { en: "Bank Statement", hi: "बैंक खाता विवरण" },
  other: { en: "Supplied Record", hi: "प्रस्तुत रिकॉर्ड" }
};

export const stateDisplay: Record<CanonicalStatus, { en: string; hi: string }> = {
  CREDITED: { en: "Your money appears credited.", hi: "आपकी राशि जमा हुई दिखाई दे रही है।" },
  SETTLED: { en: "Your claim is marked settled.", hi: "आपका दावा पास (Settled) हो चुका है।" },
  PROCESSING: { en: "Your claim is under process.", hi: "आपका दावा अभी प्रक्रियाधीन (Under Process) है।" },
  APPROVED: { en: "Your claim has been approved.", hi: "आपका दावा स्वीकृत हो गया है।" },
  SUBMITTED: { en: "Your claim is submitted.", hi: "आपका दावा दर्ज हो चुका है।" },
  REJECTED: { en: "Your claim was rejected.", hi: "आपका दावा अस्वीकृत (Rejected) हुआ है।" },
  UNKNOWN: { en: "We don't have enough information yet.", hi: "अभी इतनी जानकारी नहीं है कि पक्का बताया जा सके।" }
};
