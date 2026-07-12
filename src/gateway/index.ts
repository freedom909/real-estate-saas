import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import cors from "cors"
import { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } from "@apollo/gateway"
import jwt from "jsonwebtoken";
import verifyJwt from "@/infrastructure/auth/verifyJwt"
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

        // { name: "wisdom", url: "http://localhost:4200/graphql" },

      ]
    }),
    buildService({ url }) {

      return new RemoteGraphQLDataSource({

        url,

        willSendRequest({ request, context }) {

          console.log("WILL SEND CONTEXT:", context);

          if (context.user) {

            request.http.headers.set(

              "x-user-id",

              context.user.sub

            );

            request.http.headers.set(

              "x-tenant-id",

              context.user.sub

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
    expressMiddleware(server, {
      context: async ({ req }) => {

        const authHeader = req.headers.authorization;

        let user = null;

        try {

          if (authHeader) {

            const token = authHeader.replace("Bearer ", "");

            console.log("AUTH HEADER:", authHeader);

            console.log("CLEAN TOKEN:", token);

            user = verifyJwt(token);

            console.log("GATEWAY USER:", user);

          }

        } catch (err) {

          console.error("JWT VERIFY ERROR:", err);

        }

        return { user };

      }
    }))

  app.listen(4000, () => {
    console.log("🚀 Gateway running at http://localhost:4000/graphql")
  })
}

start()