import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

const app = express();

const schema = buildSchema(`
  type Query {
    ping: String!
  }
`);

const rootValue = {
  ping: () => "pong",
};

const port = Number.parseInt(process.env.PORT ?? "5055", 10);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: process.env.NODE_ENV !== "production",
  })
);

app.listen(port, () => {
  console.log(`GraphQL service running on port ${port}`);
});

app.get("/", (_req, res) => {
  res.send("서버 올라감");
});
