/**
 * CLAIMCLARITY TIMING & DOMAIN RULES CONFIGURATION
 * 
 * Centralized, typed configuration for domain timings and service benchmarks.
 * 
 * IMPORTANT DOMAIN DISTINCTION:
 * - The 20-day Citizen Charter timeframe is an INFORMATIONAL SERVICE BENCHMARK.
 * - Exceeding 20 days is NOT automatically an illegal act or statutory breach.
 * - Claims exceeding 45 days without updates become eligible for grievance escalation.
 */

export const CLAIM_TIMINGS = {
  /**
   * Citizen Charter informational benchmark for standard claim processing (working days guideline).
   */
  informationalBenchmarkDays: 20,

  /**
   * Threshold beyond which an in-flight claim without subsequent updates is flagged as stale pending.
   */
  stalePendingDays: 30,

  /**
   * Threshold beyond which formal grievance escalation (EPFiGMS) is recommended.
   */
  escalationThresholdDays: 45,

  /**
   * Recommended minimum wait time in days after updating KYC/bank details before re-submitting a claim.
   */
  kycUpdatePropagationWaitDays: 3
} as const;

export interface TimingAssessment {
  submissionDate: string | null;
  latestObservationDate: string | null;
  elapsedDaysFromSubmission: number | null;
  isBeyondBenchmark: boolean;
  isStalePending: boolean;
  isEscalationEligible: boolean;
  benchmarkDays: number;
  timingNotice: { en: string; hi: string } | null;
}

/**
 * Parses an ISO date string (YYYY-MM-DD) into UTC timestamp safely.
 * Returns null if the date is missing, invalid, or malformed.
 */
export function parseDateSafe(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month, day));
  if (isNaN(date.getTime())) return null;
  return date;
}

/**
 * Calculates calendar days between two dates.
 */
export function calculateElapsedDays(startDate: Date, endDate: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / msPerDay);
}

/**
 * Assesses claim timing milestones based on available dates.
 * Preserves uncertainty when dates are missing without fabricating values.
 */
export function assessClaimTimings(
  submissionDateStr: string | null | undefined,
  latestObservationDateStr: string | null | undefined
): TimingAssessment {
  const subDate = parseDateSafe(submissionDateStr);
  const obsDate = parseDateSafe(latestObservationDateStr);

  if (!subDate || !obsDate) {
    return {
      submissionDate: submissionDateStr || null,
      latestObservationDate: latestObservationDateStr || null,
      elapsedDaysFromSubmission: null,
      isBeyondBenchmark: false,
      isStalePending: false,
      isEscalationEligible: false,
      benchmarkDays: CLAIM_TIMINGS.informationalBenchmarkDays,
      timingNotice: null
    };
  }

  const elapsed = calculateElapsedDays(subDate, obsDate);
  const validElapsed = elapsed >= 0 ? elapsed : 0;

  const isBeyondBenchmark = validElapsed > CLAIM_TIMINGS.informationalBenchmarkDays;
  const isStalePending = validElapsed >= CLAIM_TIMINGS.stalePendingDays;
  const isEscalationEligible = validElapsed >= CLAIM_TIMINGS.escalationThresholdDays;

  let timingNotice: { en: string; hi: string } | null = null;

  if (isEscalationEligible) {
    timingNotice = {
      en: `Your claim records span ${validElapsed} days since submission. Because this exceeds ClaimClarity's configured ${CLAIM_TIMINGS.escalationThresholdDays}-day escalation threshold without a terminal resolution, considering an official grievance on the EPFiGMS portal is a recommended option.`,
      hi: `आपके रिकॉर्ड्स दावे के दर्ज होने से ${validElapsed} दिन दर्शाते हैं। चूंकि यह बिना किसी अंतिम समाधान के ClaimClarity द्वारा निर्धारित ${CLAIM_TIMINGS.escalationThresholdDays} दिनों की सीमा से अधिक है, अतः EPFiGMS पोर्टल पर आधिकारिक शिकायत दर्ज करने पर विचार करना एक अनुशंसित विकल्प है।`
    };
  } else if (isBeyondBenchmark) {
    timingNotice = {
      en: `Your claim has been under process for approximately ${validElapsed} days, which exceeds the standard 20-day Citizen Charter service benchmark.`,
      hi: `आपका दावा लगभग ${validElapsed} दिनों से प्रक्रियाधीन है, जो कि नागरिक चार्टर के मानक 20-दिवसीय सेवा दिशानिर्देश से अधिक है।`
    };
  }

  return {
    submissionDate: submissionDateStr || null,
    latestObservationDate: latestObservationDateStr || null,
    elapsedDaysFromSubmission: validElapsed,
    isBeyondBenchmark,
    isStalePending,
    isEscalationEligible,
    benchmarkDays: CLAIM_TIMINGS.informationalBenchmarkDays,
    timingNotice
  };
}
