const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const firebase = require('firebase');
const fbRef = firebase.database().ref();
const crypto = require('crypto');

// Home Page
router.get('/', function(req, res, next) {
  if(!req.session.user)
    res.render('index', { title: 'Quipu Market - Login' });
  else
    res.redirect('/profile')
});

router.post('/', [
  check('username').not().isEmpty().withMessage('Ingresa un usuario'),
  check('password', 'Ingresa una contraseña').not().isEmpty(),
],
function (req, res) {
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('index', { errors: errors.array()});
  } else {
    let username = req.body.username;
    let password = req.body.password;

    let user = {
      username: username,
      password: crypto.createHash('md5').update(password).digest('hex'),
      token: 100
    };

    const userRef = fbRef.child('users');
    let userFind
    let _user = false
    userRef.once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        let childData = childSnapshot.val();
        if(childData.username == username){
          _user = true
          if(validateHash(childData.password, password)){
            userFind = childData
            req.session.user =  childSnapshot.key
          }
          else
            res.render('index', { errors: [{ msg: 'Contraseña incorrecta' }]});
        }
      });

      if(userFind)
        res.redirect('/profile')
      
      if(!_user){
        const userRef = fbRef.child('users');
        let newUser = userRef.push();
        newUser.set(user);
        req.session.user = newUser.key
        res.redirect('/profile');
      }
    });
  }
});

function validateHash(hash, password) {
  var validHash = crypto.createHash('md5').update(password).digest('hex');
  return hash === validHash;
}

module.exports = router;
