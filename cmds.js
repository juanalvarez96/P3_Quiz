const readline = require('readline');
const {models} = require('./model');
const {log, biglog, errorlog, colorize} = require('./out');


exports.helpCmd = (socket, rl) => {
    socket.write('Comandos \n');
    socket.write(" h|help - Mostrar ayuda\n");
    socket.write(" list - listar quizzes");
    socket.write(" show <id> - Muestra pregunta y respuesta\n");
    socket.write("add - añadir nuevo quiz\n");
    socket.write("delete <id> - Borrar\n");
    socket.write("edit <id> - editar quiz\n");
    socket.write("p|play - Empezar a juagr\n");
    socket.write("credits - creditos\n");
    socket.write("q|quit - largarse\n");
};

exports.listCmd = (socket, rl) => {
    models.quiz.findAll()
        .each(quiz => {
            log(socket,`[${colorize(quiz.id, 'magenta')}]: ${colorize(quiz.question, 'green')}`)
        })
        .catch(error => {
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();

        });
};

exports.creditCmd = (socket, rl) => {
    socket.write("Practica realizada por juan");
    rl.prompt();
};

exports.playCmd = (socket, rl) => {

    let scores = 0;
    let toBeResolved = [];
    models.quiz.findAll()
        .then(quizzes => {
            for (i = 0; i < quizzes.length; i++) {
                toBeResolved[i] = quizzes[i].id;
            }
            playOne(socket,rl, toBeResolved, scores);
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

exports.addCmd = (socket, rl) => {
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
            errorlog(socket,error.message);
        })
        .then(() => {
            rl.prompt();
        })

};

exports.editCmd = (socket, rl, id) => {
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
                    log(socket,'Quiz modificado correctamente', 'magenta')
                })
        })
        .catch(error => {
            errorlog(socket,error);
        })
        .then(() => {
            rl.prompt();
        })
};

exports.deleteCmd = (socket, rl, id) => {

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

exports.showCmd = (socket, rl, id) => {

    validateId(id)
        .then(id => {
            models.quiz.findById(id)
                .then(quiz => {
                    log(socket,` ${colorize(quiz.question, 'red')}: ${colorize(quiz.answer, "black")}`);
                    rl.prompt();
                })
        })
        .catch(error => {
            errorlog(socket,error.message);
            rl.prompt();
        })

};

exports.testCmd = (socket, rl, id) => {
    validateId(id)
        .then(id => {
            models.quiz.findById(id)
                .then(quiz => {
                    rl.question(quiz.question + "?  ", respuesta => {
                        if (respuesta.toLowerCase().trim() === quiz.answer.toLowerCase()) {
                            log(socket,"Su respuesta es correcta");
                            biglog(socket,"CORRECTO", "green");
                        }
                        else {
                            log(socket,"Su respuesta es incorrecta");
                            biglog(socket,"INCORRECTO", "red");
                        }
                        rl.prompt();
                    });
                })
                .catch(error => {
                    socket.write(` Quiz <id> does not exist`);
                    rl.prompt();
                })
        })
        .catch(error => {
            errorlog(socket,error.message);
            rl.prompt();
        })

};

const playOne = (socket,rl, toBeResolved, scores) => {
    if (toBeResolved.length === 0) {
        log(socket,"Ya no quedan mas preguntas");
        log(socket,"Su resultado: " + scores);
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
                            log(socket,"Su respuesta es correcta");
                            scores++;
                            biglog(socket,"CORRECTO", "green");
                            biglog(socket,scores, "red");
                            playOne(rl, toBeResolved, scores);

                        }
                        else {
                            log(socket,"INCORRECTO - Fin del juego. Aciertos "+ scores);
                            rl.prompt();

                        }
                    })
            })


    }


};

exports.quitCmd = (socket, rl) => {
    rl.close();
    socket.end();
}

