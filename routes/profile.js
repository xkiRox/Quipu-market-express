const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const fbRef = firebase.database().ref();

router.get('/', function(req, res, next) {
    let _id = req.session.user
    if(_id){
        let transfers = [];
        const userBuy = fbRef.child('users/' + _id)
        userBuy.once('value', (snapshot) => {
            user = snapshot.val()
            let total = 0
            const transferRef = fbRef.child('transfers');
            transferRef.once('value', (sshot) => {
                sshot.forEach((childSnapshot) => {
                    let childData = childSnapshot.val();
                    if(childData.id_buy == _id){
                        transfers.push({
                            date: childData.date_transfer,
                            value: childData.token_sale * childData.value_token
                        })
                        total += (childData.token_sale * childData.value_token)
                    }

                })

                res.render('profile/index',{
                    title: 'Quipu Market - Perfil', 
                    user: user,
                    transfers: transfers,
                    total: total
                })
            })
        })
    }
    else
        res.redirect('/')
});

module.exports = router;