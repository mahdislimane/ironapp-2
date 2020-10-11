const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const { body, validationResult } = require('express-validator');

const abonne = require('../models/Abonne');
const User = require('../models/User');

//get all abonnes
router.get('/', auth, (req, res) => {
  abonne
    .find()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err.message));
});

//get abonne
router.get('/:id', auth, (req, res) => {
  abonne
    .findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => console.log(err.message));
});

//add abonnes
router.post(
  '/',
  [
    auth,
    [
      body('firstName').not().isEmpty(),
      body('lastName').not().isEmpty(),
      body('phoneNumber').not().isEmpty(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    User.findById(req.user.id)
      .then((user) => {
        abonne
          .find()
          .then((data) => {
            let firstdata = false;
            data.map((el) => {
              if (
                el.firstName === req.body.firstName &&
                el.lastName === req.body.lastName
              ) {
                firstdata = true;
              }
            });

            if (firstdata) {
              return res.status(400).json({ msg: "l'abonné existe déjà" });
            } else {
              const { firstName, lastName, phoneNumber } = req.body;
              const credit = 0;
              const userLogedIn = user.firstName + ' ' + user.lastName;
              const newAbonne = new abonne({
                userLogedIn,
                firstName,
                lastName,
                phoneNumber,
                credit,
              });
              newAbonne
                .save()
                .then(() => res.json({msg : "OK"}))
                .catch((err) => console.log(err.message));
            }
          })
          .catch((err) => console.log(err.message));
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
);

//delete abonnes
router.delete('/:id', auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      abonne
        .findById(req.params.id)
        .then((data) => {
          if (!data) {
            return res.json({ msg: 'abonne not found' });
          } else if (user.role !== 'ADMIN') {
            res.json({ msg: 'not authorised' });
          } else {
            abonne.findByIdAndDelete(req.params.id, (err, newData) => {
              res.json({ msg: 'abonne deleted' });
            });
          }
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//edit abonne
router.put('/:id', auth, (req, res) => {
  const { firstName, lastName, phoneNumber, abonnements } = req.body;

  let abonnePut = {};
  if (firstName) abonnePut.firstName = firstName;
  if (lastName) abonnePut.lastName = lastName;
  if (phoneNumber) abonnePut.phoneNumber = phoneNumber;
  if (abonnements) abonnePut.abonnements = abonnements;
  abonnePut.credit = 0;

  abonne
    .findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.json({ msg: 'abonne not found' });
      } else {
        data.abonnements.map((el) => {
          if (el.price !== el.pay) {
            abonnePut.credit += el.price - el.pay;
          }
        });
        abonne.findByIdAndUpdate(
          req.params.id,
          { $set: abonnePut },
          (err, newData) => {
            res.json({ msg: 'OK' });
          }
        );
      }
    })
    .catch((err) => console.log(err.message));
});

//add abonnement
router.put(
  '/:id/abonnement',
  auth,
  [
    body('departement').not().isEmpty(),
    body('abType').not().isEmpty(),
    body('price').not().isEmpty(),
    body('pay').not().isEmpty(),
    body('date').not().isEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const { departement, abType, pay, price, date } = req.body;
    let abonnementPut = {};
    if (departement) abonnementPut.departement = departement;
    if (abType) abonnementPut.abType = abType;
    if (price) abonnementPut.price = price;
    if (pay) abonnementPut.pay = pay;
    if (date) abonnementPut.date = date;
    abonne
      .findById(req.params.id)
      .then((data) => {
        if (!data) {
          return res.json({ msg: 'abonne not found' });
        } else {
          let newabonnementAdded = data;
          newabonnementAdded.abonnements.push(abonnementPut);
          newabonnementAdded.credit = 0;
          newabonnementAdded.abonnements.map((el) => {
           newabonnementAdded.credit += (el.price - el.pay);
          });
          abonne.findByIdAndUpdate(
            req.params.id,
            { $set: newabonnementAdded },
            (err, newData) => {
              res.json({ msg: 'OK' });
            }
          );
        }
      })
      .catch((err) => console.log(err.message));
  }
);

//edit abonnement
router.put('/:id/abonnement/:ida', auth, (req, res) => {
  const { pay } = req.body;

  let abonnementUpdated = {};

  abonne
    .findById(req.params.id)
    .then((data) => {
      if (!data) {
        return res.json({ msg: 'abonne not found' });
      } else {
        abonnementUpdated = data
        abonnementUpdated.credit = 0;
        data.abonnements.map((el) => {
          if (el.id === req.params.ida) {
            el.pay += pay;
          }
          abonnementUpdated.credit += (el.price - el.pay);
        });
        abonne.findByIdAndUpdate(
          req.params.id,
          { $set: abonnementUpdated },
          (err, newData) => {
            res.json({ msg: 'OK' });
          }
        );
      }
    })
    .catch((err) => console.log(err.message));
});

//delete abonnement
router.delete('/:id/abonnement/:ida', auth, (req, res) => {
  User.findById(req.user.id)
    .then((user) => {
      abonne
        .findById(req.params.id)
        .then((data) => {
          let newData = data;
          if (!data) {
            return res.json({ msg: 'abonnement not found' });
          } else if (user.role !== 'ADMIN') {
            res.json({ msg: 'not authorised' });
          } else {
            data.abonnements.map((el, i) => {
              if (el.id === req.params.ida) {
                newData.abonnements.splice(i, 1);
              }
            });

            abonne.findByIdAndUpdate(
              req.params.id,
              { $set: newData },
              (err, newData) => {
                res.json({ msg: 'abonnement deleted' });
              }
            );
          }
        })
        .catch((err) => console.log(err.message));
    })
    .catch((err) => {
      console.log(err.message);
    });
});

module.exports = router;
