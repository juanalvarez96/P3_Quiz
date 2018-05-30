const readline = require('readline');
const model = require('./model');
const {log, biglog, errorlog, colorize} = require('./out');


exports.helpCmd = () => {
    console.log('Comandos');
    console.log(" h|help - Mostrar ayuda");
    console.log(" list - listar quizzes");
    console.log(" show <id> - Muestra pregunta y respuesta");
    console.log("add - añadir nuevo quiz");
    console.log("delete <id> - Borrar");
    console.log("edit <id> - editar quiz");
    console.log("p|play - Empezar a juagr");
    console.log("credits - creditos");
    console.log("q|quit - largarse");
};

exports.listCmd = (rl) => {
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question}`)
    });
    rl.prompt();
};

exports.creditCmd = (rl) => {
    console.log("Practica realizada por juan");
    rl.prompt();
};

exports.playCmd = (rl) => {

    let score = 0;

    let toBeResolved = []; //Array para las preguntas que no estan resueltas. Se guradan los ids
    //Ids de las preguntas
    for (i = 0; i < model.getAll().length; i++) {
        toBeResolved[i] = i;
    }

    const playOne = () => {
        if (toBeResolved.length === 0) {
            log("Ya no quedan mas preguntas");
            log("Su resultado: " + score);
            biglog(score,"green");
            rl.prompt();
        } else {
            let indice = Math.floor(Math.random() * toBeResolved.length);
            let id = toBeResolved[indice];
            toBeResolved.splice(indice, 1);
            let quiz = model.getByIndex(id);
            rl.question(quiz.question + "?  ", respuesta => {
                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    score++;
                    log("CORRECTO - LLeva "+ score + " aciertos");
                    biglog(score,"green");
                    playOne();
                }
                else {
                    log("INCORRECTO - Fin del juego. Aciertos "+ score);
                    biglog(score, "green");

                }
                rl.prompt();
            });

        }
    };
    playOne();

};

exports.addCmd = (rl) => {
    rl.question(colorize('Introduzca pregunta: ', 'red'), question => {
        rl.question(colorize('Introduzca respuesta: ', 'red'), answer=>{
            model.add(question,answer);
            log("Añadido");
            rl.prompt();
        })
    });

};

exports.editCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`)
    } else {
        try {
            rl.question(colorize('Introduzca pregunta: ', 'red'), question => {
                rl.question(colorize('Introduzca respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log("Modificado");
                    rl.prompt();
                })
            })

        } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
    }

};

exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`)
    } else {
        try {
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};

exports.showCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id.`)
    } else {
        try {
            var quiz = model.getByIndex(id);
            log(` ${colorize(quiz.question, 'red')}: ${colorize(quiz.answer, "black")}`);
        } catch(error) {
            errorlog(error.message);
        }
        }
    rl.prompt();
};

exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    } else {
        try {
            const quiz = model.getByIndex(id);
            rl.question(quiz.question + "?  ", respuesta => {
                if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                    log("Su respuesta es correcta")
                    biglog("CORRECTO", "green");
                }
                else {
                    log("Su respuesta es incorrecta")
                    biglog("INCORRECTO", "red");
                }
                rl.prompt();
            });
        } catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

