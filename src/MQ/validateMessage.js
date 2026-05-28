export async function validateMessage(message) {
    // Basic validation logic
    try {
      const parsedMessage = JSON.parse(message.value);
      if (!parsedMessage.requiredField) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }