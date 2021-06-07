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
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList } = graphql;

// custom data
// const users = [
//   { id: '23', firstName: 'Rupak', age: 21 },
//   { id: '47', firstName: 'Indira', age: 20 },
// ];

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // arrow func is to resolve Circular Reference - 'variable scope' with Closure
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },

    // how to go from Single Company over to list of users
    users: {
      // when we go from Company to over users, we have many Users associated to a single company
      // we have to tell GraphQL, it should expected to get back a list of USERS associated to single company
      type: new GraphQLList(UserType),
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then(res => res.data);
      },
    },
  }),
});

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

    // adding another data table
    // similar to foreign key in relational database
    company: {
      type: CompanyType,

      // resolve to connect foreign key
      resolve(parentValue, args) {
        // console.log(parentValue, args);
        // parentValue is the Parent Data table - 'User' of this table
        return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`).then(res => res.data);
      },
    },
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
      // The purpose of resolve is that it must return a data that represents a 'data/document' table/object here

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

    // sibling to 'user'
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`).then(res => res.data);
      },
    },
  },
});

// ROOT MUTATION
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // list of mutations - to change/update data schema
    addUser: {
      // name describes an operation
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve() {},
    },
  },
});

// GraphQLSchema - helper which takes in a Root query & returns graphQL instance
module.exports = new GraphQLSchema({
  query: RootQuery,
});
// we want to export above & make it available to other parts of the application
// We want to import this in main file - server.js
