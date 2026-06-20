import { GoalState, Precondition, Effect } from "../state/world-state";
import { CapabilityRegistryEntry } from "../registry/capability-registry.types";

export interface HTNSkill {
  id: string;
  name: string;
  description: string;
  preconditions: Precondition[];
  effects: Effect[];
  subSkills: string[];
  successRate: number;
  executionCount: number;
  createdAt: number;
  lastUsed: number;
}

export class HTNSkillLibrary {
  private skills: Map<string, HTNSkill> = new Map();

  registerSkill(skill: Omit<HTNSkill, "createdAt" | "lastUsed">): HTNSkill {
    const now = Date.now();
    const fullSkill: HTNSkill = {
      ...skill,
      createdAt: now,
      lastUsed: now
    };
    this.skills.set(skill.id, fullSkill);
    console.log(`🎯 [HTN Library] Registered skill: ${skill.name} (${skill.id})`);
    return fullSkill;
  }

  findSkillsMatchingGoal(goal: GoalState): HTNSkill[] {
    return Array.from(this.skills.values())
      .filter(skill => {
        return skill.effects.some(effect => {
          return effect.entity === goal.entity && effect.field === goal.field;
        });
      })
      .sort((a, b) => b.successRate - a.successRate);
  }

  getSkill(id: string): HTNSkill | undefined {
    return this.skills.get(id);
  }

  recordSkillUsage(id: string, success: boolean): void {
    const skill = this.skills.get(id);
    if (skill) {
      skill.executionCount++;
      skill.lastUsed = Date.now();
      
      // 更新成功率
      const total = skill.executionCount;
      const successCount = success 
        ? (skill.successRate * (total - 1)) + 1 
        : skill.successRate * (total - 1);
      skill.successRate = successCount / total;
      
      console.log(`📊 [HTN Library] Skill ${skill.name} used: success=${success}, rate=${(skill.successRate * 100).toFixed(0)}%`);
    }
  }

  registerFromCapability(capability: CapabilityRegistryEntry): HTNSkill {
    return this.registerSkill({
      id: `skill:${capability.id}`,
      name: capability.id,
      description: capability.description || "",
      preconditions: capability.preconditions,
      effects: capability.effects,
      subSkills: [],
      successRate: 0.8,
      executionCount: 0
    });
  }

  getSkillLibrarySummary() {
    const skills = Array.from(this.skills.values());
    return {
      totalSkills: skills.length,
      highPerformanceSkills: skills.filter(s => s.successRate > 0.8).length,
      topSkills: skills
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5)
        .map(s => ({
          name: s.name,
          successRate: s.successRate,
          executionCount: s.executionCount
        }))
    };
  }
}
