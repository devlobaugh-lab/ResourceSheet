# Main architecture

# Main architecture 

https://chatgpt.com/s/t\_6957405ac6848191aea99160016ba004

eye toward **correctness, cost, and future portability**.

I’ll walk through:

1. **High-level architecture**  
2. **Auth \+ data isolation (RLS)**  
3. **Database design patterns**  
4. **Next.js App Router structure**  
5. **Data access strategy**  
6. **Gotchas to avoid (Supabase \+ Vercel)**

This will give you a concrete mental model you can build from immediately.

---

# **1\. Locked Architecture (Final)**

## **Stack**

* **Frontend**: Next.js (App Router, TypeScript)  
* **Hosting**: Vercel (Free tier)  
* **Backend**: Supabase  
  * Postgres  
  * Auth  
  * Row Level Security  
* **Auth model**: Supabase Auth (email \+ optional OAuth)  
* **Users**: ≤ 100  
* **Cost**: $0/month target

## **Architecture shape**

Browser  
  ↓  
Next.js (Server Components \+ Route Handlers)  
  ↓  
Supabase Client (server-side)  
  ↓  
Postgres \+ RLS

Key decision:

**Most data access happens in Server Components or route handlers, not the browser.**

This reduces:

* Exposed surface area  
* Client complexity  
* Abuse risk

---

# **2\. Auth & Data Isolation (Most Important Part)**

Your requirement:

“Auth exists mainly to identify users and keep data separated.”

Supabase excels here.

---

## **User identity model**

Supabase creates users in:  
auth.users

* 

Each user has:  
auth.uid() :: uuid

* 

You **do not** manage user IDs yourself.

---

## **Table pattern (single-tenant per user)**

Every user-owned table includes:

user\_id uuid not null references auth.users(id)

Example:

create table items (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null references auth.users(id),  
  name text not null,  
  created\_at timestamptz default now()  
);

---

## **Row Level Security (RLS)**

Enable RLS:

alter table items enable row level security;

Add policies:

### **Select**

create policy "Users can read their own items"  
on items  
for select  
using (auth.uid() \= user\_id);

### **Insert**

create policy "Users can insert their own items"  
on items  
for insert  
with check (auth.uid() \= user\_id);

### **Update/Delete**

create policy "Users can modify their own items"  
on items  
for update using (auth.uid() \= user\_id);

create policy "Users can delete their own items"  
on items  
for delete using (auth.uid() \= user\_id);

**Result**

* No app-level checks needed  
* Impossible to leak data accidentally  
* Works everywhere (API, dashboard, scripts)

This is one of Supabase’s biggest strengths.

---

# **3\. Database Design Patterns (CRUD-optimized)**

Given:

* Read-heavy  
* Simple CRUD  
* Low write contention

### **Recommended patterns**

#### **Use UUIDs**

* Already supported by Supabase  
* Avoids sequence contention

#### **Prefer simple joins**

* Don’t over-normalize  
* Optimize for clarity over micro-performance

#### **Soft deletes (optional)**

deleted\_at timestamptz

Add to RLS if needed:

using (auth.uid() \= user\_id and deleted\_at is null)

---

## **Migrations**

Use Supabase migrations **from day one**:

supabase migration new create\_items

This keeps you portable later.

---

# **4\. Next.js App Router Structure**

This is a clean, scalable baseline.

/app  
  /(auth)  
    /login  
    /signup  
  /(app)  
    /dashboard  
    /items  
      page.tsx  
      loading.tsx  
  /api  
    /items  
      route.ts  
/lib  
  /supabase  
    server.ts  
    browser.ts  
  /db  
    queries.ts  
/middleware.ts

---

## **Route groups**

* `(auth)` → public  
* `(app)` → authenticated

---

# **5\. Supabase Client Setup (Critical)**

### **Server client (`lib/supabase/server.ts`)**

import { createServerClient } from '@supabase/ssr'  
import { cookies } from 'next/headers'

export function createClient() {  
  const cookieStore \= cookies()

  return createServerClient(  
    process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
    process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!,  
    {  
      cookies: {  
        getAll() {  
          return cookieStore.getAll()  
        },  
        setAll(cookies) {  
          cookies.forEach(({ name, value, options }) \=\>  
            cookieStore.set(name, value, options)  
          )  
        },  
      },  
    }  
  )  
}

Use this in:

* Server Components  
* Route handlers  
* Server Actions

---

### **Browser client (`lib/supabase/browser.ts`)**

import { createBrowserClient } from '@supabase/ssr'

export const supabase \= createBrowserClient(  
  process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
  process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
)

Use **sparingly** (mostly for auth UI).

---

# **6\. Data Access Strategy**

### **Default: Server Components**

// app/items/page.tsx  
const supabase \= createClient()

const { data: items } \= await supabase  
  .from('items')  
  .select('\*')

### **Mutations: Server Actions or Route Handlers**

**Server Action (recommended)**

'use server'

export async function createItem(name: string) {  
  const supabase \= createClient()

  await supabase.from('items').insert({  
    name,  
    user\_id: (await supabase.auth.getUser()).data.user?.id,  
  })  
}

💡 You *could* omit `user_id` and use a DB trigger later.

---

# **7\. Middleware (auth gate)**

export async function middleware(req: NextRequest) {  
  const supabase \= createMiddlewareClient({ req })

  const {  
    data: { session },  
  } \= await supabase.auth.getSession()

  if (\!session && req.nextUrl.pathname.startsWith('/dashboard')) {  
    return NextResponse.redirect(new URL('/login', req.url))  
  }  
}

---

# **8\. Cost & Usage Guardrails**

To stay free:

* Avoid:  
  * Realtime subscriptions unless needed  
  * Excessive edge functions  
* Prefer:  
  * Server-side reads  
  * Cached queries via Next.js  
* Add basic rate limiting later if exposed APIs exist

---

# **9\. Portability Check (Sanity Test)**

If you wanted to leave Supabase:

* DB → standard Postgres dump  
* Auth → Auth.js (JWT-compatible)  
* Hosting → Fly.io / DO / Vercel stays

No rewrites. Just wiring changes.

# Data Design

# Data Design

What you’re describing is a classic **global catalog \+ user-specific overlay** pattern, and Postgres \+ Supabase handles this extremely well.

The key is to **separate concerns cleanly**:

* **Global, mostly-static data** → readable by everyone  
* **User-specific data** → isolated per user via RLS  
* **Joins happen at query time**, not via duplication

Let’s redesign with that in mind.

---

# **1\. Conceptual Model (High-Level)**

You now have **two data domains**:

### **Global (shared)**

“What exists in the world”

* Items  
* Descriptions  
* MSRP  
* Metadata

### **User-specific**

“How *this user* relates to those items”

* Inventory counts  
* Local price  
* Notes  
* Status flags

This is a *textbook* relational split.

---

# **2\. Revised Core Tables**

## **Global items (catalog)**

create table catalog\_items (  
  id uuid primary key default gen\_random\_uuid(),  
  sku text unique not null,  
  name text not null,  
  description text,  
  msrp\_cents integer,  
  created\_at timestamptz default now(),  
  updated\_at timestamptz default now()  
);

### **RLS for global data**

Enable RLS:

alter table catalog\_items enable row level security;

Public read policy:

create policy "Public read catalog"  
on catalog\_items  
for select  
using (true);

🚨 No insert/update/delete policies for regular users.

How data changes:

* Admin dashboard  
* SQL scripts  
* Supabase UI  
* Edge function with service role

---

## **User-specific overlay table**

create table user\_items (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null references auth.users(id) on delete cascade,  
  catalog\_item\_id uuid not null references catalog\_items(id),  
  quantity integer not null default 0,  
  local\_price\_cents integer,  
  notes text,  
  created\_at timestamptz default now(),  
  updated\_at timestamptz default now(),  
  unique (user\_id, catalog\_item\_id)  
);

### **Why this design works**

* No duplication of catalog data  
* One row per user per item  
* Easy aggregation  
* Safe joins

---

# **3\. RLS for User Overlay (Critical)**

Enable RLS:

alter table user\_items enable row level security;

Policies:

### **Read**

create policy "Read own user\_items"  
on user\_items  
for select  
using (auth.uid() \= user\_id);

### **Insert**

create policy "Insert own user\_items"  
on user\_items  
for insert  
with check (auth.uid() \= user\_id);

### **Update**

create policy "Update own user\_items"  
on user\_items  
for update  
using (auth.uid() \= user\_id);

### **Delete**

create policy "Delete own user\_items"  
on user\_items  
for delete  
using (auth.uid() \= user\_id);

---

# **4\. Query Patterns (This Is the Payoff)**

## **Read-heavy join (most common)**

select  
  c.id,  
  c.name,  
  c.description,  
  c.msrp\_cents,  
  u.quantity,  
  u.local\_price\_cents  
from catalog\_items c  
left join user\_items u  
  on u.catalog\_item\_id \= c.id  
 and u.user\_id \= auth.uid();

### **What happens**

* User sees **all catalog items**  
* User-specific data appears when it exists  
* RLS filters `user_items` automatically

This is extremely efficient with indexes.

---

# **5\. Indexing Strategy (Important)**

create index idx\_user\_items\_user  
  on user\_items(user\_id);

create index idx\_user\_items\_catalog  
  on user\_items(catalog\_item\_id);

create index idx\_user\_items\_user\_catalog  
  on user\_items(user\_id, catalog\_item\_id);

Catalog table:

create index idx\_catalog\_sku on catalog\_items(sku);

---

# **6\. Handling “Mostly Static” Data Efficiently**

### **App-level caching (free, powerful)**

In Next.js Server Components:

export const revalidate \= 3600; // 1 hour

Or:

const data \= await fetch(..., { next: { revalidate: 3600 } })

This:

* Dramatically reduces DB reads  
* Costs nothing  
* Works perfectly for catalog data

---

### **Optional: Materialized view (later)**

If joins get heavy:

create materialized view user\_catalog\_view as  
select ...

Probably unnecessary for your scale.

---

# **7\. Mutations (User overlay only)**

When a user updates quantity:

await supabase  
  .from('user\_items')  
  .upsert({  
    catalog\_item\_id,  
    quantity,  
    local\_price\_cents  
  })

RLS ensures safety.

---

# **8\. Admin Updates to Catalog**

Since catalog changes are infrequent:

**Best options**

* Supabase UI (manual)  
* SQL migration  
* Script using service role key (local only)

**Avoid**

* Letting users write to catalog tables

---

# **9\. Cost Implications (Still $0)**

This design is:

* Read-heavy but cacheable  
* Minimal writes  
* Single DB  
* No realtime

You should stay comfortably within:

* Supabase free tier  
* Vercel free tier

---

# **10\. Portability Check (Still Excellent)**

If you leave Supabase:

* `catalog_items` → plain Postgres  
* `user_items` → plain Postgres  
* Auth → Auth.js

No Firebase-style rewrite.

---

# **11\. Summary of Changes vs Earlier Design**

| Aspect | Before | Now |
| ----- | ----- | ----- |
| Data model | User-owned only | Global \+ user overlay |
| RLS | Per-table user isolation | Mixed public \+ private |
| Reads | Single-table | Join-heavy (cached) |
| Scalability | Good | Better |
| Cost | $0 | Still $0 |

# Auth UX

# Auth UX

Perfect choice — **auth UX is where a lot of Supabase apps quietly succeed or fail**, especially for hobby/MVP projects where friction matters more than enterprise features.

I’ll design this specifically for **your app**:

* ≤ 100 users  
* No sensitive data  
* Auth \= identity \+ data isolation  
* Zero cost  
* Minimal maintenance

---

# **Auth UX Design (Supabase \+ Next.js)**

## **Guiding principles**

For *your* app, auth should be:

1. **Low friction** – users shouldn’t think about it  
2. **Low support burden** – no password reset tickets  
3. **Low cost** – no MAU pricing  
4. **Boring** – boring auth is good auth

This leads to a very clear recommendation.

---

# **1\. Auth Method Recommendation**

## **🟢 Primary: Email Magic Links**

*(Optional password fallback)*

### **Why magic links fit your app perfectly**

* No passwords to manage  
* No password resets  
* No credential stuffing concerns  
* Extremely easy for casual users  
* Supabase handles it entirely

For a small, trusted user base, this is **ideal**.

### **Downsides (acceptable here)**

* Requires email access  
* Slight delay (check inbox)

Given your constraints, this is a win.

---

## **Optional: Add passwords later**

Supabase lets you enable both:

* Magic links  
* Email \+ password

You can start magic-only and expand later without migration pain.

---

# **2\. UX Flow (Recommended)**

### **First-time user**

Landing page  
  ↓  
Enter email  
  ↓  
"Check your inbox"  
  ↓  
Click magic link  
  ↓  
Redirect to /app

### **Returning user**

Enter email  
→ Magic link  
→ App

No account creation screen. No password fields.

---

# **3\. Pages & Routes**

### **Route groups**

/(auth)  
  /login  
  /verify  
(app)  
  /dashboard  
  /items

---

# **4\. Login Page UX**

### **UI elements**

* Email input  
* Single CTA: “Send login link”  
* Clear copy

Example copy:

“We’ll email you a secure link to sign in. No password required.”

### **No:**

* Username fields  
* Password complexity rules  
* Confirm password fields

---

# **5\. Supabase Auth Configuration**

## **Enable magic links**

Supabase dashboard:

* Auth → Providers → Email  
* Enable:  
  * Magic link  
  * Email confirmations (optional)

Set redirect URL:

https://your-app.vercel.app/auth/callback

---

# **6\. Login Implementation (Client-side)**

import { supabase } from '@/lib/supabase/browser'

export async function signIn(email: string) {  
  const { error } \= await supabase.auth.signInWithOtp({  
    email,  
    options: {  
      emailRedirectTo: \`${location.origin}/auth/callback\`,  
    },  
  })

  if (error) throw error  
}

UX response:

“If that email exists, we’ve sent a login link.”

(Prevents email enumeration.)

---

# **7\. Auth Callback Route**

### **`/auth/callback/route.ts`**

import { NextResponse } from 'next/server'  
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {  
  const supabase \= createClient()  
  const { searchParams } \= new URL(req.url)

  await supabase.auth.exchangeCodeForSession(searchParams)

  return NextResponse.redirect(new URL('/dashboard', req.url))  
}

This:

* Exchanges the token  
* Sets secure cookies  
* Redirects into the app

---

# **8\. Protecting App Routes (Middleware)**

export async function middleware(req: NextRequest) {  
  const supabase \= createMiddlewareClient({ req })

  const {  
    data: { session },  
  } \= await supabase.auth.getSession()

  if (\!session && req.nextUrl.pathname.startsWith('/app')) {  
    return NextResponse.redirect(new URL('/login', req.url))  
  }  
}

UX result:

* Logged-out users always land on login  
* Logged-in users never see auth pages again

---

# **9\. Logged-in UX Touches**

### **Header**

* Show user email  
* “Log out” button

await supabase.auth.signOut()

### **No “account settings” needed (yet)**

Keep it minimal.

---

# **10\. Profile Creation (Optional, Automatic)**

If you want a profile row:

### **Trigger on user creation**

create or replace function create\_profile()  
returns trigger as $$  
begin  
  insert into profiles (id) values (new.id);  
  return new;  
end;  
$$ language plpgsql security definer;

create trigger on\_auth\_user\_created  
after insert on auth.users  
for each row execute procedure create\_profile();

Users never see this — it just works.

---

# **11\. UX Failure Modes (Handled)**

| Issue | How it’s handled |
| ----- | ----- |
| Wrong email | Silent |
| Link expired | User requests new |
| User closes tab | Retry |
| Multiple clicks | Idempotent |

No support emails needed.

---

# **12\. Security Level (Appropriate, Not Overkill)**

You get:

* JWT-based sessions  
* HTTP-only cookies  
* CSRF protection  
* RLS enforcement

You’re *not* sacrificing real security — just friction.

---

# **13\. Cost Check**

* Supabase Auth: **Free**  
* Email sends: Included (reasonable volume)  
* Vercel: Free

No per-user fees. No surprises.

---

# **14\. When to Revisit Auth UX**

You only need to rethink this if:

* You add payments  
* You add orgs / teams  
* You exceed a few thousand MAU

Until then, this is the **correct** choice.

---

## **Note: Would like to consider not logging user out. As long as they return to a previous logged in session they are fine. (reflect and decide)**

# Query & Caching Strategy

# **Query & Caching Strategy**

Great — this is the *right* next step. For your app, **query \+ caching strategy** is what will keep it:

* Fast  
* Cheap (still $0)  
* Simple  
* Scalable enough without premature complexity

I’ll tailor this specifically to:

* **Next.js App Router**  
* **Supabase**  
* **Read-heavy**  
* **Mostly-static global catalog \+ user overlay**

---

# **3️⃣ Query & Caching Strategy (Next.js \+ Supabase)**

## **Core idea (tl;dr)**

**Global data is cached aggressively.**  
**User-specific data is fetched server-side and lightly cached (or not at all).**  
**Joins happen on the server.**

This gives you excellent performance with almost zero operational overhead.

---

# **1\. Categorize Your Data (This Drives Everything)**

You now have **three data classes**:

| Data type | Examples | Cache strategy |
| ----- | ----- | ----- |
| Global static | catalog items, descriptions | Long-lived cache |
| User overlay | quantity, local price | No cache / short cache |
| Mixed view | catalog \+ user overlay | Server-side join |

This separation is the key mental model.

---

# **2\. Global Catalog Data (Aggressively Cached)**

### **Characteristics**

* Changes infrequently  
* Same for all users  
* Read-heavy

### **Strategy**

* **Fetch in Server Components**  
* **Use Next.js ISR**  
* **Revalidate on a long interval**

---

## **Example: Catalog fetch**

// app/(app)/catalog/page.tsx

export const revalidate \= 3600; // 1 hour

const supabase \= createClient()

const { data: catalog } \= await supabase  
  .from('catalog\_items')  
  .select('id, name, description, msrp\_cents')  
  .order('name')

### **What this does**

* Cached at the **Next.js layer**  
* Vercel serves cached HTML  
* Supabase sees far fewer reads  
* Cost stays low

💡 If updates are *very* rare, you can push this to 6–24 hours.

---

# **3\. User-Specific Data (Fresh, Server-Side)**

### **Characteristics**

* Per-user  
* Changes frequently  
* Must respect RLS

### **Strategy**

* **Server Components**  
* **No revalidation**  
* Always scoped by auth

---

## **Example: User inventory**

const supabase \= createClient()

const { data: inventory } \= await supabase  
  .from('user\_items')  
  .select('catalog\_item\_id, quantity, local\_price\_cents')

No filters needed — RLS handles it.

---

# **4\. Mixed View: Catalog \+ User Overlay (Most Important)**

This is your **main app screen**.

### **Strategy**

* Single server-side query  
* Cached *only* at the page level  
* Short revalidation window (or none)

---

## **SQL View (Optional but Clean)**

Create a **database view** to simplify app code:

create view user\_catalog\_view as  
select  
  c.id as catalog\_item\_id,  
  c.name,  
  c.description,  
  c.msrp\_cents,  
  u.quantity,  
  u.local\_price\_cents  
from catalog\_items c  
left join user\_items u  
  on u.catalog\_item\_id \= c.id  
 and u.user\_id \= auth.uid();

Enable RLS on the view:

alter view user\_catalog\_view enable row level security;

Supabase supports this cleanly.

---

## **Querying the view**

const { data } \= await supabase  
  .from('user\_catalog\_view')  
  .select('\*')

Benefits:

* Very clean app code  
* Centralized join logic  
* Easy to optimize later

---

# **5\. Page-Level Caching Strategy**

### **Recommended defaults**

| Page | Revalidate |
| ----- | ----- |
| Landing | 24h |
| Catalog browse | 1–6h |
| User dashboard | 0 (no cache) |
| User item detail | 0–60s |

---

## **Per-page example**

export const revalidate \= 60 // user-aware but still light caching

⚠️ Important:

* **Never cache auth state**  
* Only cache pages that *derive* from auth

---

# **6\. Mutations & Cache Invalidation**

### **Pattern**

* Use **Server Actions**  
* After mutation, call `revalidatePath`

---

## **Example: Update quantity**

'use server'

import { revalidatePath } from 'next/cache'

export async function updateQuantity(id: string, quantity: number) {  
  const supabase \= createClient()

  await supabase  
    .from('user\_items')  
    .update({ quantity })  
    .eq('catalog\_item\_id', id)

  revalidatePath('/catalog')  
}

This keeps UX fresh without refetch storms.

---

# **7\. Avoid These Common Cost Traps**

❌ Client-side polling  
❌ Realtime subscriptions  
❌ Fetching catalog data per user  
❌ Over-fetching large text fields

✔ Server Components  
✔ Page caching  
✔ Thin payloads

---

# **8\. Pagination & Filtering (Future-proof)**

If catalog grows:

.range(0, 49\)

Add indexes:

create index on catalog\_items(name);

Don’t paginate until you need to — but you’re ready when you do.

---

# **9\. Observability (Lightweight)**

Supabase dashboard:

* Watch query count  
* Watch table size

If something spikes:

* It’s almost always missing caching

---

# **10\. Cost Reality Check**

With this setup:

* Most requests hit **Vercel cache**  
* Supabase sees minimal reads  
* Writes are user-limited  
* Auth is free

➡️ **$0/month remains realistic**

---

# **11\. Summary Mental Model**

**Cache globally, isolate locally, join on the server, mutate sparingly.**

If you stick to that, this app will feel fast and never surprise you with a bill.

# Testing Strategy

**Testing Strategy**

Excellent choice. **Testing RLS correctness** is the single most important thing to get right with Supabase, and most people skip it. We’ll keep this **lightweight, cheap, and confidence-building**, not enterprise-overkill.

Your goals:

* Ensure **user data isolation is impossible to break**  
* Avoid shipping subtle RLS bugs  
* Keep friction low for a solo hobby project

---

# **4️⃣ Testing Strategy (Focused on RLS \+ Core Queries)**

## **Testing philosophy (for *your* app)**

You do **not** need:

* Full unit test coverage  
* Mocked databases  
* Complex CI pipelines

You **do** need:

* A way to prove RLS works  
* A way to catch accidental policy regressions  
* Confidence that joins behave correctly per user

We’ll focus on **3 layers only**.

---

# **Layer 1: Database-Level RLS Tests (Most Important)**

### **What we’re testing**

* User A cannot see User B’s `user_items`  
* User A *can* see all `catalog_items`  
* Inserts/updates are correctly scoped

### **Tooling**

* Supabase local dev (`supabase start`)  
* SQL scripts  
* Two test users

No JS required.

---

## **Local setup**

supabase start

This gives you:

* Local Postgres  
* Local auth  
* Real RLS enforcement

---

## **Create test users**

\-- As service role / admin  
insert into auth.users (id, email)  
values  
  ('00000000-0000-0000-0000-000000000001', 'user1@test.com'),  
  ('00000000-0000-0000-0000-000000000002', 'user2@test.com');

---

## **Simulate auth context**

Supabase lets you simulate users:

set request.jwt.claim.sub \= '00000000-0000-0000-0000-000000000001';

This sets:

auth.uid() \= user1

---

## **RLS tests (example)**

### **Insert as user1**

insert into user\_items (catalog\_item\_id, quantity)  
values ('\<catalog-id\>', 5);

✅ Should succeed

---

### **Read as user1**

select \* from user\_items;

✅ Should return user1 rows only

---

### **Switch user**

set request.jwt.claim.sub \= '00000000-0000-0000-0000-000000000002';

---

### **Read as user2**

select \* from user\_items;

❌ Should return zero rows

---

### **Try to update user1’s row as user2**

update user\_items set quantity \= 99;

❌ Should fail or update zero rows

---

## **Test catalog access**

select \* from catalog\_items;

✅ Always allowed

---

### **What this catches**

* Missing RLS policies  
* Incorrect `with check`  
* Overly permissive joins

---

# **Layer 2: Server-Side Integration Tests (Optional but Useful)**

If you want *some* automated coverage:

### **Tooling**

* Vitest or Jest  
* Real Supabase local instance  
* Supabase anon key

---

## **Example test (Node)**

const supabaseUser1 \= createClient(url, anonKey, {  
  auth: { persistSession: false },  
})

await supabaseUser1.auth.signInWithPassword({  
  email: 'user1@test.com',  
  password: 'password',  
})

const { data } \= await supabaseUser1  
  .from('user\_items')  
  .select('\*')

expect(data).toHaveLength(1)

You don’t need many of these — just 2–3 critical ones.

---

# **Layer 3: Manual “Break It” Testing (Fast & Effective)**

Before you ship:

1. Open two browsers (normal \+ incognito)  
2. Log in as different users  
3. Try:  
   * Copy-pasting item IDs  
   * Editing URLs  
   * Refreshing cached pages

If RLS is right, nothing breaks.

---

# **5\. Testing the View (`user_catalog_view`)**

Views are common failure points.

Test:

set request.jwt.claim.sub \= '\<user1\>';  
select \* from user\_catalog\_view;

Confirm:

* All catalog rows appear  
* Only user1’s overlay data shows

Switch user, repeat.

---

# **6\. Regression Safety (Low Effort)**

### **Rule**

Any time you change:

* RLS  
* Joins  
* Triggers

Run:

* The SQL scripts above  
* One manual browser test

This takes \~5 minutes and saves hours later.

---

# **7\. What NOT to Test (Yet)**

You can skip:

* UI snapshot tests  
* Edge case auth flows  
* Performance testing

At your scale, correctness \> completeness.

---

# **8\. Common RLS Mistakes (Checklist)**

Before moving on, sanity-check:

* Every user table has RLS enabled  
* Every insert has `with check`  
* Views are tested under auth context  
* No use of `service_role` key in app code  
* No client-side joins of sensitive data

---

# **9\. Cost Impact**

This testing approach:

* Uses local resources  
* No CI costs  
* No cloud DB duplication

Still $0.

# Local Development & Environment Setup

# **Local Development & Environment Setup**

## **Goals (for *your* project)**

* One command to start everything  
* Local auth \+ RLS behave like prod  
* No accidental use of prod secrets  
* Easy resets when you break things  
* Zero ongoing cost

---

# **1\. Tools You’ll Use**

**Required**

* Node 18+  
* Docker  
* Supabase CLI  
* pnpm / npm / yarn (your choice)

**Nice-to-have**

* Postgres GUI (TablePlus, psql, etc.)

---

# **2\. Repo Structure (Minimal & Clean)**

.  
├── app/  
├── lib/  
│   └── supabase/  
│       ├── server.ts  
│       ├── browser.ts  
│       └── middleware.ts  
├── supabase/  
│   ├── migrations/  
│   ├── seed.sql  
│   └── config.toml  
├── .env.local  
├── .env.example  
└── package.json

Key rule:

**Anything touching the DB must be reproducible via migrations.**

---

# **3\. Supabase Local Setup**

## **Initialize Supabase**

supabase init

This creates:

/supabase  
  /migrations  
  config.toml

---

## **Start local stack**

supabase start

This spins up:

* Postgres  
* Auth  
* Realtime (unused but fine)  
* Storage

And outputs:

* Local API URL  
* Anon key  
* Service role key (⚠️ don’t use in app)

---

# **4\. Environment Variables (Critical Discipline)**

## **`.env.local`**

NEXT\_PUBLIC\_SUPABASE\_URL=http://localhost:54321  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=your-local-anon-key

⚠️ Never commit this.

---

## **`.env.example`**

NEXT\_PUBLIC\_SUPABASE\_URL=  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=

Commit this so future-you remembers what’s needed.

---

# **5\. Switching Between Local & Prod**

Supabase CLI makes this clean.

### **Link project**

supabase link \--project-ref your-project-id

### **Push local schema to prod**

supabase db push

### **Pull prod schema (if needed)**

supabase db pull

**Golden rule**

Schema flows **local → prod**, not the other way around.

---

# **6\. Seeding Data (Important for Your App)**

Given your **large global catalog**, seed data matters.

## **`supabase/seed.sql`**

insert into catalog\_items (sku, name, msrp\_cents)  
values  
  ('SKU-001', 'Item One', 1000),  
  ('SKU-002', 'Item Two', 2500);

Run:

supabase db reset

This:

* Drops DB  
* Reapplies migrations  
* Reruns seed

Perfect for experimentation.

---

# **7\. Local Auth Testing (Realistic)**

### **Create users locally**

* Use Supabase Studio (localhost UI)  
* Or SQL insert (for testing)

Then:

* Login via your app  
* RLS behaves exactly like prod

This is a *huge* advantage over mocking auth.

---

# **8\. Next.js Dev Setup**

pnpm dev

What happens:

* App connects to **local Supabase**  
* Auth cookies work  
* RLS enforced  
* No cloud usage

---

# **9\. Avoiding Common Local Dev Footguns**

### **❌ Don’t use service role key in dev**

Even locally — it bypasses RLS and hides bugs.

### **❌ Don’t test with RLS disabled**

You’ll regret it.

### **❌ Don’t hand-edit tables in Studio**

Always use migrations.

---

# **10\. Reset & Recovery Workflow**

You *will* break things. That’s fine.

### **Nuclear reset**

supabase db reset

This is why we love migrations \+ seeds.

---

# **11\. Git Hygiene**

Add to `.gitignore`:

.env.local  
.supabase/

Commit:

* Migrations  
* Seed data  
* Schema changes

---

# **12\. Prod Safety Checks (Before First Deploy)**

Before deploying:

* App runs fully against local Supabase  
* RLS tested locally  
* No service role key in code  
* `NEXT_PUBLIC_` vars only expose anon key

---

# **13\. Cost Check (Still $0)**

Local dev:

* Docker \+ laptop

Prod:

* Supabase free tier  
* Vercel free tier

No background services running \= no surprise bills.

---

# **14\. Mental Model Summary**

**Local Supabase is prod Supabase. Treat it that way.**

If it works locally, it’ll work in prod.

# Deployment Checklist & Cost Guardrails

# **Deployment Checklist & Cost Guardrails**

Perfect — this is the **final pass**: how to deploy safely, keep costs at **$0**, and avoid the common “why is this billing me?” surprises.

I’ll give you:

* A **step-by-step deployment checklist**  
* **Cost guardrails**  
* A **“don’t shoot yourself in the foot” list**  
* A simple **ongoing maintenance routine**

---

## **Target State (Locked)**

* **Frontend**: Next.js → Vercel (Free)  
* **Backend**: Supabase (Free)  
* **Auth**: Supabase Auth (Magic links)  
* **DB**: Postgres \+ RLS  
* **Users**: ≤ 100  
* **Cost**: $0/month

---

# **1\. Pre-Deployment Checklist (Do These Once)**

### **Supabase (Prod)**

* Create Supabase project (free tier)  
* Enable Email Auth (magic links)

Set redirect URL  
https://your-app.vercel.app/auth/callback

*   
* Confirm RLS enabled on:  
  * `user_items`  
  * views  
* Verify catalog tables have **read-only** policies  
* No write policies on global tables

---

### **Database**

* All tables created via migrations  
* Indexes on:  
  * `user_items.user_id`  
  * `user_items.catalog_item_id`  
* Seed catalog data (or import script ready)

---

# **2\. Vercel Deployment**

### **Connect repo**

* Import GitHub repo  
* Framework: **Next.js**  
* Node version: 18+

---

### **Environment variables (Vercel)**

Add **Production** and **Preview**:

NEXT\_PUBLIC\_SUPABASE\_URL=https://\<project\>.supabase.co

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=\<anon-key\>

⚠️ Do **not** add service role key.

---

### **Build settings**

* Defaults are fine  
* No custom server  
* No background jobs

---

# **3\. First Production Smoke Test**

After deploy:

### **Auth**

* Login via magic link  
* Callback redirects correctly  
* Session persists across refresh

### **Data isolation**

* User A sees own overlay data  
* User A cannot see User B’s data  
* Catalog visible to all users

### **Mutations**

* Update quantity  
* Page revalidates correctly

---

# **4\. Cost Guardrails (This Is the Important Part)**

## **Supabase Guardrails**

### **Stay on free tier by avoiding:**

* Realtime subscriptions  
* Excessive edge functions  
* Large file storage

### **Safe usage patterns:**

* Server-side reads  
* Cached catalog pages  
* Minimal writes

📊 Check monthly:

* DB size  
* Query count

---

## **Vercel Guardrails**

### **Free tier friendly:**

* ISR (`revalidate`)  
* Server Components  
* Minimal API routes

### **Avoid:**

* Client-side polling  
* High-frequency server actions  
* Logging large payloads

---

# **5\. Email Cost Guardrail (Magic Links)**

Supabase email is generous, but:

* Avoid auto-sending on every page load  
* Throttle login attempts client-side  
* Copy text:  
  “If an account exists, we sent a link”

Prevents abuse.

---

# **6\. Security Guardrails**

* No `service_role` key anywhere in app  
* RLS enabled everywhere  
* Views tested under auth context  
* Middleware protects `/app` routes  
* Auth redirect URLs locked down

---

# **7\. Observability (Lightweight, Free)**

### **Supabase**

* Dashboard → Database → Logs  
* Watch:  
  * Slow queries  
  * RLS errors

### **Vercel**

* Function logs  
* Only investigate if something feels slow

No paid monitoring needed.

---

# **8\. “If Something Spikes” Playbook**

### **If Supabase reads spike:**

* Increase `revalidate` on catalog pages  
* Ensure joins happen server-side  
* Avoid client-side Supabase queries

### **If Vercel usage spikes:**

* Check for accidental infinite revalidation  
* Remove polling  
* Verify caching headers

---

# **9\. Escape Hatches (Future-Proofing)**

If you *ever* outgrow free tier:

### **DB**

* Export Postgres  
* Move to Neon / Fly.io

### **Auth**

* Swap Supabase Auth → Auth.js

### **Hosting**

* Stay on Vercel or move to Fly.io

No rewrites. Just wiring.

---

# **10\. Minimal Ongoing Maintenance**

Monthly (5 minutes):

* Check Supabase usage page  
* Check Vercel usage

Quarterly:

* Run `supabase db pull`  
* Clean unused policies

That’s it.

---

# **11\. Final Sanity Rules (Print These)**

**Never bypass RLS**  
**Cache global data**  
**Server-side joins only**  
**No service role in app**  
**Migrations over UI edits**

If you follow these, this app will stay cheap, fast, and boring.

---

## **You’re Architecturally Done ✅**

You now have:

* A zero-cost MVP architecture  
* Clean separation of global vs user data  
* Safe auth UX  
* Strong data isolation  
* A clear scaling path

Possible Next steps:

* Concrete folder-level code scaffolding  
* Example UI flows  
* Or a sanity review once you’ve started coding

