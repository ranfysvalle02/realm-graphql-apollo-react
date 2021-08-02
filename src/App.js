import "./styles.css";
import * as React from "react";
import * as Realm from "realm-web";
import { useQuery, useMutation } from "@apollo/client";
import { FIND_MOVIE, UPDATE_MOVIE } from "./graphql-operations";

export default function App(props) {
  const APP_ID = process.env.APP_ID;

  // Connect to your MongoDB Realm app
  const app = new Realm.App(APP_ID);

  const [searchText, setSearchText] = React.useState("The Matrix Reloaded");
  const { loading, data } = useQuery(FIND_MOVIE, {
    variables: { query: { title: searchText } },
    pollInterval: 500
  });

  const movie = data ? data.movie : null;
  const [updateMovie, { loading: updating }] = useMutation(UPDATE_MOVIE);
  const [newTitleText, setNewTitleText] = React.useState("Silly New Title");

  const [loginEmail, setLoginEmail] = React.useState("example123@gmail.com");
  const [loginEmailPwd, setLoginEmailPwd] = React.useState("example123@gmail.com");
  
  const [registerEmail, setRegisterEmail] = React.useState("example123@gmail.com");
  const [registerEmailPwd, setRegisterEmailPwd] = React.useState("example123@gmail.com");
  
  const updateMovieTitle = async () => {
    if (!movie) return;
    await updateMovie({
      variables: {
        query: { title: movie.title },
        set: { title: newTitleText }
      }
    });
    setSearchText(newTitleText);
  };
  
  async function registerUser(email,password){
    return await app.emailPasswordAuth.registerUser(email, password).then((xx)=>{console.log('que?',xx)});
  }
  async function loginEmailPassword(email, password) {
    // Create an anonymous credential
    const credentials = Realm.Credentials.emailPassword(email, password);
    try {
      // Authenticate the user
      const user = await app.logIn(credentials);
      return user
    } catch(err) {
      console.error("Failed to log in", err);
    }
  }
  async function tryToLoginAnonymously(){
    return await app.logIn(Realm.Credentials.anonymous());
  }
  const tryToLogin = async function(){
    try{
      const realmUser = await loginEmailPassword(loginEmail,loginEmailPwd);
      console.log('realmUser',realmUser);
      localStorage.setItem('token',realmUser['_accessToken']);
    }catch(e){
      // double login theoretically works without requiring a logout
      // TODO: double login does not trigger an error. find out how to track auth status elegantly
      console.log('e-login',e);
    }
  };

  const tryToRegister = async function(){
    try{
      await registerUser(registerEmail,registerEmailPwd);
    }catch(e){
      console.log('error',e);
      alert('Could not register the user');
    }
  };

  
  return (
    <div className="App">
      <h1>Sign in Anonymously</h1>
      <div className="title-input">
        <button
          className="fancy-button"
          onClick={() => tryToLoginAnonymously()}
        >
          Login Anonymously
        </button>
      </div>
      <hr /> 
      <h1>OR Register</h1>
      <div className="title-input">
        <input
          type="text"
          className="fancy-input"
          value={registerEmail}
          onChange={e => setRegisterEmail(e.target.value)}
        />
        <input
          type="password"
          className="fancy-input"
          value={registerEmailPwd}
          onChange={e => setRegisterEmailPwd(e.target.value)}
        />
        <button
          className="fancy-button"
          onClick={() => tryToRegister()}
        >
          Register with E-mail
        </button>
      </div>
      <hr /> 
      <h1>Then Login</h1>
      <div className="title-input">
        <input
          type="text"
          className="fancy-input"
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
        />
        <input
          type="password"
          className="fancy-input"
          value={loginEmailPwd}
          onChange={e => setLoginEmailPwd(e.target.value)}
        />
        <button
          className="fancy-button"
          onClick={() => tryToLogin()}
        >
          Sign-In with E-mail
        </button>
      </div>
      <hr /> 
      <h1>Find a Movie</h1>
      <span className="subheading">
        The app automatically searches as you type
      </span>
      <div className="title-input">
        <input
          className="fancy-input"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          type="text"
        />
      </div>
      {APP_ID === "<Your App ID>" ? (
        <div className="status important">
          Replace APP_ID with your App ID in index.js
        </div>
      ) : (
        !loading &&
        !movie && <div className="status">No movie with that name!</div>
      )}
      {movie && (
        <div>
          {!updating && (
            <div className="title-input">
              <input
                type="text"
                className="fancy-input"
                value={newTitleText}
                onChange={e => setNewTitleText(e.target.value)}
              />
              <button
                className="fancy-button"
                onClick={() => updateMovieTitle()}
              >
                Change the movie title
              </button>
            </div>
          )}
          <h2>{movie.title}</h2>
          <div>Year: {movie.year}</div>
          <div>Runtime: {movie.runtime} minutes</div>
          <br />
          <img alt={`Poster for ${movie.title}`} src={movie.poster} />
        </div>
      )}
    </div>
  );
}
