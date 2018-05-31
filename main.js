const readline = require('readline');
const model = require('./model');
const cmds=require('./cmds');
const {log, biglog, errorlog, colorize} = require('./out');


biglog("CORE Quiz", "green");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorize('quiz> ', 'blue'),
    completer: (line) => {
        const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
        const hits = completions.filter((c) => c.startsWith(line));
        // show all completions if none found
        return [hits.length ? hits : completions, line];
    }
});

rl.prompt();

rl.on('line', (line) => {

    let args = line.split(" ");
    let cmd = args[0].toLowerCase().trim();

    switch (cmd) {
        case '':
            rl.prompt();
            break;

        case 'h':
        case 'help':
            cmds.helpCmd(rl);

            break;

        case 'list':
            cmds.listCmd(rl);
            break;

        case `show`:
            cmds.showCmd(rl,args[1]);
            break;
        case 'add':
            cmds.addCmd(rl);
            break;
        case 'edit':
            cmds.editCmd(rl,args[1]);
            break;
        case 'delete':
            cmds.deleteCmd(rl,args[1]);
            break;
        case 'test':
            cmds.testCmd(rl, args[1]);
            break;
        case 'play':
            cmds.playCmd(rl);
            break;
        case 'credits':
            cmds.creditCmd(rl);
            break;
        case 'q':
        case 'quit':
            console.log("ciao");
            rl.close();
            break;

        default:
            log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
            console.log(`use help`);
            break;
    }
    rl.prompt();

})
    .on('close', () => {
        log('Adios qliao', 'yellow');
        process.exit(0);
    });



