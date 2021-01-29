/*
const restriction = {
    name: 'String',
    text: 'String',
    category: 'Array[String]',
}
*/

class Restriction {

    constructor(name, text, html) {
        this.name = name;
        this.text = text;
        this.html = html;
        this.date = new Date()
    }
}

module.exports = Restriction