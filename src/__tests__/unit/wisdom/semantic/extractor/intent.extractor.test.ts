// FILE: src/__tests__/unit/wisdom/semantic/extractor/intent.extractor.test.ts

import "reflect-metadata";
import { IntentExtractor } from "@/wisdom/semantic/extractors/intent.extractor";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";


describe("IntentExtractor - CREATE_BOOKING", () => {
  const extractor = new IntentExtractor();

  it("recognizes ご注文もらえませんか", () => {
    const result = extractor.extract("ご注文もらえませんか？");

    expect(result.action).toBe(AgentAction.CREATE_BOOKING);
    expect(result.domain).toBe(AIDomain.BOOKING);
  });

  it("recognizes a natural Japanese reservation request", () => {
    const result = extractor.extract("この部屋を予約したいです");

    expect(result.action).toBe(AgentAction.CREATE_BOOKING);
    expect(result.domain).toBe(AIDomain.BOOKING);
  });

  it("does not classify cancellation as creation", () => {
    const result = extractor.extract("予約をキャンセルしてください");

    expect(result.action).toBe(AgentAction.CANCEL_BOOKING);
  });
});
