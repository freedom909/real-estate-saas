// src/wisdom/contracts/semantic-extractor.ts

import { WisdomRequest } from "./request";
import { SemanticContext } from "../semantic/semantic-context";

export interface ISemanticExtractor {
  extract(request: WisdomRequest): Promise<SemanticContext>;
}
