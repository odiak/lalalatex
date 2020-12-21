const codeInput = document.getElementById('code')
const scaleInput = document.getElementById('scale')
const urlInput = document.getElementById('url')
const previewImage = document.getElementById('preview-image')
const button = document.getElementById('generate-button')

function bind() {
  const code = codeInput.value
  const scale = scaleInput.valueAsNumber

  const imageUrl = `${location.origin}/eq${scale === 1.0 ? '' : scale}/${encodeURI(code)}`
  urlInput.value = imageUrl
  previewImage.src = imageUrl
}

bind()

button.addEventListener('click', () => {
  bind()
})
