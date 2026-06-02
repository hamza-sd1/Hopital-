import { existsSync } from 'node:fs'
import net from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDir = resolve(__dirname, '..')
const backendDir = resolve(frontendDir, '..', 'backend')
const host = '127.0.0.1'
const backendPort = 8000
const xamppPhp = 'C:\\xampp\\php\\php.exe'
const phpBin = existsSync(xamppPhp) ? xamppPhp : 'php'
const viteBin = resolve(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js')

const children = new Set()

function isPortOpen(port, hostName) {
  return new Promise((resolvePort) => {
    const socket = net.createConnection({ port, host: hostName })

    socket.once('connect', () => {
      socket.end()
      resolvePort(true)
    })

    socket.once('error', () => {
      resolvePort(false)
    })

    socket.setTimeout(800, () => {
      socket.destroy()
      resolvePort(false)
    })
  })
}

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  })

  children.add(child)
  child.once('exit', () => children.delete(child))

  return child
}

function stopChildren() {
  for (const child of children) {
    child.kill()
  }
}

process.once('SIGINT', () => {
  stopChildren()
  process.exit(130)
})

process.once('SIGTERM', () => {
  stopChildren()
  process.exit(143)
})

const backendAlreadyRunning = await isPortOpen(backendPort, host)

if (backendAlreadyRunning) {
  console.log(`Laravel deja lance sur http://${host}:${backendPort}`)
} else {
  console.log(`Demarrage de Laravel sur http://${host}:${backendPort}`)
  run(phpBin, ['artisan', 'serve', `--host=${host}`, `--port=${backendPort}`], {
    cwd: backendDir,
    stdio: 'ignore',
  })
}

console.log('Demarrage du frontend Vite')
const frontend = run(process.execPath, [viteBin], {
  cwd: frontendDir,
})

frontend.once('exit', (code) => {
  stopChildren()
  process.exit(code ?? 0)
})
