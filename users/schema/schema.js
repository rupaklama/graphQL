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
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphql;

// static/hard coded data, not live or dynamic data
// const users = [
//   { id: '23', firstName: 'Rupak', age: 21 },
//   { id: '47', firstName: 'Indira', age: 20 },
// ];

// note - It is very important to define CompanyType above UserType
// Order of Definition into play here
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  // 'Arrow Func' is to resolve Circular Reference - 'variable scope' with Closure
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },

    // NOTE - To access data from COMPANY to USERS
    // how to go from Single Company over to list of users
    // http://localhost:3000/companies/2/users
    users: {
      // when we go from Company to over users, we have many Users associated to a single company
      // we have to tell GraphQL, it should expected to get back a list of USERS associated to single company
      type: new GraphQLList(UserType), // GraphQLList - to get array/list of users
      resolve(parentValue, args) {
        // 'parentValue' is the Parent Data table - 'User' object of this table
        // console.log(parentValue.id);
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then(res => res.data);
      },
    },
  }),
});

// using GraphQLObjectType to instruct GraphQL about the presence of a 'USER' schema/data
// To create 'User' schema
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

    // NOTE - To access data from USERS to COMPANY
    // Note - setting up Nested Queries with field - 'company'
    // Linking another data table
    // similar to foreign key in relational database
    company: {
      type: CompanyType,

      // resolve to connect foreign key and to 'Search & Get the Data'
      // resolve func also works by returning a PROMISE - async request
      resolve(parentValue, args) {
        // console.log(parentValue, args);
        // 'parentValue' is the Parent Data table - 'User' of this table
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
    // start with - user(id: "23") { }
    user: {
      // start from 'User' node
      type: UserType,

      // arguments for User search
      args: { id: { type: GraphQLString } },

      // very important func which performs the 'Search & Get the Data' into our database
      // parentValue - don't get used very often
      // args - This is an Object which gets call whatever arguments are passed into the original query above - search with id - (id: "23")
      // The purpose of resolve is that it must return a data that represents a 'data/document' table/object here

      // args - (id: "23")
      resolve(parentValue, args) {
        // to find a user inside our custom array
        // we are walking through the list of 'users' array which will
        // find and return first user who has an id equal to 'args.id'
        // return _.find(users, { id: args.id });
        //-------------------------------------------
        // NOTE - The resolve function works also by returning a Promise - async fashion
        // making request to outside server
        return axios.get(`http://localhost:3000/users/${args.id}`).then(resp => resp.data);
        // GraphQL will automatically detects that we returned a Promise, wait for Promise to RESOLVE
        // and send resolved data to the user
      },
      // note - We are asking to RootQuery about 'users' in the app
      // if we provide the 'id' of the 'user' that we are looking for
      // RootQuery will return a 'user' back to us
    },

    // company(id: "1") { - another field here
    // sibling to 'user' - setting a starting point to query with 'Company' like with 'user' above
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${args.id}`).then(res => res.data);
      },
    },
  },
});

// Mutation is to change data directly.
// We are going to setup our Mutation Object similar fashion like Root Query Type
// where we make a 'Mutation Type' & add 'fields' to it to do some operation to change our data

// ROOT MUTATION
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // to add user into our USERS array list
    // 'addUser' - name describes an operation/purpose
    addUser: {
      // type of data we are going to return from resolve function
      type: UserType,
      args: {
        // to add user, we need all these args object
        // GraphQLNonNull - to make it 'required' field where a value is needed
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve(parentValue, { firstName, age, companyId }) {
        // destructuring args
        return axios.post(`http://localhost:3000/users`, { firstName, age, companyId }).then(res => res.data);
      },
    },

    // to delete user
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { id }) {
        return axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data);
      },
    },

    // to edit existing user
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        // optionally provide
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      // args will contain all above fields if we want to update individually/partially
      resolve(parentValue, args) {
        return axios.patch(`http://localhost:3000/users/${args.id}`, args).then(res => res.data);
      },
    },

    // update query
    // mutation {
    //   # name of the mutation we want to call with args
    //   editUser(id:"40", age: 10) {
    //     # whenever we call the mutation, we must ask for props coming back
    //     # props which got resolved from a resolve function
    //     id
    //     firstName
    //     age
    //   }
    // }
  },
});

// GraphQLSchema - helper which takes in a Root query & returns graphQL instance
module.exports = new GraphQLSchema({
  query: RootQuery,

  // root mutation object to use
  mutation: mutation,
});
// we want to export above & make it available to other parts of the application
// We want to import this in main file - server.js
