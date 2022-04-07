function hookInput(reset) {
  let input = process.stdin
  input.setRawMode(true)
  input.resume()
  input.on('data', key => {
    // check ctrl-c
    if (key == '\u0003') {
      process.exit()
    }
    let c = key.toString()
    switch (c) {
      case 'r':
      case 'R':
        reset()
        break
      case 'q':
      case 'Q':
        process.exit()
    }
  })
}

module.exports = hookInput
