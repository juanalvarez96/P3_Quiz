const fs = require("fs");
const DB_FILENAME = "quizzes.json";


let quizzes = [
    {
        question: "Capital España",
        answer: "Madrid"
    },
    {
        question: "Capital de EEUU",
        answer: "Washington"
    }
];

const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if (err) {

            //Si no existe el fichero
            if (err.code === "ENOENT") {
                save();
                return;
            }
            throw err;

        }

        let json = JSON.parse(data);

        if (json) {
            quizzes = json;
        }
    })
};

const save = () => {

    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes),
        err => {
            if (err) throw err;
        });
};

exports.count = () => {xs
    quizzes.length
};

exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

exports.deleteByIndex = (id) => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error("Valor de Id no válido");
    }
    quizzes.splice(id, 1);
    save();

};

exports.update = (id, question, answer) => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error("Valor de Id no válido");
    }
    quizzes.splice(id, 1, {
        question: (question || " ").trim(),
        answer: (answer || " ").trim()
    });
    save();

};

exports.getAll = () => {
    return JSON.parse(JSON.stringify(quizzes));

};

exports.getByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error("Parámetro incorrecto");
    }
    return JSON.parse(JSON.stringify(quiz));
};
load();