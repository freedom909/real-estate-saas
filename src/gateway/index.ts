import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import cors from "cors"
import { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } from "@apollo/gateway"
import jwt from "jsonwebtoken";
import verifyJwt from "@/infrastructure/auth/verifyJwt"
import getUserFromContext from "@/infrastructure/auth/getUserFromContext"
async function start() {
  console.log("start gateway")
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: "auth", url: "http://localhost:4010/graphql" },
        { name: "user", url: "http://localhost:4020/graphql" },
        { name: "booking", url: "http://localhost:4030/graphql" },
        { name: "review", url: "http://localhost:4040/graphql" },
        { name: "payment", url: "http://localhost:4050/graphql" },
        { name: "tenant", url: "http://localhost:4060/graphql" },
        { name: "audit", url: "http://localhost:4070/graphql" },
        { name: "location", url: "http://localhost:4080/graphql" },
        { name: "amenity", url: "http://localhost:4090/graphql" },
        { name: "listing", url: "http://localhost:4101/graphql" },
        { name: "account", url: "http://localhost:4102/graphql" },
        // name: "wisdom", url: "http://localhost:4200/graphql" },
        // { name: "wisdom", url: "http://localhost:4200/graphql" },

      ]
    }),
    buildService({ url }) {

      return new RemoteGraphQLDataSource({

        url,

        willSendRequest({ request, context }) {
        const auth = context?.authorization;

console.log("GATEWAY AUTH =>", auth);

if (auth) {

request.http.headers.set(

"authorization",

auth

            );

          }

        },

      });

    }
  });

  console.log("gateway:", gateway)
  const server = new ApolloServer({
    gateway
  })

  await server.start()
  const app = express()

  app.use("/graphql",
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
    express.json(),
    async (req, res, next) => {

console.log("SUBGRAPH AUTH =>", req.headers.authorization);

(req as any).user = await getUserFromContext(req);

console.log("SUBGRAPH USER =>", (req as any).user);

next();

},
    expressMiddleware(server, {
context: async ({ req }) => ({

authorization: req.headers.authorization,

}),
    }))

  app.listen(4000, () => {
    console.log("🚀 Gateway running at http://localhost:4000/graphql")
  })
}

start()