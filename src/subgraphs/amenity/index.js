import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeAmenityContainer from '../services/DB/initAmenityContainer.js';
import { GraphQLError } from 'graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';


dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const mysqlContainer = await initializeAmenityContainer();
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),

      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
               const mysql = mysqlContainer.resolve('mysql');
          if (mysql && mysql.end) {
            await mysql.end(); // close the DB connection properly
          };
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          amenityService: mysqlContainer.resolve('amenityService'),
        },
      }),
      formatError: (error) => {
        console.error('GraphQL error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          locations: error.locations,
          path: error.path,
        };
      },

    });

    await server.start();

    app.use(
      '/graphql',
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }),
      express.json(),
      expressMiddleware(server, {
        isListingCreation: true, // mock flag for testing
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: {
            amenityService: mysqlContainer.resolve('amenityService')
          },
        })
      })
    );

    httpServer.listen({ port: 4090 }, () =>
      console.log('Server is running on http://localhost:4090/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
};

startApolloServer();