//

import { container } from "tsyringe"
import { TOKENS_CACHE } from "../tokens/cache.token"
import RedisService from "@/infrastructure/redis/redisService"

export function cacheContainer(){
    container.register(TOKENS_CACHE.service.cacheService, {
        useClass:RedisService
})
}