const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const { check, validationResult } = require('express-validator');
const fbRef = firebase.database().ref();

// Home Page
router.get('/', function(req, res, next) {
  if(req.session.user){
    const userRef = fbRef.child('users');
    userRef.once('value', (snapshot) => {
      let _user;
      snapshot.forEach((childSnapshot) => {
          let childData = childSnapshot.val();
          if(childSnapshot.key == req.session.user){
            _user = {
              id: childSnapshot.key,
              username: childData.username,
              token: !childData.token ? 0 : childData.token,
              soldTokens: !childData.saleToken ? 0 : childData.saleToken,
              valueToken: !childData.valueToken ? 0 : childData.valueToken
            };
          }
      });
      res.render('sale-tokens/index', { 
          title: 'Quipu Market - Venta de Tokens', 
          user : _user
      });
    });
  }
  else{
    res.redirect('/');
  }
});

router.post('/', function (req, res) {
    let _id = req.body._id;
    let _token = parseInt(req.body.token) - parseInt(req.body.saleToken);
    let _saleToken = parseInt(req.body.saleToken);
    let _soldTokens = parseInt(req.body.soldTokens);
    let _valueToken = parseInt(req.body.valueToken);

    const userRefU = fbRef.child('users/' + _id);
    if(_token > 0){
      userRefU.update({
        token: _token,
        saleToken: _soldTokens + _saleToken,
        valueToken: _valueToken,
        credits: _saleToken * _valueToken
      });
    }
    
    
    const userRef = fbRef.child('users');
    userRef.once('value', (snapshot) => {
      let _user;
        snapshot.forEach((childSnapshot) => {
            let childData = childSnapshot.val();
            if(childSnapshot.key == req.session.user){
              _user = {
                id: childSnapshot.key,
                username: childData.username,
                token: !childData.token ? 0 : childData.token,
                soldTokens: !childData.saleToken ? 0 : childData.saleToken,
                valueToken: !childData.valueToken ? 0 : childData.valueToken
              };
            }
        });
        res.render('sale-tokens/index', { 
            title: 'Quipu Market - Venta de Tokens', 
            user : _user
        });
    });
});

module.exports = router;