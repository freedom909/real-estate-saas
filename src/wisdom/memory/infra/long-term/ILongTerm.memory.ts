// src/wisdom/memory/infra/long-term/ILongTerm.memory.ts
import { IUserKnowledge } from "@/wisdom/memory/model/IUserKnowledge";

export interface ILongTermMemory {

    knowledge: IUserKnowledge;
 metadata: {

        createdAt:number;

        updatedAt:number;

        version:number;

    };
}