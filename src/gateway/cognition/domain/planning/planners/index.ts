// src/gateway/cognition/index.ts
import { ChatUseCase } from "@/gateway/cognition/application/use-cases/chat.use-case";
import { initializeCognitionContainer } from "@/gateway/cognition/register/cognition.register";
import { container } from "tsyringe";


// Initialize all cognitive dependencies
initializeCognitionContainer();

export { ChatUseCase, initializeCognitionContainer };