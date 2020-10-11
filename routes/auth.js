const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtsecret = "secret";

const auth = require("../middleware/Auth");
const User = require("../models/User");

//get the logged in user
router.get("/", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//get all user
router.get("/allusers", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      if (user.role === "ADMIN") {
        User.find()
          .then((data) => {
            res.json(data);
          })
          .catch((err) => console.log(err.message));
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//get user
router.get("/user/:id", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      if (user.role === "ADMIN") {
        User.findById(req.params.id)
          .then((data) => {
            res.json(data);
          })
          .catch((err) => console.log(err.message));
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//login the user
router.post(
  "/",
  [
    body("email", "please include a valid email!!!").isEmail(),
    body("password", "password is required").not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.json({ msg: "please register before!!" });
        } else {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err.message);
            } else if (isMatch) {
              const payload = {
                user: {
                  id: user.id,
                },
              };
              jwt.sign(
                payload,
                jwtsecret,
                { expiresIn: 3600000 },
                (err, token) => {
                  if (err) throw err;
                  res.json(token);
                }
              );
            } else {
              return res.json({ msg: "wrong password" });
            }
          });
        }
      })
      .catch((err) => console.log(err.message));
  }
);

module.exports = router;
