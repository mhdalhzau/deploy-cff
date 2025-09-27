/**
 * Cloudflare Workers entry point for Staff Management System
 * Adapts Express.js application to Workers runtime
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // Handle API routes
      if (url.pathname.startsWith('/api')) {
        return await handleApiRequest(request, env, ctx);
      }
      
      // Handle static assets and SPA routing
      return await handleStaticRequest(request, env, url);
      
    } catch (error) {
      console.error('Workers error:', error);
      return new Response(JSON.stringify({ 
        message: 'Internal Server Error',
        error: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * Handle API requests with Workers-compatible routing
 */
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;
  
  // Initialize D1 database and KV sessions
  const db = env.DB; // D1 database binding
  const sessions = env.SESSIONS; // KV sessions binding
  
  // Extract route parameters
  const pathSegments = pathname.split('/').filter(Boolean);
  const apiSegments = pathSegments.slice(1); // Remove 'api'
  
  // Basic routing logic (adapt from Express routes)
  if (pathname === '/api/health') {
    // Test D1 connection
    let dbStatus = 'not configured';
    if (db) {
      try {
        const result = await db.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"').first();
        dbStatus = `connected (${result.count} tables)`;
      } catch (error) {
        dbStatus = `error: ${error.message}`;
      }
    }
    
    return new Response(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      kv_sessions: sessions ? 'available' : 'not configured'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // User authentication routes
  if (pathname.startsWith('/api/auth')) {
    return await handleAuthRoutes(request, env, apiSegments.slice(1));
  }
  
  // User management routes
  if (pathname.startsWith('/api/user')) {
    return await handleUserRoutes(request, env, apiSegments.slice(1));
  }
  
  // Store management routes
  if (pathname.startsWith('/api/stores')) {
    return await handleStoreRoutes(request, env, apiSegments.slice(1));
  }
  
  // Sales routes
  if (pathname.startsWith('/api/sales')) {
    return await handleSalesRoutes(request, env, apiSegments.slice(1));
  }
  
  // Attendance routes
  if (pathname.startsWith('/api/attendance')) {
    return await handleAttendanceRoutes(request, env, apiSegments.slice(1));
  }
  
  // Payroll routes
  if (pathname.startsWith('/api/payroll')) {
    return await handlePayrollRoutes(request, env, apiSegments.slice(1));
  }
  
  // Cashflow routes
  if (pathname.startsWith('/api/cashflow')) {
    return await handleCashflowRoutes(request, env, apiSegments.slice(1));
  }
  
  // Backup routes
  if (pathname.startsWith('/api/backup')) {
    return await handleBackupRoutes(request, env, apiSegments.slice(1));
  }
  
  // Default 404 for API routes
  return new Response(JSON.stringify({ 
    message: 'API endpoint not found',
    path: pathname 
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle static file requests and SPA routing
 */
async function handleStaticRequest(request, env, url) {
  const pathname = url.pathname;
  
  // Try to serve static file first
  const staticResponse = await serveStaticAsset(pathname);
  if (staticResponse) {
    return staticResponse;
  }
  
  // For SPA routing, serve index.html for non-asset requests
  if (!pathname.includes('.')) {
    return await serveStaticAsset('/index.html');
  }
  
  // 404 for missing assets
  return new Response('Not Found', { status: 404 });
}

/**
 * Serve static assets from bundled files
 */
async function serveStaticAsset(pathname) {
  // This will be handled by the build process
  // For now, return null to indicate asset not found
  return null;
}

/**
 * Authentication route handlers
 */
async function handleAuthRoutes(request, env, segments) {
  const method = request.method;
  const action = segments[0];
  
  if (method === 'POST' && action === 'login') {
    return await handleLogin(request, env);
  }
  
  if (method === 'POST' && action === 'logout') {
    return await handleLogout(request, env);
  }
  
  return new Response(JSON.stringify({ message: 'Auth endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle login with Workers-compatible session management
 */
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        message: 'Email and password required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Query D1 database for user
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        message: 'Database not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Query user by email (preserving varchar UUID ID type)
      const user = await env.DB.prepare('SELECT user_id, email, password, name, role FROM users WHERE email = ?')
        .bind(email)
        .first();
      
      if (!user) {
        return new Response(JSON.stringify({ 
          message: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // TODO: Add password verification (bcrypt)
      // For now, basic check
      if (user.password !== password) {
        return new Response(JSON.stringify({ 
          message: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Create session if KV available
      let sessionId = null;
      if (env.SESSIONS) {
        sessionId = crypto.randomUUID();
        const sessionData = {
          userId: user.user_id, // Preserving varchar UUID type
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: Date.now()
        };
        
        await env.SESSIONS.put(`session:${sessionId}`, JSON.stringify(sessionData), {
          expirationTtl: 24 * 60 * 60 // 24 hours
        });
      }
      
      return new Response(JSON.stringify({
        message: 'Login successful',
        user: {
          id: user.user_id, // varchar UUID preserved
          email: user.email,
          name: user.name,
          role: user.role
        },
        sessionId
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': sessionId ? `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${24*60*60}` : ''
        }
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ 
        message: 'Database error',
        error: dbError.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      message: 'Login failed',
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle logout
 */
async function handleLogout(request, env) {
  return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Placeholder route handlers (to be implemented)
 */
async function handleUserRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'User routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleStoreRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Store routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleSalesRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Sales routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleAttendanceRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Attendance routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePayrollRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Payroll routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleCashflowRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Cashflow routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleBackupRoutes(request, env, segments) {
  return new Response(JSON.stringify({ 
    message: 'Backup routes ready for implementation',
    segments 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}