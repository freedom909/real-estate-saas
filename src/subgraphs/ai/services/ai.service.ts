//
// ai/services/service.ts


// ai/ai.service.ts
import { injectable } from "tsyringe";
import axios from "axios";

@injectable()
class AIService {
  async chat(input: { message: string; userId: string }) {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/chat",
        input
      );

      return { reply: res.data.reply };

    } catch (e) {
      console.error("AI ERROR:", e);
      return { reply: "AI error" };
    }
  }
}
export default AIService