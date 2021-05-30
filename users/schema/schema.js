// 'schema' - A graph of data structure

// GraphQL library
const graphql = require('graphql');

// GraphQL properties
const { GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;

// using GraphQLObjectType to instruct GraphQL about the presence of a 'USER' schema/data
const UserType = new GraphQLObjectType({
  // name - document/table name
  name: 'User',

  // object with field properties
  // note - Very important since it defines all the name of the properties that 'User' has
  fields: () => ({
    // we need tell graphQL about what Type of Data each fields are with built in Types
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
  }),
});
