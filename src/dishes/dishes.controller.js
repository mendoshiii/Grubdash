const { builtinModules } = require("module");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// [TODO: X] Implement the /dishes handlers needed to make the tests pass

// Used to validate required strings i.e 'name', 'description', and 'image_url'
const hasBodyData = (prop) => {
  return (req, res, next) => {
    const { data = {} } = req.body;
    if (data[prop] && data[prop] !== "") {
      next();
    }
    next({
      status: 400,
      message: `Dish must include a ${prop}`,
    });
  };
};

// Validates dish exists
const validDish = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({
      status: 404,
      message: `Dish id does not exist ${dishId}`,
    });
  }
};

// Checks if body is a valid price and integer
const validPrice = (req, res, next) => {
  const { data: { price } = {} } = req.body;
  if (Number(price) > 0 && typeof price === "number") {
    next();
  } else {
    next({
      status: 400,
      message: `Dish must havea a price that is an integer greater than 0`,
    });
  }
};

// Checks that router dishId matches with body request id
const dishMatcher = (req, res, next) => {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (id !== dishId) {
      next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
    next();
  } else {
    next();
  }
};

// Post method to create a new dish
const create = (req, res) => {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

// Return one dish
const read = (req, res) => {
  const dish = res.locals.dish;
  res.json({ data: dish });
};

//Put request handling
const update = (req, res) => {
  const dish = res.locals.dish;
  const {
    data: { name, description, price, image_url },
  } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
};

//View all dishes
const list = (req, res) => {
  res.json({ data: dishes });
};

module.exports = {
  create: [
    hasBodyData("name"),
    hasBodyData("description"),
    hasBodyData("image_url"),
    validPrice,
    create,
  ],
  read: [validDish, read],
  update: [
    validDish,
    dishMatcher,
    hasBodyData("name"),
    hasBodyData("description"),
    validPrice,
    hasBodyData("image_url"),
    update,
  ],
  list,
};
