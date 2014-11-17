import {
  moduleFor,
  test
} from 'ember-qunit';
import config from "../../../config/environment";

moduleFor('torii-adapter:aptible');

test('adapter stores the auth token in localStorage', function(){
  var adapter = this.subject();
  var token = 'some-token';

  adapter.open({ auth_token: token }).then(function(){
    ok(true, 'session is opened with an auth_token');
    var storedToken = window.localStorage.getItem(config.authTokenKey);
    equal(storedToken, token, 'token is stored');
  }, function(e){
    ok(false, "Unexpected error: "+e);
  });
});
