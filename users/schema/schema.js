// 'schema' - A graph of data structure

// GraphQL library
const graphql = require('graphql');

// to make request to outside server
const axios = require('axios');

// helper library
// lodash to provide more consistent cross-environment iteration support for arrays, strings,
// objects, and arguments objects
// const _ = require('lodash');

// GraphQL properties
// GraphQLSchema - takes in a root query & returns graphQL instance
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

// custom data
// const users = [
//   { id: '23', firstName: 'Rupak', age: 21 },
//   { id: '47', firstName: 'Indira', age: 20 },
// ];

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

// Defining where to start/begin the query from a very specific node,
// Root Query is the entry point into our schema/data
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      // start from 'User' node
      type: UserType,

      // arguments for User search
      args: { id: { type: GraphQLString } },

      // very important func which performs the search & get the data
      // parentValue - don't get used very often
      // args - This is an Object which gets call whatever arguments are passed into the original query above - search with id
      // The purpose of resolve is that it must return a data that represents a 'user object' here

      resolve(parentValue, args) {
        // to find a user inside our custom array
        // we are walking through the list of 'users' array which will
        // find and return first user who has an id equal to 'args.id'
        // return _.find(users, { id: args.id });
        //-------------------------------------------
        // NOTE - The resolve function works also by returning a Promise - async fashion
        // making request to outside server
        return axios.get(`http://localhost:3000/users/${args.id}`).then(resp => resp.data);
      },
      // note - We are asking to RootQuery about 'users' in the app
      // if we provide the 'id' of the 'user' that we are looking for
      // RootQuery will return a 'user' back to us
    },
  },
});

// GraphQLSchema - helper which takes in a Root query & returns graphQL instance
module.exports = new GraphQLSchema({
  query: RootQuery,
});
// we want to export above & make it available to other parts of the application
// We want to import this in main file - server.js
