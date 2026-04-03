import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';

import resolvers from './resolvers.js';
import initializeCartContainer from '../services/DB/initCartContainer.js';
import sequelize from '../services/models/config/seq.js';
import { Cart } from '../services/models/cart.js';
import CartItem from '../services/models/cartItem.js';
import Listing from '../services/models/mysql/listing.js';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // Initialize MySQL container
    const mysqlContainer = await initializeCartContainer();
    await sequelize.sync({ alter: true });
    await Listing.sync({ alter: true });
    await Cart.sync({ alter: true });
    await CartItem.sync({ alter: true });

    const app = express();
    const httpServer = http.createServer(app);

    // Initialize Apollo Server
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                // Close the database connections
                if (mysqlContainer.resolve('mysqldb')) {
                  await mysqlContainer.resolve('mysqldb').close();
                }
              }
            };
          }
        }
      ],

      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        
        return {
          user: { token },
          dataSources: {
            cartService: mysqlContainer.resolve('cartService'),
          }
        };
      }
    });

    // Start Apollo Server
    await server.start();

    // Apply Express middleware for handling requests
    app.use(
      '/graphql',
      cors({ origin: '*', methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization || '';
          return {
            user: { token },
            dataSources: {
              cartService: mysqlContainer.resolve('cartService'),
            }
          };
        }
      })
    );

    // Start the HTTP server
    httpServer.listen({ port: 4060 }, () => {
      console.log(`🚀 Server ready at http://localhost:4060/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

// Start the server
startApolloServer();