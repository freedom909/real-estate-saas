//src/
interface IUserClient {
  request(query: string, variables?: any): Promise<any>
}

export class CreateUserGraphQLClient implements IUserClient {

  private endpoint: string

  constructor() {
    this.endpoint = process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql"
  }

  async request(query: string, variables?: any) {

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    const json = await res.json()

    if (json.errors) {
      throw new Error(JSON.stringify(json.errors))
    }

    return json.data
  }

  async findByEmail(email: string) {

    const query = `
      query FindUserByEmail($email: String!) {
        findUserByEmail(email: $email) {
          id
          email
          profile {
            name
            avatar
          }
        }
      }
    `

    const data = await this.request(query, { email })

    return data?.userByEmail ?? null
  }

  async findById(id: string) {

    const query = `
      query user($id: ID!) {
        user(id: $id) {
          id
          email
          profile {
            name
            avatar
          }
        }
      }
    `

    const data = await this.request(query, { id })

    return data?.findUserById ?? null
  }

  async createOAuthUser(input: {
    email?: string
    profile?: {
      name?: string
      avatar?: string
    }
  }) {

    const mutation = `
      mutation CreateOAuthUser($input: CreateOAuthUserInput!) {
        createOAuthUser(input: $input) {
          id
          email
        }
      }
    `

    const data = await this.request(mutation, { input })

    return data.createOAuthUser
  }

}
export default CreateUserGraphQLClient;