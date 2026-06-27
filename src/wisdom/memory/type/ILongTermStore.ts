// src/wisdom/memory/type/ILongTermStore.ts

import { IMemoryState } from "./i-memoryStore";
import { IUserKnowledge } from "../model/IUserKnowledge";
import { ILongTermMemory } from "../infra/long-term/ILongTerm.memory";


export interface ILongTermStore {

    get(
        userId:string
    ):Promise<ILongTermMemory|null>;

    set(
        userId:string,
        memory:ILongTermMemory
    ):Promise<void>;
}

