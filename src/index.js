// React
import React from "react";
import ReactDOM from "react-dom";
import * as Realm from "realm-web";

// Apollo
import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
// Check out app.js for examples of how to run GraphQL operations
import App from "./App";

require('dotenv').config();

// To set up your app:
//
// 1. Link a cluster that includes the MongoDB Atlas sample data sets
// 2. Configure permissions for the ``sample_mflix.movies`` collection. For this
//    demo, you can assign full read/write permissions to the default role.
// 3. Generate a collection schema for the ``sample_mflix.movies`` collection.
// 4. Enable anonymous authentication
// 5. Deploy your changes
//
// Once your app is set up, replace the value of APP_ID with your App ID
export const APP_ID = process.env.REACT_APP_APP_ID;
const app = new Realm.getApp(APP_ID);

// Gets a valid Realm user access token to authenticate requests
async function getValidAccessToken() {
  // Guarantee that there's a logged in user with a valid access token
  if (!app.currentUser) {
    // If no user is logged in, log in an anonymous user. The logged in user will have a valid
    // access token.
    localStorage.clear();
    //await app.logIn(Realm.Credentials.anonymous());
  } else {
    // An already logged in user's access token might be stale. To guarantee that the token is
    // valid, we refresh the user's custom data which also refreshes their access token.
    await app.currentUser.refreshCustomData();
  }
  return app.currentUser.accessToken?app.currentUser.accessToken:"";
}

let client = new ApolloClient({
  link: new HttpLink({
    uri: `https://realm.mongodb.com/api/client/v2.0/app/${APP_ID}/graphql`,
    // We define a custom fetch handler for the Apollo client that lets us authenticate GraphQL requests.
    // The function intercepts every Apollo HTTP request and adds an Authorization header with a valid
    // access token before sending the request.
    fetch: async (uri, options) => {
      const accessToken = await getValidAccessToken();
      options.headers.Authorization = `Bearer ${accessToken}`;
      console.log('token',accessToken);
      return fetch(uri, options);
    },
  }),
  cache: new InMemoryCache()
});

// Wrap your app with an ApolloProvider that provides the client
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
