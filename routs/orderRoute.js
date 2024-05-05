// eslint-disable-next-line import/newline-after-import
const express = require("express");
const router = express.Router();
const { auth } = require("../midleWare/auth");
const { isAdmin } = require("../midleWare/Admin");

//import auth controller
const {
  createCashOrder,
  getOne,
  updateOrderTopaid,
  updateOrderTodelevred,
  checkOut,
  updateOrderStatus,
  getOrders,
  getUserOrders,
  getOrdersByStatus,
} = require("../controlers/orderController");
// router.use(authController.allowedTo("user"), authController.protect);

router.get("/", isAdmin, getOrders);
router.route("/user").get(auth, getUserOrders);
router.route("/status/:status").get(auth,getOrdersByStatus);
router.route("/:id").get(auth,getOne);





router.route("/:cartId").post(auth,createCashOrder);
router.post(
  "/checkout-session/:cartId",
  auth,
  // authService.allowTo(),
  checkOut
);


router.put(
  "/:id/pay",
  auth,
  // authService.allowTo("admin", "manager"),
  updateOrderTopaid
);
router.put(
  "/:id/delever",
  auth,
  // authService.allowTo("admin", "manager"),
  updateOrderTodelevred
);
router.put("/:id/status",auth, updateOrderStatus);

module.exports = router;
