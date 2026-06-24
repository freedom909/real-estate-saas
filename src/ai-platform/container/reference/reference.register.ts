import { container } from "tsyringe";

import { ReferenceResolver } from "@/ai-platform/reference/referenceResolver";
import { TOKENS_REFERENCE } from "./reference.token";


container.register(TOKENS_REFERENCE.resolver, {
    useClass: ReferenceResolver,
});
