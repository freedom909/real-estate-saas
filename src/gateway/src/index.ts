import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloGateway } from "@apollo/gateway"

async function start(){

  const gateway = new ApolloGateway({
    serviceList:[
      {name:"auth",url:"http://localhost:4001/graphql"},
      {name:"user",url:"http://localhost:4002/graphql"},
      {name:"tenant",url:"http://localhost:4003/graphql"},
      {name:"property",url:"http://localhost:4004/graphql"},
      {name:"billing",url:"http://localhost:4005/graphql"},
      {name:"audit",url:"http://localhost:4006/graphql"}
    ]
  })

  const server = new ApolloServer({
    gateway
  })

  await server.start()

  const app = express()

  app.use("/graphql",express.json(),expressMiddleware(server))

  app.listen(4000,()=>{
    console.log("🚀 Gateway running at http://localhost:4000/graphql")
  })
}

start()