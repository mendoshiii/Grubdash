const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
// [TODO: X] Implement the /dishes routes needed to make the tests pass
router
  .route("/")
  .get(controller.list) // return a list of all data
  .post(controller.create) // verify correct price, set a new dish with given values
  .all(methodNotAllowed); // ignore requests
router
  .route("/:dishId")
  .get(controller.read) // dish id is real id, return dish with given id
  .put(controller.update) // id matches entered id, price is valid, set new values
  .all(methodNotAllowed); // ignore other requests

module.exports = router;
