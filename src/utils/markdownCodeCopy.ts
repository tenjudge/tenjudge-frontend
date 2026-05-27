export function installMarkdownCodeCopy() {
  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const button = target.closest<HTMLButtonElement>('.markdown-code-block__copy')
    if (!button) return

    const code = button.dataset.code
    if (!code) return

    void navigator.clipboard?.writeText(code).then(() => {
      button.dataset.copied = 'true'
      window.setTimeout(() => {
        delete button.dataset.copied
      }, 1200)
    })
  })
}
