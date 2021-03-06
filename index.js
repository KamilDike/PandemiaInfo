const functions = require('firebase-functions');
const express = require('express');
const loadInfections = require('./service/LoadInfections');
const loadRestrictions = require('./service/LoadRestrictions');
const { admin } = require('./config/firebase');
const app = express();

app.get('/infections', async (req, res) => {
    const infectionsRef = admin.firestore().collection('HistoriaZarażen').doc('obecnie').collection('Zarażenia');
    const snapshot = await infectionsRef.get();
    if (!snapshot.empty) {
        let response = []
        snapshot.forEach(doc => {
            response.push(doc.data())
        });
        res.json(response)
    } else {
        res.json('Maintenance.')
    }
})

app.get('/restrictions', async (req, res) => {
    const restrictionsRef = admin.firestore().collection('Restrictions');
    const snapshot = await restrictionsRef.get();
    if (!snapshot.empty) {
        let Restrictions = []
        snapshot.forEach(doc => Restrictions.push(doc.data()))
        res.json(Restrictions)
    }
})

exports.scheduledInfections = functions.region('europe-west3').pubsub.schedule('31 10 * * *').timeZone('Europe/Warsaw').onRun((context) => {
    loadInfections()
})

exports.scheduledRestrictions = functions.region('europe-west3').pubsub.schedule('0 0-23 * * *').onRun((context) => {
    loadRestrictions()
})

exports.app = functions.region('europe-west3').https.onRequest(app);