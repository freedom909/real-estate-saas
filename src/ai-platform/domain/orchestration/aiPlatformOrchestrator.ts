import { inject, injectable } from "tsyringe";
import { SemanticExtractor } from "../semantic/extractors/semantic.extractor";
import { ChatResponse, UserContext } from "../types/enums/chat.response";
import { TOKENS_EXTRACTOR } from "@/ai-platform/container/tokens/extractor";
import { RoutingService } from "./router/routing.service";
import { TOKENS_FACTORY } from "@/ai-platform/container/tokens/factory";
import { AgentFactory } from "../agents/agent.factory";
import { TOKENS_ORCHESTRATOR } from "@/ai-platform/container/tokens/orchestrator";

@injectable()
export class AIPlatformOrchestrator {

  constructor(
    @inject(TOKENS_EXTRACTOR.semanticExtractor)
    private semanticExtractor: SemanticExtractor,

    @inject(TOKENS_ORCHESTRATOR.routingService)
    private routingService: RoutingService,

    @inject(TOKENS_FACTORY.agentFactory) // Ensure this is registered
    private agentFactory: AgentFactory
  ) { }

  async handle(
    message: string,
    user?: UserContext
  ): Promise<ChatResponse> {

    // 1. semantics
    const semantic =
      await this.semanticExtractor
        .extract(message);
    console.log("semantic", semantic);
    // 2. routing
    const agentName =
      this.routingService.route(
        semantic
      );
    console.log("agentName", agentName);
    // 3. resolve agent
    const agent =
      this.agentFactory.resolve(
        agentName
      );
    console.log("agent", agent);
    // 4. execute
    // If IDomainAgent expects a Task, we should map the semantic context into a Task structure.
    // If the Agent is intended to process the context directly, consider updating IDomainAgent's signature.
    return agent.execute({ //      "message": "Cannot read properties of undefined (reading 'execute')",
      message,
      id: crypto.randomUUID(), // Assuming Task requires an ID
      type: agentName,         // Assuming Task requires a type
      payload: { semantic, user } // Adjust based on your Task definition
    } as any); // Use 'as any' only if Task is a generic DTO; otherwise, align with the Task interface.
  }
}