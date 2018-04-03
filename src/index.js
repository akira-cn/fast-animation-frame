/* eslint-disable no-undef */
function nowtime() {
  if(typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  } else if(typeof process !== 'undefined' && process.hrtime) {
    const [s, ns] = process.hrtime()
    return s * 1e3 + ns * 1e-6
  }
  return Date.now ? Date.now() : (new Date()).getTime()
}
/* eslint-enable no-undef */

let _requestAnimationFrame,
  _cancelAnimationFrame

if(typeof requestAnimationFrame === 'undefined') {
  _requestAnimationFrame = function (fn) {
    return setTimeout(() => {
      fn(nowtime())
    }, 16)
  }
  _cancelAnimationFrame = function (id) {
    return clearTimeout(id)
  }
} else {
  _requestAnimationFrame = requestAnimationFrame
  _cancelAnimationFrame = cancelAnimationFrame
}

const steps = []
let timerId,
  id = 0

const FastAnimationFrame = {
  requestAnimationFrame(step) {
    steps[++id] = step

    if(timerId == null) {
      timerId = _requestAnimationFrame((t) => {
        timerId = null
        Object.entries(steps).forEach(([id, callback]) => {
          callback(t)
          delete steps[id]
        })
      })
    }
    return id
  },
  cancelAnimationFrame(id) {
    delete steps[id]
    if(!steps.length && timerId) {
      _cancelAnimationFrame(timerId)
      timerId = null
    }
  },
}

module.exports = FastAnimationFrame
