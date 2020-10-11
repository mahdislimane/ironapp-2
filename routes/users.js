const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtsecret = "secret";
const auth = require("../middleware/Auth");

const User = require("../models/User");

//add user
router.post(
  "/",
  [
    body("firstName", "firstName is required").not().isEmpty(),
    body("lastName", "lastName is required").not().isEmpty(),
    body("email", "please include a valid email!!!").isEmail(),
    body("role", "role is required").not().isEmpty(),
    body("password", "6 character length password required")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { firstName, lastName, email, role, password } = req.body;
    User.findOne({ email })
      .then((user) => {
        if (user) {
          res.json({ msg: "user already exists!!!" });
        } else {
          user = new User({
            firstName,
            lastName,
            email,
            role,
            password,
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hashedPassword) => {
              user.password = hashedPassword;
              user.save();

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
            });
          });
        }
      })
      .catch((err) => console.log(err.message));
  }
);

//delete user

router.delete("/:id", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      User.findById(req.params.id)
        .then((data) => {
          if (!data) {
            return res.json({ msg: "User not found" });
          } else if (user.role !== "ADMIN") {
            res.json({ msg: "not authorised" });
          } else {
            User.findByIdAndDelete(req.params.id, (err, newData) => {
              res.json({ msg: "User deleted" });
            });
          }
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//edit user

router.put(
  "/edituser",
  [
    body("firstName", "firstName is required").not().isEmpty(),
    body("lastName", "lastName is required").not().isEmpty(),
    body("email", "please include a valid email!!!").isEmail(),
    body("role", "role is required").not().isEmpty(),
    body("oldPassword", "6 character length password required")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
    body("password", "6 character length password required")
      .not()
      .isEmpty()
      .isLength({ min: 6 }),
  ],
  auth,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const {
      firstName,
      lastName,
      email,
      role,
      oldPassword,
      password,
    } = req.body;

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.json({ msg: "please register before!!" });
        } else {
          bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
            if (err) {
              console.log(err.message);
            } else if (isMatch) {
              updatedUser = new User({
                firstName,
                lastName,
                email,
                role,
                password,
              });
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(
                  updatedUser.password,
                  salt,
                  (err, hashedPassword) => {
                    updatedUser.password = hashedPassword;
                    User.findOneAndDelete({email}, (err, newData) => {
                      updatedUser.save();
                      res.json({ msg: "User updated" });
                    });
                  }
                );
              });
            } else {
              return res.json({ msg: "old password is wrong" });
            }
          });
        }
      })
      .catch((err) => console.log(err.message));
  }
);

module.exports = router;
