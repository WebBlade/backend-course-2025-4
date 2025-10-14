import {Command} from "commander"
import http from "http"
import fs from "fs"

const program = new Command()

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Node.js server!");
});

program
    .name("WebBack-4")
    .description("")
    .version("1.0.0")

program
    .option("-i --input <file>", "Input file path")
    .requiredOption("-h --host <string>", "Server host")
    .requiredOption("-p --port <number>", "Server port")
    .action(options => {
        if (options.input === true || !options.input) {
        console.error("Please, specify input file");
        process.exit(1);
        }

        if(!fs.existsSync(options.input)){
        console.error("Cannot find input file")
        process.exit(1)
        }

        server.listen(options.port,() => {
        console.log(`Server is running on port ${options.port}`)
        })
    })


program.parse(process.args)
const options = program.opts()