import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloGateway } from "@apollo/gateway"

async function start(){

  const gateway = new ApolloGateway({
    serviceList:[
      {name:"auth",url:"http://localhost:4010/graphql"},
      {name:"user",url:"http://localhost:4020/graphql"},
      {name:"host",url:"http://localhost:4030/graphql"},
      {name:"Listing",url:"http://localhost:4050/graphql"},
      {name:"billing",url:"http://localhost:4060/graphql"},
      {name:"audit",url:"http://localhost:4080/graphql"},
      {name:"ai",url:"http://localhost:4070/graphql"}
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