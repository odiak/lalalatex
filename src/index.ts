import express from 'express'
import { createServer } from 'http'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { exec } from 'child_process'

const port = ((p) => (p != null ? parseInt(p, 10) : 8000))(process.env.PORT)
const app = express()

app.get(/\/eq((?:\d+(?:\.\d*)?)?)\/(.*)/, async (req, res) => {
  const scale = parseFloat(req.params[0] || '1.0')
  console.log(scale)
  const equation = req.params[1]
  const baseDir = os.tmpdir()
  const tmpDir = await fs.mkdtemp(baseDir)
  const inputFile = path.join(tmpDir, 'input.tex')
  const f = await fs.open(inputFile, 'w')
  await f.write(`
\\documentclass{extarticle}
\\usepackage{graphics}
\\begin{document}
\\pagestyle{empty}
  \\scalebox{${scale}}{$
    \\displaystyle ${equation}
  $}
\\end{document}
`)
  await f.close()
  await new Promise<void>((resolve, reject) => {
    exec(
      `bash -c 'cd ${tmpDir} && pdflatex -interaction=nonstopmode input.tex && pdfcrop input.pdf cropped.pdf && pdf2svg cropped.pdf output.svg'`,
      (error, stdout, stderr) => {
        if (stderr) {
          console.log(stderr)
        }
        if (error) {
          reject(error)
        }
        resolve()
      }
    )
  })
  const svgFile = await fs.open(path.join(tmpDir, 'output.svg'), 'r')
  const content = await svgFile.readFile()
  await svgFile.close()
  res.contentType('image/svg+xml')
  res.send(content)
})

const server = createServer(app)
server.listen(port)
