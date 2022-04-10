#!/usr/bin/env node
let os = require('os')
let asciichart = require('asciichart')
let hookInput = require('./input')

const maxLength = 2 ** 25
const cutOff = Math.floor(maxLength * 0.9)

let mem = []
let sample = []

function format(x, i) {
  if (x > 1024 ** 3) {
    return (x / 1024 ** 3).toFixed(1) + 'GB'
  }
  if (x > 1024 ** 2) {
    return (x / 1024 ** 2).toFixed(1) + 'MB'
  }
  if (x > 1024) {
    return (x / 1024).toFixed(1) + 'KB'
  }
  return x + 'B'
}

let sizeLength = format(1023.9 * 1024 ** 2).length

function formatWithPadding(x, i) {
  return format(x, i).padStart(sizeLength)
}

function report() {
  let free = os.freemem()
  let total = os.totalmem()
  let used = total - free
  mem.push(used)
  let data
  let width = process.stdout.columns - sizeLength - 2
  if (mem.length <= width) {
    data = mem
  } else {
    for (let i = 0; i < width - 1; i++) {
      sample[i] = mem[Math.floor((i / width) * mem.length)]
    }
    sample[width - 1] = mem[mem.length - 1]
    if (sample.length > width) {
      sample = sample.slice(0, width)
    }
    data = sample
    if (mem.length > maxLength) {
      mem = mem.slice(-cutOff)
    }
  }
  let text = asciichart.plot(data, {
    min: 0,
    max: total,
    height: process.stdout.rows - 1,
    format: formatWithPadding,
  })
  console.clear()
  process.stdout.write(text)
}

setInterval(report, 1000)

function reset() {
  mem = []
}

hookInput(reset)
