import { loadFilesSync } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";
import { graphqlHTTP } from "express-graphql";
// import { buildSchema } from "graphql";

const app = express();

const loadedTypes = loadFilesSync("./**/*", {
  extensions: [".graphql"],
});

const loadedResolvers = loadFilesSync("./**/*", {
  extensions: [".resolvers.ts", ".resolvers.js"],
});

const schema = makeExecutableSchema({
  typeDefs: loadedTypes,
  resolvers: loadedResolvers,
});

const port = Number.parseInt(process.env.PORT ?? "5055", 10);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(port, () => {
  console.log(`GraphQL service running on port ${port}`);
});

app.get("/", (_req, res) => {
  res.send("GraphQL service running on port " + port);
});
