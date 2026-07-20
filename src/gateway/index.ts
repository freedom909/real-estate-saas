// Gateway

import "reflect-metadata";

import dotenv from "dotenv";

import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// 加载根目录 .env

dotenv.config({

path: path.resolve(__dirname, "../../.env"),

});

// 企业级防御：缺少 secret 直接退出

if (!process.env.ACCESS_TOKEN_SECRET) {

console.error("❌ ACCESS_TOKEN_SECRET is missing");

process.exit(1);

}

console.log("✅ GATEWAY SECRET loaded");
import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import cors from "cors"
import { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } from "@apollo/gateway"

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
        { name: "cart", url: "http://localhost:4103/graphql" },
        { name: "wisdom", url: "http://localhost:4200/graphql" },
        { name: "voice", url: "http://localhost:4300/graphql" },

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