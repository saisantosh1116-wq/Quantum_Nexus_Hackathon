
export interface UserInput {
  age: string;
  conditions: string;
  allergies: string;
  medications: string;
  situation: string;
}

export enum DecisionCategory {
  ACT_CONFIDENTLY = 'ACT_CONFIDENTLY',
  ACT_WITH_WARNING = 'ACT_WITH_WARNING',
  SUGGEST_APPOINTMENT = 'SUGGEST_APPOINTMENT',
  REFUSE = 'REFUSE',
  ASK_FOR_MORE_INFO = 'ASK_FOR_MORE_INFO',
}

export interface AIDecision {
  decision_category: DecisionCategory;
  confidence_score: number;
  risk_level: number;
  reasoning: string;
  action_suggestion: string;
  missing_info_questions?: string[];
}
