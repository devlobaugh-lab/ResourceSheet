# Authentication and Admin System Architecture

## Overview

This document provides a comprehensive overview of the authentication and admin system architecture in the ResourceSheet application, including Supabase integration, security patterns, and admin functionality.

## Table of Contents

1. [Authentication Architecture](#authentication-architecture)
2. [Supabase Integration](#supabase-integration)
3. [Admin System Design](#admin-system-design)
4. [Security Patterns](#security-patterns)
5. [API Authentication Patterns](#api-authentication-patterns)
6. [Frontend Authentication](#frontend-authentication)
7. [Database Security](#database-security)
8. [Common Issues and Solutions](#common-issues-and-solutions)

## Authentication Architecture

### Multi-Client Supabase Setup

The application uses a dual-client approach with Supabase:

```typescript
// lib/supabase.ts
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Anonymous Client (`supabase`)**:
- Used for user authentication and public data access
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publicly accessible)
- Handles cookie-based authentication in Next.js
- Used in frontend components and API routes for user operations

**Admin Client (`supabaseAdmin`)**:
- Used for administrative operations requiring elevated permissions
- Uses `SUPABASE_SERVICE_ROLE_KEY` (server-only, highly privileged)
- Bypasses Row Level Security (RLS) policies
- Used for admin APIs, user management, and system operations

### Authentication Flow

1. **User Login**: Users authenticate through Supabase Auth with email/password
2. **Cookie Storage**: Authentication tokens are stored in HTTP-only cookies
3. **Session Management**: Next.js middleware and API routes validate sessions
4. **Admin Verification**: Admin APIs check user privileges before operations

## Supabase Integration

### Environment Variables

```env
# Required for all Supabase operations
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key

# Required for admin operations (server-only)
SUPABASE_SERVICE_ROLE_KEY=service-role-key

# Optional for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Database Schema

The application uses a multi-table approach for user data:

```sql
-- Core user table (managed by Supabase Auth)
auth.users

-- User profiles with extended information
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  user_type TEXT,  -- 'admin' or 'normal'
  is_admin BOOLEAN, -- Legacy admin flag
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- User-specific data tables
user_drivers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  driver_id INTEGER REFERENCES drivers(id),
  level INTEGER,
  card_count INTEGER
)

user_car_parts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  car_part_id INTEGER REFERENCES car_parts(id),
  level INTEGER,
  card_count INTEGER
)

user_boosts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  boost_id INTEGER REFERENCES boosts(id),
  level INTEGER,
  count INTEGER
)

-- Admin-only tables
boost_custom_names (
  id SERIAL PRIMARY KEY,
  boost_id INTEGER REFERENCES boosts(id),
  custom_name TEXT,
  user_id UUID REFERENCES profiles(id)
)
```

### Row Level Security (RLS)

Database tables use RLS policies to enforce data access:

```sql
-- Users can only access their own data
CREATE POLICY "Users can access own data" ON user_drivers
FOR ALL USING (auth.uid() = user_id);

-- Admins can access all data
CREATE POLICY "Admins can access all data" ON user_drivers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.user_type = 'admin' OR profiles.is_admin = true)
  )
);
```

## Admin System Design

### Admin Privilege Detection

The system supports two methods for detecting admin privileges:

```typescript
// Method 1: user_type column (recommended)
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('user_type')
  .eq('id', user.id)
  .single()

const isAdmin = profile?.user_type === 'admin'

// Method 2: is_admin column (legacy support)
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single()

const isAdmin = profile?.is_admin === true
```

### Admin API Pattern

All admin APIs follow a consistent pattern:

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) { /* handle cookies */ }
        }
      }
    )

    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    // 2. Check admin privileges
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_type, is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.user_type === 'admin' || profile?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }

    // 3. Perform admin operation using supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('some_table')
      .insert({ /* admin operation */ })

    return NextResponse.json({ data })

  } catch (error) {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
```

### Admin Operations

The admin system supports several types of operations:

1. **User Management**: Create, update, delete users
2. **Data Import/Export**: Bulk operations for disaster recovery
3. **Content Management**: Update global data (tracks, boosts, etc.)
4. **Custom Names**: Manage user-specific boost customizations

## Security Patterns

### Authentication Best Practices

1. **Use `getUser()` instead of `session.user`**:
   ```typescript
   // ✅ Secure: Validates session and gets fresh user data
   const { data: { user } } = await supabase.auth.getUser()
   
   // ❌ Insecure: Trusts session data without validation
   const user = session.user
   ```

2. **Cookie-based Authentication**:
   ```typescript
   const supabase = createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       cookies: {
         getAll() { return request.cookies.getAll() },
         setAll(cookiesToSet) { /* set cookies */ }
       }
     }
   )
   ```

3. **Proper Error Handling**:
   ```typescript
   if (authError || !session) {
     return NextResponse.json(
       { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
       { status: 401 }
     )
   }
   ```

### Database Security

1. **Row Level Security**: All tables should have RLS policies
2. **Admin Client Usage**: Only use `supabaseAdmin` for operations requiring elevated permissions
3. **Input Validation**: Always validate and sanitize user inputs
4. **Audit Logs**: Track admin operations for security monitoring

### Client Separation

**Critical Rule**: Never use the admin client for authentication:

```typescript
// ❌ WRONG: Using admin client for authentication
const { data: { user } } = await supabaseAdmin.auth.getUser(token)

// ✅ CORRECT: Use anonymous client for auth, admin client for data
const { data: { user } } = await supabase.auth.getUser()
const result = await supabaseAdmin.from('table').select('*')
```

## API Authentication Patterns

### Public APIs

```typescript
// No authentication required
export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from('public_table').select('*')
  return NextResponse.json(data)
}
```

### User APIs

```typescript
// Requires authentication, user can only access own data
export async function GET(request: NextRequest) {
  const supabase = createServerClient(/* config */)
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('user_table')
    .select('*')
    .eq('user_id', user.id)
  
  return NextResponse.json(data)
}
```

### Admin APIs

```typescript
// Requires authentication and admin privileges
export async function POST(request: NextRequest) {
  // Authenticate user (same as user APIs)
  const supabase = createServerClient(/* config */)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check admin privileges
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }
  
  // Perform admin operation
  const { data, error } = await supabaseAdmin
    .from('table')
    .insert({ /* admin data */ })
  
  return NextResponse.json(data)
}
```

## Frontend Authentication

### AuthContext Provider

```typescript
// components/auth/AuthContext.tsx
export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Check admin status
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, is_admin')
            .eq('id', user.id)
            .single()
          
          const admin = profile?.user_type === 'admin' || profile?.is_admin === true
          setIsAdmin(admin)
        }
        
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Admin Status Hook

```typescript
// hooks/useAdminStatus.ts
export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin-check', {
          credentials: 'same-origin' // Important: includes cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error('Admin check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAdmin()
  }, [])

  return { isAdmin, loading }
}
```

## Database Security

### RLS Policy Examples

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data" ON user_drivers
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON user_drivers
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON user_drivers
FOR UPDATE USING (auth.uid() = user_id);

-- Admins can access all data
CREATE POLICY "Admins can access all data" ON user_drivers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.user_type = 'admin' OR profiles.is_admin = true)
  )
);
```

### Function Security

```sql
-- Secure function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE (
  total_drivers INTEGER,
  total_parts INTEGER,
  total_boosts INTEGER
) SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow users to access their own stats
  IF auth.uid() != user_id THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_drivers WHERE user_id = get_user_stats.user_id),
    (SELECT COUNT(*) FROM user_car_parts WHERE user_id = get_user_stats.user_id),
    (SELECT COUNT(*) FROM user_boosts WHERE user_id = get_user_stats.user_id);
END;
$$;
```

## Common Issues and Solutions

### Issue 1: 403 Forbidden Errors

**Problem**: Admin APIs return 403 errors even when user is authenticated.

**Root Cause**: Using admin client for authentication instead of anonymous client.

**Solution**:
```typescript
// ❌ WRONG
const { data: { user } } = await supabaseAdmin.auth.getUser(token)

// ✅ CORRECT
const { data: { user } } = await supabase.auth.getUser()
```

### Issue 2: Authentication Mismatch

**Problem**: Frontend uses cookie-based auth, backend expects JWT tokens.

**Root Cause**: Inconsistent authentication methods between frontend and backend.

**Solution**: Ensure both frontend and backend use cookie-based authentication:

```typescript
// Frontend: Use credentials: 'same-origin'
fetch('/api/admin', { credentials: 'same-origin' })

// Backend: Use createServerClient with cookie handling
const supabase = createServerClient(/* config with cookies */)
```

### Issue 3: Database Permission Errors

**Problem**: Admin operations fail with permission denied errors.

**Root Cause**: Using anonymous client for operations requiring admin privileges.

**Solution**:
```typescript
// For admin operations, use supabaseAdmin
const { data, error } = await supabaseAdmin
  .from('table')
  .insert({ /* admin data */ })
```

### Issue 4: Session Validation

**Problem**: Using `session.user` directly without validation.

**Root Cause**: `session.user` can be stale or manipulated.

**Solution**: Always use `getUser()` for fresh user data:

```typescript
// ✅ Secure
const { data: { user } } = await supabase.auth.getUser()

// ❌ Insecure
const user = session.user
```

### Issue 5: Admin Privilege Detection

**Problem**: Admin checks fail due to missing or incorrect database columns.

**Root Cause**: Database schema evolution without proper migration.

**Solution**: Support both old and new admin detection methods:

```typescript
// Try new method first
let profile = null
try {
  profile = await supabaseAdmin.from('profiles').select('user_type').eq('id', user.id).single()
} catch (e) {
  // Fall back to old method
  profile = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single()
}

const isAdmin = profile?.user_type === 'admin' || profile?.is_admin === true
```

## Migration Notes

### Legacy Support

The system maintains backward compatibility with the legacy `is_admin` boolean column while supporting the new `user_type` string column:

```sql
-- Legacy column
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- New column
ALTER TABLE profiles ADD COLUMN user_type TEXT DEFAULT 'normal';
```

### Database Cleanup

When migrating to production, consider:

1. **Consolidate admin detection**: Choose one method and migrate all code
2. **Remove legacy columns**: Drop `is_admin` after migration
3. **Update RLS policies**: Ensure policies work with new schema
4. **Test thoroughly**: Verify all admin functionality works

## Security Checklist

- [ ] All admin APIs use anonymous client for authentication
- [ ] Admin APIs use admin client for database operations
- [ ] All APIs validate user authentication before processing
- [ ] Admin privileges are checked before admin operations
- [ ] RLS policies are in place for all tables
- [ ] Input validation is implemented for all user inputs
- [ ] Error messages don't leak sensitive information
- [ ] Admin operations are logged for audit purposes
- [ ] Service role key is never exposed to frontend
- [ ] Cookie-based authentication is used consistently

## Conclusion

The authentication and admin system in ResourceSheet follows security best practices with a clear separation of concerns between authentication (anonymous client) and administrative operations (admin client). The dual-client Supabase setup provides both security and flexibility, while the consistent API patterns ensure maintainability and reliability.

Regular audits and testing should be performed to ensure the system remains secure as the application evolves.