const express = require('express');

// middleware to hook up graphQL to express
const expressGraphQL = require('express-graphql').graphqlHTTP;

const app = express();

// user schema
const schema = require('./schema/schema');

// any request to the backend with '/graphql',
// we want GraphQL library to handle it
app.use(
  '/graphql',
  expressGraphQL({
    // Note - only intended to use for Development server
    // GraphiQL is an in-browser tool for writing, validating, and testing GraphQL queries
    // provided by GraphiQL Express library
    graphiql: true,
    // we have to provide 'schema' - A graph of data structure inside of a schema file
    schema: schema,
  })
);

app.listen(4000, () => {
  console.log('Listening');
});
