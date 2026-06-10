
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";
import { SemanticContext } from "../semantic-context";



export interface ISemanticExtractor {
  extract(request: AIRequest): Promise<SemanticContext>;
}
