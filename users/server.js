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
    //  graphiql - a development tool allows us to make queries against our development server
    // Note - only intended to use for Development server
    graphiql: true,
    // we have to provide 'schema' - A graph of data structure inside of a schema file
    schema,
  })
);

app.listen(4000, () => {
  console.log('Listening');
});
