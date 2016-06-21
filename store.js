var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

function Store(opts){
    var self = this;

    self.mongo_url = opts.mongo_url;
};

Store.prototype.fetchPersistedTickets = function(storeName){
    var self = this;

    return new Promise(function(resolve, reject) {
        MongoClient.connect(self.mongo_url, function(err, db){
            if(err) {
                reject(err);
                return;
            }

            db.collection('tickets').find({ name: storeName }).limit(1).next(function(err, storeTickets){
                if(err) {
                    reject(err);
                    return;
                }

                resolve(storeTickets.tickets);
                db.close();
            });
        });
    });
};

Store.prototype.persistTicketsIn = function(storeName, tickets) {
    var self = this;

    return new Promise(function(resolve, reject) {
        MongoClient.connect(self.mongo_url, function(err, db){
            if(err) {
                reject(err);
                return;
            }

            db.collection('tickets').updateOne({ name: storeName }, { $set: { name: storeName, tickets: tickets } }, function(err, r){
                if(err) {
                    reject(err);
                    return;
                }

                resolve();
                db.close();
            });
        });
    });
};

module.exports = Store;