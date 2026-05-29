//

import { SemanticContext } from "../../semantic/semantic-context";
import { Task } from "../planners/task";


export interface ISubPlanner {
  canHandle(context: SemanticContext): boolean;
  plan(context: SemanticContext): Task[];
}