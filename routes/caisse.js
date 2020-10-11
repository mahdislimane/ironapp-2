const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth");
const { body, validationResult } = require("express-validator");

const income = require("../models/Income");
const outcome = require("../models/Outcome");
const User = require("../models/User");

//get income
router.get("/income", auth, (req, res) => {
  income
    .find()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err.message));
});

//add income
router.post("/income", auth, (req, res) => {
  const { date, year, month, day, amount } = req.body;
  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        res.json({ msg: "please connect before" });
      } else {
        const userName = user.firstName + " " + user.lastName;
        const newIncome = new income({
          date,
          year,
          month,
          day,
          amount,
          userName,
        });
        newIncome
          .save()
          .then(() => {
            res.json({ msg: "OK" });
          })
          .catch((err) => console.log(err.message));
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//delete income
router.delete("/income/:id", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      income
        .findById(req.params.id)
        .then((data) => {
          if (!data) {
            return res.json({ msg: "income not found" });
          } else if (user.role !== "ADMIN") {
            res.json({ msg: "not authorised" });
          } else {
            income.findByIdAndDelete(req.params.id, (err, newData) => {
              res.json({ msg: "OK" });
            });
          }
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//get outcome
router.get("/outcome", auth, (req, res) => {
  outcome
    .find()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err.message));
});

//add outcome
router.post("/outcome", auth, (req, res) => {
  const { date, year, month, day, amount, description } = req.body;
  User.findById(req.user.id)
    .then((user) => {
      if (!user) {
        res.json({ msg: "please connect before" });
      } else {
        const userName = user.firstName + " " + user.lastName;
        const newOutcome = new outcome({
          date,
          year,
          month,
          day,
          amount,
          userName,
          description,
        });
        newOutcome
          .save()
          .then(() => {
            res.json({ msg: "OK" });
          })
          .catch((err) => console.log(err.message));
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//delete outcome

router.delete("/outcome/:id", auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      outcome
        .findById(req.params.id)
        .then((data) => {
          if (!data) {
            return res.json({ msg: "outcome not found" });
          } else if (user.role !== "ADMIN") {
            res.json({ msg: "not authorised" });
          } else {
            outcome.findByIdAndDelete(req.params.id, (err, newData) => {
              res.json({ msg: "OK" });
            });
          }
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => {
      console.log(err.message);
    });
});

module.exports = router;
