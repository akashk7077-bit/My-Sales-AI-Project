
export interface TranscriptSegment {
  speaker: 'SALES_REP' | 'PROSPECT';
  text: string;
  timestamp: string; // e.g. "00:15"
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type UserRole = 'REP' | 'MANAGER';

export interface UserProfile {
  name: string;
  company: string;
  email: string;
  role: UserRole;
  teamSize?: string;
  timestamp: string;
}

// --- NEW 3-VIEW TYPES ---

export interface RepView {
  performanceSnapshot: {
    totalScore: number;
    summary: string;
    strongestSkill: string;
    damagingMistake: string;
  };
  skillBreakdown: {
    skill: string;
    score: number;
    evidence: string;
    reasoning: string;
    improvement: string;
  }[];
  missedOpportunities: {
    signal: string;
    quote: string;
    context: string;
  }[];
  callRewrite: {
    original: string;
    better: string;
    reason: string;
  }[];
  // SECTION F
  bestRecommendedSentences: string[];
  // SECTION G
  nextCallPreparationPlan: {
    objective: string;
    topRisks: string[];
    strategicQuestions: string[];
    objectionStrategy: string;
    closingLine: string;
    confidenceReset: string;
  };
}

export interface ManagerView {
  dealRiskAssessment: {
    probability: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    primaryDriver: string;
  };
  coachingPriority: {
    level: 'Immediate' | 'Short-term' | 'Long-term';
    focusArea: string;
  };
  patternAnalysis: {
    issueType: 'Skill' | 'Mindset' | 'Process';
    rootCause: string;
  };
  revenueRiskSignals: {
    flag: string;
    quote: string;
    impact: string;
  }[];
  coachingPlan: {
    drills: string[];
    roleplay: string;
    kpi: string;
    trainingPlan: string[];
  };
  competitorAnalysis?: {
    competitor: string;
    context: string;
    repResponse: string;
    effectiveness: 'Effective' | 'Ineffective' | 'Neutral';
  }[];
}

export interface ExecutiveView {
  revenueIntelligence: {
    salesEffectivenessScore: number;
    revenueLeakageRisk: string;
    forecastReliability: string;
  };
  structuralWeakness: {
    diagnosis: string;
    impact: string;
  };
  dealImpact: {
    revenueExposure: string;
    reasoning: string;
  };
  organizationalPattern: {
    observation: string;
    validity: string;
  };
  executiveAction: {
    recommendation: string;
    rationale: string;
  };
}

export interface TrendAnalysis {
  promotability: {
    status: string;
    reason: string;
  };
  strengths: {
    strength: string;
    evidence: string;
  }[];
  mistakes: {
    mistake: string;
    examples: string;
  }[];
  improvement: {
    trend: string;
    proof: string;
  };
  coachingFocus: {
    area: string;
    roi: string;
  };
}

export interface AnalysisData {
  transcription: TranscriptSegment[];
  context: {
    purpose: string;
    product: string;
    price: string;
    prospectRole: string;
    matchedPersona?: string;
    extractedRepName?: string;
  };
  // The Core Views
  repView: RepView;
  managerView: ManagerView;
  
  // Auto-Learning
  discoveredObjections?: ObjectionTemplate[];

  // Legacy fields for backward compatibility (mapped from new views)
  scores?: {
    overall: number;
    discovery: number;
    objectionHandling: number;
    valueArticulation: number;
    closingReadiness: number;
    justification: string;
  };
  dealHealth?: {
    status: 'HOT' | 'WARM' | 'COLD' | 'UNQUALIFIED';
    reason: string;
    probability: number;
  };
  managerSummary?: string[]; // mapped from executive/rep summary
  coaching?: {
      callKillers: any[];
      winningLines: any[];
      right: string[];
      wrong: string[];
      rewrite: string;
      missedQuestion: string;
  };
  prospectReaction?: {
      impressed: string[];
      confused: string[];
      trustBusters: string[];
      acceleration: string[];
  };
}

export interface CallRecord {
  id: string;
  date: string;
  repName: string;
  fileName?: string;
  audioUrl?: string;
  videoSummaryUrl?: string; // New field for Veo video
  analysis: AnalysisData;
}
