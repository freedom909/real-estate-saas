
import { AgentArtifact } from "../context/agent.result";

export interface ChatResponse {

  success: boolean;

  summary: string;

  artifacts: AgentArtifact[];

}