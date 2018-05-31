const readline = require('readline');
const {models} = require('./model');
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
    models.quiz.findAll()
        .each(quiz => {
            log(`[${colorize(quiz.id, 'magenta')}]: ${colorize(quiz.question, 'green')}`)
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();

        });
};

exports.creditCmd = (rl) => {
    console.log("Practica realizada por juan");
    rl.prompt();
};

exports.playCmd = (rl) => {

    let scores = 0;
    let toBeResolved = [];
    models.quiz.findAll()
        .then(quizzes => {
            for (i = 0; i < quizzes.length; i++) {
                toBeResolved[i] = quizzes[i].id;
            }
            playOne(rl, toBeResolved, scores);
        })

};

const createQuestion = (message, rl) => {
    return new Promise((resolve, reject) => {
        if (typeof message === 'undefined') {
            reject(new Error(`Question must be a text`));
        } else {
            rl.question(colorize(message, 'red'), question => {
                resolve(question);
            })
        }

    })
};

exports.addCmd = (rl) => {
    createQuestion("Introduzca nueva pregunta: ", rl)
        .then(q => {
            return createQuestion("Introduzca nueva respuesta: ", rl)
                .then(a => {
                    return {question: q, answer: a}
                })
        })
        .then(quiz => {
            models.quiz.create(quiz);
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        })

};

exports.editCmd = (rl, id) => {
    validateId(id)
        .then(id => {
            return createQuestion(colorize('Introduzca pregunta: ', 'red'), rl)
                .then(q => {
                    return createQuestion(colorize('Introduzca respuesta: ', 'red'), rl)
                        .then(a => {
                            return models.quiz.findById(id)
                                .then(quiz => {
                                    quiz.question = q;
                                    quiz.answer = a;
                                    return quiz;
                                })

                        })
                })
                .then(quiz => {
                    return quiz.save();
                })
                .then(quiz => {
                    log('Quiz modificado correctamente', 'magenta')
                })
        })
        .catch(error => {
            errorlog(error);
        })
        .then(() => {
            rl.prompt();
        })
};

exports.deleteCmd = (rl, id) => {

    validateId(id)
        .then(id => {
            models.quiz.destroy({where: {id}})
        })
        .then(() => {
            rl.prompt();
        });
};

const validateId = id => {
    return new Promise((resolve, reject) => {
        models.quiz.findById(id)
            .then(quiz => {
                if (typeof id === 'undefined') {
                    reject(new Error(`Falta el parámetro <id>`));
                }
                if (!quiz) {
                    reject(new Error("Quiz no encontrado"));
                } else {
                    id = parseInt(id);
                    if (Number.isNaN(id)) {
                        reject(new Error(`EL valor del parámetro <id> no es un número.`));
                    } else {
                        resolve(id);
                    }
                }
            })

    })
};

exports.showCmd = (rl, id) => {

    validateId(id)
        .then(id => {
            models.quiz.findById(id)
                .then(quiz => {
                    log(` ${colorize(quiz.question, 'red')}: ${colorize(quiz.answer, "black")}`);
                    rl.prompt();
                })
        })
        .catch(error => {
            errorlog(error.message);
            rl.prompt();
        })

};

exports.testCmd = (rl, id) => {
    validateId(id)
        .then(id => {
            models.quiz.findById(id)
                .then(quiz => {
                    rl.question(quiz.question + "?  ", respuesta => {
                        if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                            log("Su respuesta es correcta");
                            biglog("CORRECTO", "green");
                        }
                        else {
                            log("Su respuesta es incorrecta");
                            biglog("INCORRECTO", "red");
                        }
                        rl.prompt();
                    });
                })
                .catch(error => {
                    console.log(` Quiz <id> does not exist`);
                    rl.prompt();
                })
        })
        .catch(error => {
            errorlog(error.message);
            rl.prompt();
        })

};

const playOne = (rl, toBeResolved, scores) => {
    if (toBeResolved.length === 0) {
        log("Ya no quedan mas preguntas");
        log("Su resultado: " + scores);
        rl.prompt();
    } else {
        let indice = Math.floor(Math.random() * toBeResolved.length);
        let id = toBeResolved[indice];
        toBeResolved.splice(indice, 1);
        validateId(id)
            .then(id => models.quiz.findById(id))
            .then(quiz => {
                if (!quiz) {
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                createQuestion(` ${quiz.question} ?`, rl)
                    .then(answer => {
                        if (answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase()) {
                            log("Su respuesta es correcta");
                            scores++;
                            biglog("CORRECTO", "green");
                            biglog(scores, "red");
                            playOne(rl, toBeResolved, scores);

                        }
                        else {
                            log("INCORRECTO - Fin del juego. Aciertos "+ scores);
                            rl.prompt();

                        }
                    })
            })


    }


};

