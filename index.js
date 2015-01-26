/*jslint node: true, browser: true, nomen: true, todo: true */
'use strict';

var nano    = require('nano')('http://user:password@127.0.0.1:5984'),
    adb     = nano.db.use('artendb'),
    _       = require('underscore'),
    docs    = [],
    bulk    = {};

adb.view('artendb', 'all_docs', {
    'include_docs': true
}, function (err, body) {
    if (!err) {
        _.each(body.rows, function (row) {
            var doc = row.doc;
            if (doc.Eigenschaftensammlungen) {
                _.each(doc.Eigenschaftensammlungen, function (es) {
                    if (es.Eigenschaften && (es.Eigenschaften['Bindung an TWW'] || es.Eigenschaften['Bindung an TWW'] === 0) && (es.Eigenschaften['Artwert AP TWW'] || es.Eigenschaften['Artwert AP TWW'] === 0) && !es.Eigenschaften['Punkte für unerwünscht']) {
                        es.Eigenschaften['Artwertberechnung verwendeter Artwert'] = es.Eigenschaften['Artwert AP TWW'] - es.Eigenschaften['Bindung an TWW'];
                        delete es.Eigenschaften.Artwert;
                        docs.push(doc);
                    }
                });
            }
        });
        // bulk-Format aufbauen
        bulk.docs = docs;
        // alle Updates in einem mal durchführen
        adb.bulk(bulk);
        console.log(docs.length + ' Objekte aktualisiert');
    } else {
        console.log('err: ', err);
    }
});