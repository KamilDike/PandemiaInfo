const { admin } = require('../config/firebase');
const sendMessage = require('./Messaging');

const findCategory = async (Restrictions) => {
    const categoriesRef = admin.firestore().collection('Categories');
    const snapshot = await categoriesRef.get()

    let RestrictionsCategories = new Array(Restrictions.length)
    for (let i = 0; i < RestrictionsCategories.length; i++) { 
        RestrictionsCategories[i] = new Array();
    } 

    snapshot.forEach((doc) => {
        const tags = doc.data().tags;
        const category = doc.data().name;
        let notifications = [];

        Restrictions.forEach((Restriction, index) => {
            let text = Restriction.text.toLowerCase();
            let categorized = false;

            for (let i = 0; i < tags.length; i++) {
                if (text.indexOf(tags[i]) !== -1) {
                    if (!categorized) {
                        const now = Date.now().toLocaleString().split(',').slice(0, 4).join('')
                        let timeDif = Math.round((now - Restriction.date.seconds) / 60)
                        if (timeDif < 5) {
                            notifications.push(category)
                        }
                        RestrictionsCategories[index].push(category);
                    }
                    categorized = true;
                }
            }

        })

        notifications = [...new Set(notifications)];
        notifications.forEach(notification => {
            console.log(`powiadomienie ${notification}`)
            sendMessage(notification)
        })
    })
    RestrictionsCategories.forEach((el,index) => setCategories(Restrictions[index], el))
}

// const addRestriction = async (Restriction, category) => {
//     await admin.firestore().collection(category).doc(Restriction.name).set(Restriction);
// }

const setCategories = async (Restriction, categoriesList) => {
    await admin.firestore().collection('Restrictions').doc(Restriction.name).update({
        categories: categoriesList
    })
}

module.exports = findCategory;