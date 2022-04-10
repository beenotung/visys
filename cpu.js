#!/usr/bin/env node
let os = require('os')
let asciichart = require('asciichart')
let hookInput = require('./input')

const maxLength = 2 ** 25
const cutOff = Math.floor(maxLength * 0.9)

function format(x, i) {
  return x.toFixed(0) + '%'
}

let sizeLength = format(99.99).length

function formatWithPadding(x, i) {
  return format(x, i).padStart(sizeLength)
}

function calcUsed(cpu, io) {
  let times = cpu.times
  let total = 0
  for (let type in times) {
    total += times[type]
  }
  io.idle = times.idle
  io.total = total
  return io
}

let lastUsed = os.cpus().map(cpu => calcUsed(cpu, {}))
let currentUsed = lastUsed.map(() => ({}))
let n = lastUsed.length

let colors = [
  asciichart.red,
  asciichart.green,
  asciichart.yellow,
  asciichart.blue,
  asciichart.magenta,
  asciichart.cyan,
  asciichart.lightred,
  asciichart.lightgreen,
  asciichart.lightyellow,
  asciichart.lightblue,
  asciichart.lightmagenta,
  asciichart.lightcyan,
]
colors = lastUsed.map((_, i) => colors[i % colors.length])

let mem = lastUsed.map(() => [])
let sample = []

function report() {
  let cpus = os.cpus()
  for (let i = 0; i < n; i++) {
    let last = lastUsed[i]
    let current = currentUsed[i]
    calcUsed(cpus[i], current)
    let idle = current.idle - last.idle
    let total = current.total - last.total
    if (total == 0) {
      return
    }
    last.idle = current.idle
    last.total = current.total
    let used = ((total - idle) / total) * 100
    let usedList = mem[i]
    usedList.push(used)
  }
  let data
  let width = process.stdout.columns - sizeLength - 2
  if (mem[0].length <= width) {
    data = mem
  } else {
    for (let i = 0; i < n; i++) {
      let m = mem[i]
      let s = sample[i] || (sample[i] = [])
      for (let w = 0; w < width - 1; w++) {
        s[w] = m[Math.floor((w / width) * m.length)]
      }
      if (s.length > width) {
        sample[i] = s.slice(0, width)
      }
      s[width - 1] = m[m.length - 1]
    }
    data = sample
    if (mem[0].length > maxLength) {
      for (let i = 0; i < n; i++) {
        mem[i] = mem[i].slice(-cutOff)
      }
    }
  }
  let text = asciichart.plot(data, {
    min: 0,
    max: 100,
    colors,
    height: process.stdout.rows - 1,
    format: formatWithPadding,
  })
  console.clear()
  process.stdout.write(text)
}
setInterval(report, 1000)

function reset() {
  for (let i = 0; i < n; i++) {
    mem[i] = []
  }
}

hookInput(reset)
