export type PegaMessageRole = 'user' | 'assistant';

export interface PegaMessage {
  id: string;
  role: PegaMessageRole;
  content: string;
}

export interface PegaPrompt {
  pxObjClass: string;
  pyInstructions: string;
  pyPrompt: string;
}

export interface PegaConversationResponse {
  data: {
    ID: string;
    response: string;
    suggestedPrompts?: PegaPrompt[];
    welcomeMessage?: string;
    initialInstruction?: string;
    assistantMode?: string;
    messageID?: string;
    aiGuidedQuestions?: PegaPrompt[];
  };
}

export interface PegaSendMessageResponse {
  data: {
    response: string;
    messageID?: string;
    suggestedPrompts?: PegaPrompt[];
  };
}
