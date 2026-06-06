// src/ai-platform/domain/semantic/extractors/confidence.guard.ts

import { injectable } from "tsyringe";

@injectable()
export class ConfidenceGuard {

  shouldAccept(confidence: number): boolean {
    return confidence >= 0.75;
  }
}