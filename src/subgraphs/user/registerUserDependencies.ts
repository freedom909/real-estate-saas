import { DependencyContainer } from "tsyringe"
import { TOKENS_USER } from "../../modules/user/container/user.tokens"

import  UserRepository  from "./repos/user.repo"
import  UserService  from "./services/user.service"
import userModel from "./models/user.model"
import { TOKENS_INFRA } from "@/infrastructure/infra.tokens"
import RedisService from "@/infrastructure/redis/redisService"

export function registerUserDependencies(container: DependencyContainer) {

  // model
  container.register(TOKENS_USER.models.user, {
    useValue: userModel
  })

  // repo
  container.register(TOKENS_USER.repos.userRepo, {
    useClass: UserRepository,

  })

  // service
  container.register(TOKENS_USER.services.userService, {
    useClass: UserService
  })

  container.register(TOKENS_INFRA.infra.redis, {
    useValue: RedisService
  })

  return container
}

