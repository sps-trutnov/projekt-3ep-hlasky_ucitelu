const bcrypt = require('bcryptjs');
const { request } = require('express');
const jsondb = require('simple-json-db');
const { use } = require('../routers/uzivatelRouter');
const db = new jsondb('./data/uzivatele.json');

exports.pridatUzivatele = (jmeno, email, hashleHeslo) => {
    if(db.has(jmeno)) {
        return false;
    }
    
    db.set(jmeno, {
        heslo: hashleHeslo,
        email: email,
    });

    if(!db.has(jmeno)) {
        return false;
    }

    return true;
}

exports.existujeEmail = (zadanyEmail) => {
    const data = db.JSON();
    const uzivatele = Object.keys(data);

    let existuje = false;

    uzivatele.every(uzivatel => { // every se chová stejně jako forEach ale běží jenom dokuď se returnuje true.
                                  // tohle dělám abych nemusel prohledá vat celý list abych našel dublikat.
                                  // pry nejde z forEach se breaknout.
        email = data[uzivatel]["email"];
        console.log(email);

        if (email.includes(zadanyEmail)){
            console.log("INCLUDES");
            existuje = true; // chtěl jsem sem dát return true aby search byl rychlejší ale to prý nejde -_-
            return false //break
        }

        return true; // aby se nezastavil po 1 iteraci
    });
    return existuje;
}

exports.existujeUzivatel = (jmeno) => {
    let db_data = db.JSON();
    let existuje = false;
    Object.keys(db_data).forEach((entry) => {
        if(jmeno.toLowerCase() == entry.toLowerCase()){
            existuje = entry;
        }
    })
    return existuje;
}

exports.nacistUzivatele = (jmeno) => {
    let db_data = db.JSON();
    let uzivatel = undefined;
    Object.keys(db_data).forEach((entry) => {
        if(jmeno.toLowerCase() == entry.toLowerCase()){
            uzivatel = db_data[entry];
        }
    })
    return uzivatel;
}

exports.spravneHeslo = (jmeno, heslo) => {
    const uzivatel = exports.nacistUzivatele(jmeno);

    return bcrypt.compareSync(heslo, uzivatel.heslo);
}

exports.ulozitHighScore = (jmeno, score) => {
    if (jmeno==undefined||score==undefined){
        console.log("nedostatek argumentů.");} // chybová hláška

    let data = db.JSON()[jmeno];

    if (data.score == undefined){
        data.score = 0;
        db.set(jmeno, data); //ukládání do DB
    }

    if (data.score < score){
        data.score = score;
        db.set(jmeno, data);
    }
}
exports.getHighScore = (jmeno) => {
    if (jmeno==undefined){
    console.log("nedostatek argumentů.");} // chybová hláška

    let data = db.JSON()[jmeno];

    if (data.score == undefined){
        return 0;
    }
    
    return data.score;
}

exports.getAllHighScore = () => {
    const data = db.JSON();
    const uzivatele = Object.keys(data);

    let scores = [];
    let users = [];

    for(let i = 0; i <= uzivatele.length - 1; i++){
        if (data[uzivatele[i]].score != undefined){
            scores.push(data[uzivatele[i]].score);
            users.push(uzivatele[i]);
        }
    }

    return [scores, users];

}

exports.ulozitOblibenouHlasku = (jmeno, hlaska) => {
    if (jmeno==undefined||hlaska==undefined){
    console.log("nedostatek argumentů.");} // chybová hláška

    let data = db.JSON()[jmeno];

    if (data.oblibeneHlasky == undefined){
        data.oblibeneHlasky = [];
        db.set(jmeno, data);
    }
    if (!data.oblibeneHlasky.includes(hlaska)){
        data.oblibeneHlasky.push(hlaska);
        db.set(jmeno, data);
    }

}

exports.getOblibenyHlasky = (jmeno) => {
    let data = db.JSON()[jmeno];
    let hlasky;

    if (data.oblibeneHlasky == undefined){
        hlasky = ["Nic Tady Není!"];
    }
    else{
        hlasky = data.oblibeneHlasky;
    }

    return hlasky;
}
