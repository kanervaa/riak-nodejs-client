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

var Test = require('../testparams');
var ListKeys = require('../../../lib/commands/kv/listkeys');
var StoreValue = require('../../../lib/commands/kv/storevalue');
var RiakNode = require('../../../lib/core/riaknode');
var RiakCluster = require('../../../lib/core/riakcluster');
var assert = require('assert');

describe('ListKeys - Integration', function() {
   
    this.timeout(60000);
   
    var cluster;
    var totalKeyCount = 50;
    var listKeysPrefix = 'listKeysPrefix_';
    
    before(function(done) {
        var nodes = RiakNode.buildNodes(Test.nodeAddresses);
        cluster = new RiakCluster({ nodes: nodes});
        cluster.start(function (err, rslt) {
            assert(!err, err);
            
            var count = 0;
            var cb = function(err, resp) {
                assert(!err, err);
                count++;
                if (count === totalKeyCount) {
                    done();
                }
            };
            
            for (var i = 0; i < totalKeyCount; i++) {
                // Will create keys
                var key = listKeysPrefix + i;
                var store = new StoreValue.Builder()
                        .withBucket(Test.bucketName)
                        .withKey(key)
                        .withContent('value')
                        .withCallback(cb)
                        .build();
                cluster.execute(store);
            }
        });
    });

    after(function(done) {
        Test.cleanBucket(cluster, 'default', Test.bucketName, done);
    });
    
    it('should list keys in the default type', function(done) {
        var keyCount = 0;
        var callback = function(err, resp) {
            assert(!err, err);
            if (!resp.done) {
                resp.keys.forEach(function (k) {
                    if (k.indexOf(listKeysPrefix) === 0) {
                        keyCount++;
                    }
                });
            } else {
                assert.equal(keyCount, totalKeyCount);
                done();
            }
        };
        var list = new ListKeys.Builder()
                .withBucketType('default')
                .withBucket(Test.bucketName)
                .withCallback(callback)
                .withStreaming(true)
                .build();
        cluster.execute(list);
    });
});
