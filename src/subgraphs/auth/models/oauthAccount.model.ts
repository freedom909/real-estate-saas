import { Schema, model, HydratedDocument, ObjectId } from "mongoose"

export interface OAuthAccount {
  userId: string
  provider: string
  sub: string
}

const oauthAccountSchema = new Schema<OAuthAccount>({
  userId: { type: String, required: true,index: true },
  provider: { type: String, required: true },
  sub: { type: String, required: true },
})

export type OAuthAccountDocument = HydratedDocument<OAuthAccount>

const OAuthAccountModel = model<OAuthAccount>(
  "OAuthAccount",
  oauthAccountSchema
)

export default OAuthAccountModel
