import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.memsurf.com/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path, 'DELETE')
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Use the actual request method, not the handler method (in case of redirects)
    const actualMethod = request.method
    const path = pathSegments.join('/')
    // Construct URL - use pathSegments to avoid redirect issues
    let urlPath = path
    // Add trailing slash for API consistency (Django REST framework expects it)
    if (!urlPath.endsWith('/')) {
      urlPath += '/'
    }
    const url = `${API_BASE_URL}/${urlPath}`
    
    console.log(`[Proxy] ${actualMethod} ${url} (handler: ${method})`)
    
    // Get the body if it exists
    let body = null
    if (actualMethod !== 'GET' && actualMethod !== 'DELETE') {
      try {
        body = await request.text()
        console.log(`[Proxy] Body length:`, body?.length || 0)
      } catch {
        // No body
      }
    }

    // Get headers from request
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Forward relevant headers, but skip host and connection
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })

    // Make the request to the backend - use actual method
    const response = await fetch(url, {
      method: actualMethod,
      headers,
      body: body || undefined,
    })

    // Get response data
    const contentType = response.headers.get('content-type')
    let data: any = null
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Create response with CORS headers
    const nextResponse = NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
    })

    // Add CORS headers
    nextResponse.headers.set('Access-Control-Allow-Origin', '*')
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Copy relevant headers from backend response
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-type') {
        nextResponse.headers.set(key, value)
      }
    })

    return nextResponse
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error.message || 'Proxy request failed' },
      { status: 500 }
    )
  }
}

