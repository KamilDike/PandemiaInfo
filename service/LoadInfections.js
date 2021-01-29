const axios = require('axios')
const { admin } = require('../config/firebase');
const parse = require('csv-parse')

const config = {
    "t00": "Cały kraj",
    "t02": "dolnośląskie",
    "t12": "małopolskie",
    "t28": "warmińsko-mazurskie",
    "t24": "śląskie",
    "t26": "świętokrzyskie",
    "t10": "łódzkie"
}

const loadInfections = async (req = '') => {
    let csvData = 'https://arcgis.com/sharing/rest/content/items/829ec9ff36bc45a88e1245a82fff4ee0/data';

    axios.get(csvData).then(async (res) => {
        const parser = parse({ delimiter: ';' })
        let output = [];
        parser.on('readable', () => {
            let record;
            while ((record = parser.read()) !== null) {
                output.push(record)
            }
        })
        parser.write(res.data)
        parser.end()
        let response = await addInfections(output);
        if (req) {
            req.json(response)
        }
        return;
    }).catch(err => {
        console.log(err)
    })
}

const addInfections = (data) => {
    let Infections = []
    for (const voivodeship of data.slice(1)) {
        let Infection = {};
        voivodeship.forEach((element, index) => {
            Infection[data[0][index]] = element
        });
        if (config[Infection.teryt]) {
            Infection.wojewodztwo = config[Infection.teryt];
        }
        Infections.push(Infection)
    }

    Infections.forEach(element => {
        admin.firestore().collection('HistoriaZarażen').doc('obecnie').collection('Zarażenia').doc(element['wojewodztwo']).set(element)
    });
    return Infections;
}

module.exports = loadInfections;