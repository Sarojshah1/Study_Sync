const mongoose = require('mongoose');

async function connectionmongoDB(url){
    return mongoose.connect(url).then(()=>console.log('connection started')).catch(()=>console.log('connection not started'));
}

module.exports = {
    connectionmongoDB
};