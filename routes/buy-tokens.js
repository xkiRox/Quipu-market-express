const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const fbRef = firebase.database().ref();

// Home Page
router.get('/', function(req, res, next) {
    if(req.session.user){
        let tokens = [];
        const userRef = fbRef.child('users');
        userRef.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                let childData = childSnapshot.val();
                if(childSnapshot.key != req.session.user){
                    if(childData.valueToken && childData.saleToken){
                        tokens.push({
                            id: childSnapshot.key,
                            username: childData.username,
                            saleToken: childData.saleToken,
                            valueToken: childData.valueToken
                        })
                    }
                }
            });
            res.render('buy-tokens/index', { 
                title: 'Quipu Market - Compra de Tokens', 
                tokens : tokens
            });
        });
    }
    else
        res.redirect('/');
});

router.post('/', function (req, res) {
    let _id = req.body._id;
    let _buyToken = parseInt(req.body._buyToken);
    let _valueToken = parseInt(req.body._valueToken);
    
    const userBuy = fbRef.child('users/' + req.session.user);

    userBuy.once('value', (snapshot) => {
        _userSale = snapshot.val()
        let _token = _userSale.token + _buyToken
        let _value = _valueToken * _buyToken
        let _credits = !_userSale.credits ? 0 - _value : _userSale.credits - _value
        
        if(_credits > 0){
            userBuy.update({
                token: _token,
                credits: _credits
            });

            const userSale = fbRef.child('users/' + _id);
            userSale.once('value', (sshot) => {
                _saleToken = sshot.val().saleToken
                userSale.update({
                    saleToken: _saleToken - _buyToken
                });
            });
            var _date = new Date()
            let formatted_date = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes() + ":" + _date.getSeconds() 
            let transfer = {
                id_sale: _id,
                id_buy: req.session.user,
                token_sale: _buyToken,
                value_token: _valueToken,
                date_transfer: formatted_date
            };
            const transferRef = fbRef.child('transfers');
            transferRef.push().set(transfer)
        }
        res.redirect('/buy-tokens');
    });
});

module.exports = router;