import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { args, state } = body
    
    const openclawDir = '/home/z/my-project/openclaw'
    const openclawScript = path.join(openclawDir, 'openclaw.mjs')
    
    // Build the command
    const cmdArgs = [openclawScript, 'onboard', ...args]
    
    // Execute the command
    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn('node', cmdArgs, {
        cwd: openclawDir,
        env: {
          ...process.env,
          PATH: `${openclawDir}/node_modules/.bin:${process.env.PATH}`,
        },
      })
      
      let stdout = ''
      let stderr = ''
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(stdout + stderr)
        } else {
          reject(new Error(stderr || stdout || `Process exited with code ${code}`))
        }
      })
      
      proc.on('error', (err) => {
        reject(err)
      })
      
      // Timeout after 60 seconds
      setTimeout(() => {
        proc.kill()
        reject(new Error('Command timed out'))
      }, 60000)
    })
    
    return NextResponse.json({ 
      success: true, 
      output,
      state 
    })
    
  } catch (error) {
    console.error('Onboard error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Return current OpenClaw status
  try {
    const openclawDir = '/home/z/my-project/openclaw'
    const openclawScript = path.join(openclawDir, 'openclaw.mjs')
    
    const output = await new Promise<string>((resolve, reject) => {
      const proc = spawn('node', [openclawScript, 'gateway', 'status'], {
        cwd: openclawDir,
        env: {
          ...process.env,
          PATH: `${openclawDir}/node_modules/.bin:${process.env.PATH}`,
        },
      })
      
      let stdout = ''
      let stderr = ''
      
      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      proc.on('close', () => {
        resolve(stdout + stderr)
      })
      
      proc.on('error', (err) => {
        reject(err)
      })
      
      setTimeout(() => {
        proc.kill()
        resolve('Status check timed out')
      }, 10000)
    })
    
    return NextResponse.json({ 
      status: 'available',
      output,
      version: '2026.3.11'
    })
    
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}
