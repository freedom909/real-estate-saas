//
import { injectable } from "tsyringe";

@injectable()
export class GeneralAgent {
  async execute() {

    return {
      reply:
        "I didn't understand clearly."
    };
  }
}