const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// [TODO: X] Implement the /orders handlers needed to make the tests pass

// Validates based on entered (prop)
const hasBodyData = (prop) => {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[prop] && data[prop] !== "") {
      return next();
    }
    next({
      status: 400,
      message: `Order must include a ${prop}`,
    });
  };
};

// Validates if at least one dish is entered
const validateDish = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length !== 0 && Array.isArray(dishes)) {
    return next();
  } else {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
};

// Checks for quantity
const validateQuantity = (req, res, next) => {
  const { data: { dishes } = {} } = req.body;
  dishes.forEach((dish, index) => {
    const quantity = dish.quantity;
    if (!quantity || quantity < 1 || Number(quantity) !== quantity) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
};

// POST handle a new order
const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    dishes,
    status,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

// GET request for all orders
const list = (req, res) => {
  res.json({ data: orders });
};

// Validate if order exists
const validateOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    return next({
      status: 404,
      message: `Order does not exist: ${req.params.orderId}`,
    });
  }
};

// PUT, does body id match orderId
const matchOrder = (req, res, next) => {
  const orderId = req.params.orderId;
  const { data: { id } = {} } = req.body;
  if (id) {
    if (id === orderId) {
      return next();
    } else {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
      });
    }
  } else {
    next();
  }
};

// GETS data based off of one order
const read = (req, res) => {
  res.json({ data: res.locals.order });
};

// PUT handler
const update = (req, res) => {
  const foundOrder = res.locals.order;

  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
};

// Determines status of DELETE request
const verifyDeleted = (req, res, next) => {
  const order = res.locals.order;
  if (order.status === "pending") {
    return next();
  } else {
    return next({
      status: 400,
      message: `An order cannot be deleted unless it is pending`,
    });
  }
};

// Determines status of DELETE request (updated)
const verifyUpdated = (req, res, next) => {
  const { data: { status } = {} } = req.body;
  if (
    !status ||
    (status !== "pending" &&
      status !== "preparing" &&
      status !== "out-for-delivery")
  ) {
    return next({
      status: 400,
      message: `Order must havea status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (status === "delivered") {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  }
  next();
};

//Handle delete
const destroy = (req, res) => {
  const order = res.locals.order;
  const index = orders.findIndex(
    (orderNum) => orderNum.id === Number(order.id)
  );
  orders.splice(index, 1);
  res.sendStatus(204);
};

module.exports = {
  create: [
    hasBodyData("deliverTo"),
    hasBodyData("mobileNumber"),
    hasBodyData("dishes"),
    validateDish,
    validateQuantity,
    create,
  ],
  list,
  read: [validateOrder, read],
  update: [
    validateOrder,
    matchOrder,
    hasBodyData("deliverTo"),
    hasBodyData("mobileNumber"),
    hasBodyData("dishes"),
    hasBodyData("status"),
    verifyUpdated,
    validateDish,
    validateQuantity,
    update,
  ],
  delete: [validateOrder, verifyDeleted, destroy],
};
