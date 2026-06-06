//


import { SemanticExtractor } from "@/ai-platform/domain/semantic/extractors/semantic.extractor";

export const TOKENS_EXTRACTOR = {
    semanticExtractor:Symbol.for("semanticExtractor"),
    ruleExtractor:Symbol.for("ruleExtractor"),
    llmExtractor:Symbol.for("llmExtractor"),
    ruleUseCase:Symbol.for("ruleUseCase")
    
    } as const;