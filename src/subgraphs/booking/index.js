// //subgraph-bookings/index.js 

// import { ApolloServer } from '@apollo/server';
// import { buildSubgraphSchema } from '@apollo/subgraph';
// import { gql } from 'graphql-tag';
// import { readFileSync } from 'fs';
// import express from 'express';
// import http from 'http';
// import { expressMiddleware } from '@apollo/server/express4';

// import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

// import cors from 'cors';
// import dotenv from 'dotenv';
// import resolvers from './resolvers.js';
// import initializeBookingContainer from '../services/DB/initBookingContainer.js'
// import ListingService from '../services/listingService.js';
// import BookingService from '../services/bookingService.js'
// import UserService from '../services/userService/index.js';
// import initMongoContainer from '../services/DB/initMongoContainer.js';
// import getUserFromToken from '../infrastructure/auth/getUserFromToken.js';
// import { useServer } from 'graphql-ws/lib/use/ws';
// import { WebSocketServer } from 'ws';
// import PaymentService from '../services/paymentService.js';
// import bookingConsumer from '../MQ/consumer/bookingConsumer.js';

// dotenv.config();
// const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

// const startApolloServer = async () => {
//   try {
//     console.log('⏳ Initializing MySQL container...');
//     const mysqlContainer = await initializeBookingContainer({
//       services: [ListingService, BookingService, PaymentService]
//     });
//     console.log('✅ MySQL container initialized');

//     console.log('⏳ Initializing MongoDB container...');
//     const mongoContainer = await initMongoContainer({
//       services: [UserService]
//     });
//     console.log('✅ MongoDB container initialized');

//     const app = express();
//     const httpServer = http.createServer(app);

//     // WebSocket server for subscriptions
//     const wsServer = new WebSocketServer({
//       server: httpServer,
//       path: '/graphql',
//     });

//     // Set up WebSocket server with GraphQL subscriptions
//     const serverCleanup = useServer({
//       schema: buildSubgraphSchema({ typeDefs, resolvers }),
//       context: (ctx, msg, args) => {
//         const token = ctx.connectionParams?.authorization || '';
//         const user = getUserFromToken(token);
//         return { user };
//       },
//     }, wsServer);

//     // Initialize Apollo Server
//     const server = new ApolloServer({
//       schema: buildSubgraphSchema({ typeDefs, resolvers }),
//       plugins: [
//         ApolloServerPluginDrainHttpServer({ httpServer }),
//         {
//           async serverWillStart() {
//             return {
//               async drainServer() {
//                 // Close the WebSocket server and database connections
//                 serverCleanup.dispose();
//                 await mysqlContainer.resolve('mysqldb').close();
//                 await mongoContainer.resolve('mongodb').close();
//               }
//             };
//           }
//         }
//       ],

//       context: async ({ req }) => {
//         const token = req.headers.authorization || '';
//         console.log('🔑 Authorization token:', token);
//         const user = getUserFromToken(token);
//         if (!user) {
//           console.warn('⚠️ Unauthorized: Invalid or missing token');
//         }
        
//         return {
//           user,
//           dataSources: {
//             listingService: mysqlContainer.resolve('listingService'),
//             bookingService: mysqlContainer.resolve('bookingService'),
//             paymentService: mysqlContainer.resolve('paymentService'),
//           }
//         };
//       }
//     });


//     // Start Apollo Server
//     await server.start();

//     // Apply Express middleware for handling requests
//     app.use(
//       '/graphql',
//       cors(),
//       express.json(),
//       expressMiddleware(server)
//     );

//     // Start the HTTP server
//     httpServer.listen({ port: 4050 }, async () => {
//       console.log(`🚀 Server ready at http://localhost:4050/graphql`);
      
//       // Start MQ consumer for booking notifications
//       try {
//         await bookingConsumer.startConsuming();
//         console.log('✅ Booking MQ Consumer started successfully');
//       } catch (error) {
//         console.error('❌ Failed to start Booking MQ Consumer:', error);
//       }
//     });
//   } catch (error) {
//     console.error('Error starting server:', error);
//   }
// };

// // Start the server
// startApolloServer();


_______________________________________________________________________________

import "reflect-metadata";
import mongoose from "mongoose";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers } from "./interface/resolvers";
import "./container";

const typeDefs = `#graphql
  type Booking {
    id: ID!
    listingId: String!
    guestId: String!
    totalCost: Float!
    status: String!
  }

  input CreateBookingInput {
    listingId: String!
    checkInDate: String!
    checkOutDate: String!
    totalCost: Float!
  }

  type Query {
    booking(id: ID!): Booking
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking
    cancelBooking(id: ID!): Boolean
  }
`;

async function start() {
  await mongoose.connect("mongodb://localhost:27017/booking");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: async () => ({
      user: { id: "user-1" }, // mock auth
    }),
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
