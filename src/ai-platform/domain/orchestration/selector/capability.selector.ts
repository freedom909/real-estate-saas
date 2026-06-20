import { CapabilityRegistry } from "../registry";

export interface Intent {
  goal: string;
  entities?: Record<string, any>;
}

export class CapabilitySelector {
  private useLLM = false; // Set to true when LLM is integrated

  async select(intent: Intent): Promise<string[]> {
    if (this.useLLM) {
      return this.selectWithLLM(intent);
    }
    return this.selectRuleBased(intent);
  }

  private selectRuleBased(intent: Intent): string[] {
    const goalLower = intent.goal.toLowerCase();

    // Rule-based selector for demonstration
    if (goalLower.includes("cancel") && goalLower.includes("refund")) {
      return ["CANCEL_BOOKING", "RELEASE_CALENDAR", "NOTIFY_HOST", "PROCESS_REFUND"];
    }
    if (goalLower.includes("cancel") && goalLower.includes("booking")) {
      return ["CANCEL_BOOKING", "RELEASE_CALENDAR", "NOTIFY_HOST"];
    }
    if (goalLower.includes("refund")) {
      return ["PROCESS_REFUND"];
    }

    // Fallback: search by tags and description
    const selectedCapabilities: string[] = [];
    Object.entries(CapabilityRegistry).forEach(([id, entry]) => {
      const descriptionLower = entry.description.toLowerCase();
      const tagsLower = (entry.tags || []).map(t => t.toLowerCase());
      
      if (
        descriptionLower.includes(goalLower) ||
        tagsLower.some(tag => goalLower.includes(tag))
      ) {
        selectedCapabilities.push(id);
      }
    });

    return selectedCapabilities;
  }

  private async selectWithLLM(intent: Intent): Promise<string[]> {
    // This is a placeholder for LLM integration
    // In a real implementation, you would call your LLM API here
    // Example prompt:
    // "Given this goal: {intent.goal}, select the appropriate capabilities from this list: {Object.keys(CapabilityRegistry)}"
    
    console.log("LLM integration placeholder - falling back to rule-based");
    return this.selectRuleBased(intent);
  }
}
