import { GraphQLClient } from "graphql-request"

export class UserClient{

  constructor(
    private url:string
  ){}

  private get client(){
    return new GraphQLClient(this.url)
  }

  async createOAuthUser(input:any){

    const mutation=`
    mutation($input:CreateOAuthUserInput!){
      createOAuthUser(input:$input){
        id
        email
      }
    }
    `

    const data = await this.client.request(mutation,{input})

    return data.createOAuthUser

  }

}