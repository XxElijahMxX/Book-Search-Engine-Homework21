const express = require('express');
const {ApolloServer} = require('apollo-server-express');
const path = require('path');
const { authMiddleware } = require('./utils/auth');

// importing the typeDefs and resolvers
const {typeDefs, resolvers} = require('./schemas');
const db = require('./config/connection');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// creates new appollo server that will pass in our schema
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

// this will mix our apollo server and the express app as middleware
server.applyMiddleware({app});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// this will need to be commented out at some point
app.use(routes);

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
    //this will log our gql api tests
    console.log(
      `Test GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});
