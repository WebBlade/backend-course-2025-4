import { Command } from "commander"
import http from "http"
import fs from "fs/promises"
import { XMLBuilder } from "fast-xml-parser"
import { URL } from "url"

const program = new Command()

program
  .name("WebBack-4")
  .description("")
  .version("1.0.0")
  .requiredOption("-p, --port <number>", "Server port")
  .option("-i, --input [file]", "Input JSON file path (iris.json)")
  .requiredOption("-h, --host <string>", "Server host", "localhost")
  .action(async (options) => {
    if (options.input === true || !options.input) {
      console.error("Please, specify input file");
      process.exit(1);
    }

    try {
      await fs.access(options.input);
    } catch (error) {
      console.error("Cannot find input file");
      process.exit(1);
    }

    const builder = new XMLBuilder({
      format: true
    })

    const server = http.createServer(async (req, res) => {
        const requestUrl = new URL(req.url, `http://${options.host}:${options.port}`)
        try {
            const params = requestUrl.searchParams
            const fileContent = await fs.readFile(options.input, "utf-8")
            const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
            let jsonData = lines.map(line => JSON.parse(line))

            const showVariety = params.get('variety') === 'true'
            const minPetalLengthStr = params.get('min_petal_length')
            const minPetalLengthNum = parseFloat(minPetalLengthStr)

            if (!isNaN(minPetalLengthNum)) {
                jsonData = jsonData.filter(flower => {
                    return flower['petal.length'] > minPetalLengthNum
                })
            }

            const mappedData = jsonData.map(flower => {
                const obj = {
                    petal_length: flower['petal.length'],
                    petal_width: flower['petal.width']
                }
            if (showVariety) obj.variety = flower.variety
            
            return obj
            })

        const xmlContent = builder.build({flowers:{ flower: mappedData }})
        res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" })
        res.end(xmlContent)

      } catch (error) {
        res.writeHead(500, { "Content-Type": "text/plain" })
        res.end("Internal Server Error")
      }  
    })

    server.listen(options.port, options.host, () => {
      console.log(`Server is started: http://${options.host}:${options.port}`)
    })

  })

program.parse(process.argv)