const codeInput = document.getElementById('code')
const scaleInput = document.getElementById('scale')
const urlInput = document.getElementById('url')
const previewImage = document.getElementById('preview-image')
const generateButton = document.getElementById('generate-button')
const ungenerateButton = document.getElementById('ungenerate-button')

function bind() {
  const code = codeInput.value
  const scale = scaleInput.valueAsNumber

  const imageUrl = `${location.origin}/eq${scale === 1.0 ? '' : scale}/${encodeURI(code)}`
  urlInput.value = imageUrl
  previewImage.src = imageUrl
}

bind()

generateButton.addEventListener('click', () => {
  bind()
})

ungenerateButton.addEventListener('click', () => {
  const m = urlInput.value.match(/\/eq(\d+(?:\.\d*)?)?\/(.+)/)
  if (m == null) return
  const scale = parseFloat(m[1] || '1.0')
  const equation = decodeURI(m[2])
  scaleInput.value = String(scale)
  codeInput.value = equation
})
