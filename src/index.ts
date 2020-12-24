import express from 'express'
import { createServer } from 'http'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { exec } from 'child_process'
import { deferrableAsync } from './utils/deferrable'

const errorImage = `
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18" viewBox="0 0 60 18">
  <rect x="0" y="0" width="60" height="18" fill="#f00" />
  <text x="10" y="12" font-family="sans-serif" font-size="15" fill="#fff">error</text>
</svg>
`

function makeTexCode(equation: string, scale: number): string {
  return `
    \\documentclass{extarticle}
    \\usepackage[a2paper,landscape]{geometry}
    \\usepackage{graphics}
    \\usepackage{amsmath,amssymb}
    \\begin{document}
    \\pagestyle{empty}
      \\scalebox{${scale}}{$
        \\displaystyle ${equation}
      $}
    \\end{document}
  `
}

const port = ((p) => (p != null ? parseInt(p, 10) : 8000))(process.env.PORT)
const app = express()

app.use(express.static('public'))

async function generateImage(equation: string, scale: number): Promise<string> {
  const baseDir = path.join(os.tmpdir(), 'lalalatex-')
  return await deferrableAsync(async (defer) => {
    const tmpDir = await fs.mkdtemp(baseDir)
    defer(() => fs.rm(tmpDir, { recursive: true, force: true }))

    const inputFile = path.join(tmpDir, 'input.tex')
    const f = await fs.open(inputFile, 'w')
    defer(() => f.close())
    await f.write(makeTexCode(equation, scale * 1.5))

    await new Promise<void>((resolve, reject) => {
      exec(
        `bash -c 'cd ${tmpDir} && pdflatex -interaction=nonstopmode input.tex && pdfcrop input.pdf cropped.pdf && pdf2svg cropped.pdf output.svg'`,
        (error, _, stderr) => {
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
    defer(() => svgFile.close())

    const content = await svgFile.readFile()
    return content.toString()
  })
}

app.get(/\/eq((?:\d+(?:\.\d*)?)?)\/(.*)/, async (req, res) => {
  const scale = parseFloat(req.params[0] || '1.0')
  const equation = req.params[1]
  const content = await generateImage(equation, scale).catch(() => errorImage)
  res.contentType('image/svg+xml')
  res.set('Cache-Control', `public, max-age=${60 * 60 * 24 * 1}`)
  res.send(content)
})

const server = createServer(app)
server.listen(port)
