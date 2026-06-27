// src/wisdom/memory/model/IUserKnowledge.ts

export interface IUserKnowledge {
    preferences:PreferenceMemory[];

    facts:FactMemory[];

    goals:GoalMemory[];

    summaries:ConversationSummary[];
}

export interface PreferenceMemory {
    key:string;

    value:unknown;

    confidence:number;

    source?:"user"|"behavior"|"llm";
}



export interface ConversationSummary {

    text: string;

    createdAt: number;

    confidence: number;

}

export interface GoalMemory {

    goalType:string;

    target:string;

    status:string;

    createdAt: number;

    confidence: number;

}

export interface FactMemory {
    key:string;

    value:unknown;

    confidence:number;

    createdAt:number;

    source:"user"|"behavior"|"llm";

}