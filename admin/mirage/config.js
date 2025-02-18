import { createMembership } from "./handlers/memberships";
import { getOrganizationMemberships } from "./handlers/organizations";
import { findUsers } from "./handlers/users";

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.4.x/shorthands/
  */
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = '/api';

  this.post('/memberships', createMembership);
  this.get('/organizations/:id');
  this.get('/organizations/:id/memberships', getOrganizationMemberships);
  this.get('/users', findUsers);

}
