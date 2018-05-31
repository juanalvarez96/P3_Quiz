const readline = require('readline');
const model = require('./model');
const cmds=require('./cmds');
const {log, biglog, errorlog, colorize} = require('./out');
const net = require('net');

//Lo que va a hacer cada vez que se conecte un cliente
net.createServer(socket => {
    console.log("Se ha conectado un cliente desde"+ socket.remoteAddress);

    biglog(socket,"CORE Quiz", "green");

    const rl = readline.createInterface({
        input: socket,
        output: socket,
        prompt: colorize('quiz> ', 'blue'),
        completer: (line) => {
            const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
            const hits = completions.filter((c) => c.startsWith(line));
            // show all completions if none found
            return [hits.length ? hits : completions, line];
        }
    });

    socket
        .on("end", ()=>{
            rl.close();
        })
        .on("error", ()=>{
            rl.close();
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
                cmds.helpCmd(socket, rl);

                break;

            case 'list':
                cmds.listCmd(socket, rl);
                break;

            case `show`:
                cmds.showCmd(socket, rl,args[1]);
                break;
            case 'add':
                cmds.addCmd(socket, rl);
                break;
            case 'edit':
                cmds.editCmd(socket, rl,args[1]);
                break;
            case 'delete':
                cmds.deleteCmd(socket, rl,args[1]);
                break;
            case 'test':
                cmds.testCmd(socket, rl, args[1]);
                break;
            case 'play':
                cmds.playCmd(socket, rl);
                break;
            case 'credits':
                cmds.creditCmd(socket, rl);
                break;
            case 'q':
            case 'quit':
                console.log("ciao");
                rl.close();
                break;

            default:
                log(socket,`Comando desconocido: '${colorize(cmd, 'red')}'`);
                socket.write(`use help \n`);
                break;
        }
        rl.prompt();

    })
        .on('close', () => {
            log(socket,'Adios qliao', 'yellow');
            process.exit(0);
        });
})

.listen(3030);




