//src/__tests__/unit/wisdom/semantic/date.extractor.test.ts

import "reflect-metadata";
import { DateExtractor } from "@/wisdom/semantic/extractors/date.extractor";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { SemanticEntity } from "@/wisdom/semantic/semantic.entity";

describe("DateExtractor", () => {
  let extractor: DateExtractor;

  // Fix current date to November 10, 2026 (Tuesday).
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 10, 12, 0, 0));

    extractor = new DateExtractor();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const getValue = (
    entities: SemanticEntity[],
    type: EntityType,
  ): string | undefined => {
    return entities.find(entity => entity.type === type)?.value as
      | string
      | undefined;
  };

  describe("Japanese relative dates", () => {
    it("should extract 明日 as check-in tomorrow and check-out the following day", () => {
      const entities = extractor.extract("明日予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-11");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-12");
    });

    it("should extract 明後日 as check-in the day after tomorrow", () => {
      const entities = extractor.extract("明後日予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-12");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-13");
    });

    it("should extract 来週 as Monday to Sunday of next week", () => {
      const entities = extractor.extract("来週予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-16");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-22");
    });

    it("should extract 今週末 as Saturday to Sunday", () => {
      const entities = extractor.extract("今週末予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-14");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-15");
    });

    it("should extract 来月 as the first and last day of next month", () => {
      const entities = extractor.extract("来月予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-01");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-12-31");
    });
  });

  describe("Japanese date ranges", () => {
    it("should extract a date range using から and まで", () => {
      const entities = extractor.extract(
        "12月15日から12月18日まで予約したい",
      );

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-15");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-12-18");
    });

    it("should extract a date range using 〜", () => {
      const entities = extractor.extract(
        "12月15日〜12月18日でお願いします",
      );

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-15");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-12-18");
    });

    it("should extract a date range using ~", () => {
      const entities = extractor.extract("12月15日~12月18日");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-15");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-12-18");
    });

    it("should extract a single Japanese date as check-in only", () => {
      const entities = extractor.extract("12月15日に予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-15");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBeUndefined();
    });

    it("should reject an invalid Japanese date", () => {
      const entities = extractor.extract(
        "2月30日から3月2日まで予約したい",
      );

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBeUndefined();

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBeUndefined();
    });
  });

  describe("Date year resolution", () => {
    it("should use the next year when the requested date has already passed", () => {
      const entities = extractor.extract(
        "1月15日から1月18日まで予約したい",
      );

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2027-01-15");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2027-01-18");
    });

    it("should handle a date range crossing the year boundary", () => {
      const entities = extractor.extract(
        "12月30日から1月3日まで予約したい",
      );

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-30");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2027-01-03");
    });
  });

  describe("English relative dates", () => {
    it("should extract tomorrow", () => {
      const entities = extractor.extract("I want to book tomorrow");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-11");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-12");
    });

    it("should extract next week", () => {
      const entities = extractor.extract("I want to book next week");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-16");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-22");
    });

    it("should extract this weekend", () => {
      const entities = extractor.extract("I want to book this weekend");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-14");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-15");
    });
  });

  describe("Explicit check-in and check-out", () => {
    it("should extract check-in date", () => {
      const entities = extractor.extract("check-in on 2026-12-15");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-12-15");
    });

    it("should extract check-out date", () => {
      const entities = extractor.extract("check-out on 2026-12-18");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-12-18");
    });
  });

  describe("No date found", () => {
    it("should return an empty array when no date is found", () => {
      const entities = extractor.extract("I want to book a nice house");

      expect(entities).toEqual([]);
    });
  });

  describe("Weekend boundary", () => {
    it("should use today when today is Saturday and the user says 今週末", () => {
      jest.setSystemTime(new Date(2026, 10, 14, 12, 0, 0));

      const entities = extractor.extract("今週末予約したい");

      expect(getValue(entities, EntityType.CHECK_IN_DATE))
        .toBe("2026-11-14");

      expect(getValue(entities, EntityType.CHECK_OUT_DATE))
        .toBe("2026-11-15");
    });
  });
});