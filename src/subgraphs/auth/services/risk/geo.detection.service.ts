//
import { createRedis } from "../../../../infrastructure/redis/redis"

export default class GeoRiskService {
  private redis = createRedis()
  async checkGeo(ctx) {

    const lastCountry =
      await this.redis.get(
        `user:last_country:${ctx.userId}`
      )

    if (
      lastCountry &&
      lastCountry !== ctx.geo.country
    ) {

      return {
        score: 25,
        reasons: ["GEO_ANOMALY"]
      }

    }

    return { score: 0, reasons: [] }
  }
}