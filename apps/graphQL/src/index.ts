import { loadFilesSync } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cors from "cors";
import express, { type RequestHandler as ExpressRequestHandler } from "express";
import http from "http";

const loadedTypes = loadFilesSync("./**/*", {
  extensions: [".graphql"],
});

const loadedResolvers = loadFilesSync("./**/*", {
  extensions: [".resolvers.ts", ".resolvers.js"],
});

const port = Number.parseInt(process.env.PORT ?? "5055", 10);

async function startApolloServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs: loadedTypes,
    resolvers: loadedResolvers,
  });
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  const corsMiddleware = cors() as unknown as ExpressRequestHandler;
  const jsonBodyParser = bodyParser.json() as unknown as ExpressRequestHandler;
  const apolloMiddleware = expressMiddleware(server) as unknown as ExpressRequestHandler;

  app.use("/graphql", corsMiddleware, jsonBodyParser, apolloMiddleware);

  app.get("/", (_req, res) => {
    res.send(`GraphQL service running on port ${port}`);
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(port, resolve);
  });

  console.log(`GraphQL service running on port ${port}`);
}

startApolloServer();
