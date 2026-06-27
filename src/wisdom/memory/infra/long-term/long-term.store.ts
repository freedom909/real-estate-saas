// src/wisdom/memory/infra/long-term/long-term.store.ts
import { injectable } from "tsyringe";
import { ILongTermStore } from "../../type/ILongTermStore";
import { ILongTermMemory } from "./ILongTerm.memory";


@injectable()
export class LongTermStore implements ILongTermStore {
    private readonly store = new Map<string, ILongTermMemory>();
    get(userId: string): Promise<ILongTermMemory | null> {
        return Promise.resolve(this.store.get(userId) ?? null);
    }
    set(userId: string, memory: ILongTermMemory): Promise<void> {
        this.store.set(userId, memory);
        return Promise.resolve();
    }

}