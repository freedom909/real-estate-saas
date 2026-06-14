import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } from "@apollo/gateway"

async function start(){
console.log("start gateway")
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "auth", url: "http://localhost:4010/graphql" },
      { name: "user", url: "http://localhost:4020/graphql" },
      {name:"amenity",url:"http://localhost:4090/graphql"},
    //   // {name:"",url:"http://localhost:4030/graphql"},
      {name:"listing",url:"http://localhost:4101/graphql"},
    //   //{name:"billing",url:"http://localhost:4060/graphql"},
    //   {name:"audit",url:"http://localhost:4070/graphql"},
    //   {name:"ai",url:"http://localhost:4200/graphql"},
      {name:"booking",url:"http://localhost:4030/graphql"},
    //  // {name:"review",url:"http://localhost:4040/graphql"},
    //   {name:"location",url:"http://localhost:4080/graphql"},
    //  // {name:"payment",url:"http://localhost:4050/graphql"},
    ]
  }),
   buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,

      willSendRequest({ request, context }) {

        if (context.token) {
          request.http?.headers.set(
            "authorization",
            context.token
          );
        }
      },
    });
  },
});

console.log("gateway:",gateway)
  const server = new ApolloServer({
    gateway
  })
console.log("server:",server)
  await server.start()
  const app = express()

  app.use("/graphql",express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {

      return {
        token: req.headers.authorization,
      };
    },
  }))

  app.listen(4000,()=>{
    console.log("🚀 Gateway running at http://localhost:4000/graphql")
  })
}

start()