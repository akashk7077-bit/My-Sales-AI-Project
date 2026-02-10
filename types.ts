export interface TranscriptSegment {
  speaker: 'SALES_REP' | 'PROSPECT';
  text: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  industry: string;
  companySize: string;
  painPoints: string[];
}

export interface ObjectionTemplate {
  id: string;
  category: string;
  trigger: string;
  response: string;
}

export interface Objection {
  type: string;
  quote: string;
  responseQuality: 'Strong' | 'Average' | 'Weak';
  missedOpportunity: string;
  suggestedLibraryResponse?: string;
}

export interface AnalysisData {
  transcription: TranscriptSegment[];
  context: {
    purpose: string;
    product: string;
    price: string;
    prospectRole: string;
    authoritySignals: string;
    matchedPersona?: string;
  };
  framework: {
    discovery: {
      painPointsIdentified: boolean;
      openEndedQuestions: boolean;
      businessImpactDiscussed: boolean;
      summary: string;
    };
    objections: Objection[];
    value: {
      benefitsVsFeatures: string;
      outcomesDiscussed: string;
      emotionalTriggers: string[];
    };
    control: {
      talkTimeRatio: string; // e.g., "60/40"
      leadOrReact: string;
      interruptions: string;
    };
  };
  scores: {
    discovery: number;
    objectionHandling: number;
    valueArticulation: number;
    closingReadiness: number;
    overall: number;
    justification: string;
  };
  dealHealth: {
    status: 'HOT' | 'WARM' | 'COLD' | 'UNQUALIFIED';
    reason: string;
  };
  coaching: {
    right: string[];
    wrong: string[]; // Should include timestamps in text if possible
    rewrite: string;
    missedQuestion: string;
  };
  managerSummary: string[];
}
