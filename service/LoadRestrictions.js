const cheerio = require('cheerio')
const axios = require('axios')
const Restriction = require('../models/Restriction.js')
const { admin } = require('../config/firebase');
const findCategory = require('./FindCategory.js');

const url = "https://www.gov.pl/web/koronawirus/aktualne-zasady-i-ograniczenia"

const loadRestrictions = (req = '') => {
    axios.get(url).then(async (res) => {
        let Restrictions = [];
        const $ = cheerio.load(res.data);

        let titles = [];
        $('#main-content').find('.editor-content > h3').each((i, el) => {
            titles.push($(el).text())
        })

        let contents = [];
        let contentsHtml = [];
        $('#main-content').find('.editor-content > div').each((i, el) => {
            contents.push($(el).text())
            contentsHtml.push($(el).html())
        })

        if (contents.length === titles.length) {
            titles.forEach((title, index) => {
                Restrictions.push(new Restriction(title, contents[index], contentsHtml[index]))
            });

            let oldRestrictions = await getRestrictions()
            await compareRestrictions(oldRestrictions, Restrictions)
            let currentRestrictions = await getRestrictions()
            findCategory(currentRestrictions)
            if (req) {
                req.json(currentRestrictions);
            }
        } else {
            console.log('Scrape error.')
        }
        return;
    }).catch(err => {
        console.log(err)
    })
}

const getRestrictions = async () => {
    const previousRestrictions = [];
    const restrictionsRef = admin.firestore().collection("Restrictions");
    const snapshot = await restrictionsRef.get();
    snapshot.forEach(doc => {
        previousRestrictions.push(doc.data())
    });
    return previousRestrictions;
}

const compareRestrictions = async (oldRestrictions, newRestrictions) => {
    newRestrictions.forEach(newRestriction => {
        if (oldRestrictions) {
            let foundRestriction = oldRestrictions.find(oldRestriction => { return newRestriction.name === oldRestriction.name });
            if (!foundRestriction) {
                addRestriction(newRestriction)
            } else {
                if (foundRestriction.text !== newRestriction.text) {
                    addRestriction(newRestriction)
                }
            }
        } else {
            addRestriction(newRestriction)
        }
    })

    oldRestrictions.forEach((oldRestriction) => {
        let foundRestriction = newRestrictions.find(newRestriction => { return oldRestriction.text === newRestriction.text })
        if (!foundRestriction) {
            deleteRestriction(oldRestriction)
        }
    })
}

const addRestriction = async (Restriction) => {
    const Res = {
        name: Restriction.name,
        html: Restriction.html,
        text: Restriction.text,
        date: Restriction.date,
    }
    await admin.firestore().collection("Restrictions").doc(Restriction.name).set(Res);
}

const deleteRestriction = async (Restriction) => {
    await admin.firestore().collection("Restrictions").doc(Restriction.name).delete();
}
  

module.exports = loadRestrictions;