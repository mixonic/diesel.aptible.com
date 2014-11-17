import Ember from "ember";
import {
  read as readStore,
  remove as removeStore,
  write as writeStore
} from "../utils/local-store";
import config from "../config/environment";
import ajax from "../utils/ajax";

export default Ember.Object.extend({
  fetch: function(){
    debugger;
    return new Ember.RSVP.Promise(function(resolve){
      var token = readStore(config.authTokenKey);

      if (token) {
        resolve(token);
      } else {
        throw new Error('Token not found');
      }
    }).then(function(token){
      var parts = token.split('.');
      return window.atob(parts[1]);
    }).then(function(payload){
      return ajax(payload.sub, {
        type: 'GET'
      });
    }).catch(function(e){
      debugger;
      removeStore(config.authTokenKey);
      throw e;
    });
  },
  open: function(tokenResponse){
    return new Ember.RSVP.Promise(function(resolve){
      debugger;
      //writeStore(config.authTokenKey, tokenResponse.access_token);
      writeStore(config.authTokenKey, 'hihi');
      resolve();
    });
  }
});
