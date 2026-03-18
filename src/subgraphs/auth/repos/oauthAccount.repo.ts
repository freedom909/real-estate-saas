import { Model } from "mongoose"
import OAuthAccountModel, {
  OAuthAccount,
  OAuthAccountDocument
} from "../models/oauthAccount.model"

export default class credentialRepo {

  private model: Model<OAuthAccount>

  constructor({ model }: { model: Model<OAuthAccount> }) {
    if (!model) {
      throw new Error("credentialRepo: model is required")
    }
    this.model = model
  }
  // ======================================================
  // METHODS
  // ======================================================
 
  findByProviderAccountId(
    provider: string,
    providerAccountId: string
  ) {
    return this.model
      .findOne({ provider, providerAccountId })
      .exec()
  }

 
  findByProviderSub(provider: string, sub: string) {
    console.log("findByProviderSub++", this.model),
    console.log("provider", provider),
    console.log("sub", sub)
    return this.model
      .findOne({ provider, sub: sub })
      .exec()
  }
  
  async findByProviderUserId(
    provider: string,
    providerUserId: string
  ): Promise<OAuthAccountDocument | null> {
    return this.model
      .findOne({ provider, providerUserId })
      .exec()
  }

  async findById(userId: string): Promise<OAuthAccountDocument[]> {
    return this.model
      .find({ userId })
      .exec()
  }

  async create({
    userId,
    provider,
    sub,
    
  }): Promise<OAuthAccountDocument> {

    return this.model.create({
      userId,
      provider,
      sub,
      
    })
  }

  async deleteByProvider({
    userId,
    provider
  }: {
    userId: string
    provider: string
  }) {
    return this.model.deleteOne({
      userId,
      provider
    })
  }

  async exists(
    provider: string,
    sub: string
  ): Promise<boolean> {
    const count = await this.model.countDocuments({
      provider,
      sub
    })

    return count > 0
  }

  async deleteById(id: string) {
    return this.model.deleteOne({
      _id: id
    })
  }
}
