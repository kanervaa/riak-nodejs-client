/*
 * Copyright 2015 Basho Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var rpb = require('../../protobuf/riakprotobuf');
var inherits = require('util').inherits;
var Joi = require('joi');

var StorePropsBase = require('./storepropsbase');

/**
 * Provides the StoreBucketProps class, its builder, and its response.
 * @module KV
 */

/**
 * Command used to set the properties on a bucket in Riak.
 *
 * As a convenience, a builder class is provided:
 *
 *     var storeProps = new StoreBucketProps.Builder()
 *                  .withBucket('my-bucket')
 *                  .withAllowMult(true)
 *                  .build();
 *
 * See {{#crossLink "StoreBucketProps.Builder"}}StoreBucketProps.Builder{{/crossLink}}
 *
 * @class StoreBucketProps
 * @constructor
 * @param {Object} options The properties to store
 * @param {String} options.bucket The bucket in riak.
 * @param {String} [options.bucketType] The bucket type in riak. If not supplied 'default is used'
 * @extends StorePropsBase
 */
function StoreBucketProps(options, callback) {
    StorePropsBase.call(this, options, 'RpbSetBucketReq', 'RpbSetBucketResp', callback);
    var self = this;
    Joi.validate(options, schema, { allowUnknown: true }, function(err, options) {
        if (err) {
            throw err;
        }
        self.options = options;
    });
}

inherits(StoreBucketProps, StorePropsBase);

StoreBucketProps.prototype.constructPbRequest = function() {
    var protobuf = StoreBucketProps.super_.prototype.constructPbRequest.call(this); 
    protobuf.setBucket(new Buffer(this.options.bucket));
    protobuf.setType(new Buffer(this.options.bucketType));
    return protobuf;
};

var schema = Joi.object().keys({
    bucket: Joi.string().required(),
    bucketType: Joi.string().default('default')
});

/**
 * A builder for constructing StoreBucketProps instances
 *
 * Rather than having to manually construct the __options__ and instantiating
 * a StoreBucketProps directly, this builder may be used.
 *
 *     var storeProps = new StoreBucketProps.Builder()
 *                  .withAllowMult(true)
 *                  .build();
 *
 * @class StoreBucketProps.Builder
 * @constructor
 */
function Builder() {
    StorePropsBase.Builder.call(this);
    this.precommit = [];
    this.postcommit = [];
}

inherits(Builder, StorePropsBase.Builder);

/**
 * Set the bucket.
 * @method withBucket
 * @param {String} bucket the bucket in Riak
 * @chainable
 */
Builder.prototype.withBucket = function(bucket) {
    this.bucket = bucket;
    return this;
};

/**
 * Construct a StoreBucketProps instance.
 * @method build
 * @return {StoreBucketProps}
 */
Builder.prototype.build = function() {
    var cb = this.callback;
    delete this.callback;
    return new StoreBucketProps(this, cb);
};

module.exports = StoreBucketProps;
module.exports.Builder = Builder;
