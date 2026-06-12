// 基础设施容器
//
export const TOKENS_INFRA = {
  infra: {
    redis: Symbol.for("infra.redis"),
    cache: Symbol.for("infra.cache"),
    logger: Symbol.for("infra.logger"),
    config: Symbol.for("infra.config"),
  },
  clients: {
    userSubgraphClient: Symbol.for("clients.userSubgraphClient"),
    githubApi: Symbol.for("clients.githubApi"),
    googleApi: Symbol.for("clients.googleApi"),
  },

}