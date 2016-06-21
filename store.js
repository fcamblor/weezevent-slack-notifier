var Promise = require('bluebird');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var _ = require('lodash');

function Store(opts){
    var self = this;

    self.mongo_url = opts.mongo_url;
};

Store.prototype.fetchPersistedParticipants = function(storeName){
    var self = this;

    return new Promise(function(resolve, reject) {
        MongoClient.connect(self.mongo_url, function(err, db){
            if(err) {
                reject(err);
                return;
            }

            db.collection('participants').find({ name: storeName }).limit(1).next(function(err, storeParticipants){
                if(err) {
                    reject(err);
                    return;
                }

                resolve(storeParticipants);
                db.close();
            });
        });
    });
};

Store.prototype.persistParticipantsIn = function(storeName, participants) {
    var self = this;

    return new Promise(function(resolve, reject) {
        MongoClient.connect(self.mongo_url, function(err, db){
            if(err) {
                reject(err);
                return;
            }

            db.collection('participants').updateOne({ name: storeName }, { $set: {
                name: storeName,
                participants: participants,
                latest_creation: _.max(_.map(participants, 'create_date'))
            } }, function(err, r){
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