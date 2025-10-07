# Custom SSO Integration Guide for Payload CMS

## Overview
This guide shows you how to integrate your existing SSO system with Payload CMS. The approach allows users to authenticate via your SSO while maintaining Payload's admin panel and API authentication.

## Architecture

```
User → Your SSO → Callback Handler → Payload JWT → Admin Panel/API Access
```

## Implementation Steps

### Step 1: Configure Users Collection for SSO

```typescript
// collections/Users.ts
import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Keep local strategy disabled if ONLY using SSO
    disableLocalStrategy: false, // Set to true to disable email/password login
    tokenExpiration: 7200, // 2 hours
    verify: false, // Disable email verification for SSO users
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
    },
    // SSO-specific fields
    {
      name: 'ssoProvider',
      type: 'select',
      options: [
        { label: 'Local', value: 'local' },
        { label: 'Custom SSO', value: 'custom_sso' },
      ],
      defaultValue: 'local',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'ssoId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Unique identifier from SSO provider',
      },
      index: true, // For faster lookups
    },
    {
      name: 'ssoData',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Additional data from SSO provider',
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
  ],
}
```

### Step 2: Create SSO Routes

```typescript
// routes/sso.ts
import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { Payload } from 'payload'

export const createSSORoutes = (payload: Payload) => {
  const router = express.Router()

  // Step 1: Initiate SSO login
  router.get('/auth/sso/login', (req: Request, res: Response) => {
    const redirectUrl = req.query.redirect as string || '/admin'
    
    // Store the intended redirect URL in session or cookie
    res.cookie('sso_redirect', redirectUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600000, // 10 minutes
    })

    // Redirect to your SSO provider
    const ssoLoginUrl = `${process.env.SSO_PROVIDER_URL}/authorize?` +
      `client_id=${process.env.SSO_CLIENT_ID}&` +
      `redirect_uri=${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/auth/sso/callback&` +
      `response_type=code&` +
      `scope=openid profile email`

    res.redirect(ssoLoginUrl)
  })

  // Step 2: Handle SSO callback
  router.get('/auth/sso/callback', async (req: Request, res: Response) => {
    try {
      const { code, error } = req.query

      if (error) {
        console.error('SSO Error:', error)
        return res.redirect('/admin/login?error=sso_failed')
      }

      if (!code) {
        return res.redirect('/admin/login?error=no_code')
      }

      // Exchange code for access token with your SSO provider
      const tokenResponse = await fetch(`${process.env.SSO_PROVIDER_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code as string,
          client_id: process.env.SSO_CLIENT_ID!,
          client_secret: process.env.SSO_CLIENT_SECRET!,
          redirect_uri: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/auth/sso/callback`,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const tokenData = await tokenResponse.json()
      const { access_token } = tokenData

      // Get user info from SSO provider
      const userInfoResponse = await fetch(`${process.env.SSO_PROVIDER_URL}/userinfo`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info')
      }

      const ssoUserData = await userInfoResponse.json()

      // Find or create user in Payload
      let user = await payload.find({
        collection: 'users',
        where: {
          ssoId: {
            equals: ssoUserData.sub || ssoUserData.id,
          },
        },
        limit: 1,
      })

      if (user.docs.length === 0) {
        // Create new user
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: ssoUserData.email,
            firstName: ssoUserData.given_name || ssoUserData.firstName || '',
            lastName: ssoUserData.family_name || ssoUserData.lastName || '',
            ssoProvider: 'custom_sso',
            ssoId: ssoUserData.sub || ssoUserData.id,
            ssoData: ssoUserData,
            lastLogin: new Date().toISOString(),
            // Set a random password (won't be used for SSO users)
            password: generateRandomPassword(),
          },
        })
        user.docs.push(newUser)
      } else {
        // Update existing user
        await payload.update({
          collection: 'users',
          id: user.docs[0].id,
          data: {
            lastLogin: new Date().toISOString(),
            ssoData: ssoUserData,
          },
        })
      }

      const payloadUser = user.docs[0]

      // Generate Payload JWT token
      const token = jwt.sign(
        {
          id: payloadUser.id,
          email: payloadUser.email,
          collection: 'users',
        },
        payload.secret,
        {
          expiresIn: payload.config.collections
            .find(c => c.slug === 'users')?.auth?.tokenExpiration || 7200,
        }
      )

      // Get cookie expiration
      const cookieExpiration = new Date()
      const expirationSeconds = payload.config.collections
        .find(c => c.slug === 'users')?.auth?.tokenExpiration || 7200
      cookieExpiration.setSeconds(cookieExpiration.getSeconds() + expirationSeconds)

      // Set HTTP-only cookie
      res.cookie(`${payload.config.cookiePrefix}-token`, token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: cookieExpiration,
      })

      // Get redirect URL and clear cookie
      const redirectUrl = req.cookies.sso_redirect || '/admin'
      res.clearCookie('sso_redirect')

      // Redirect to admin panel
      res.redirect(redirectUrl)
    } catch (error) {
      console.error('SSO Callback Error:', error)
      res.redirect('/admin/login?error=authentication_failed')
    }
  })

  // Step 3: Logout
  router.post('/auth/sso/logout', async (req: Request, res: Response) => {
    try {
      // Clear Payload cookie
      res.clearCookie(`${payload.config.cookiePrefix}-token`)

      // Optionally, call SSO provider logout endpoint
      if (process.env.SSO_LOGOUT_URL) {
        const logoutUrl = `${process.env.SSO_LOGOUT_URL}?` +
          `post_logout_redirect_uri=${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/login`
        return res.redirect(logoutUrl)
      }

      res.redirect('/admin/login')
    } catch (error) {
      console.error('SSO Logout Error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  })

  // Token refresh endpoint (optional)
  router.post('/auth/sso/refresh', async (req: Request, res: Response) => {
    try {
      const token = req.cookies[`${payload.config.cookiePrefix}-token`]
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }

      // Verify current token
      const decoded = jwt.verify(token, payload.secret) as any

      // Get user from database
      const user = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      // Generate new token
      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          collection: 'users',
        },
        payload.secret,
        {
          expiresIn: payload.config.collections
            .find(c => c.slug === 'users')?.auth?.tokenExpiration || 7200,
        }
      )

      // Get cookie expiration
      const cookieExpiration = new Date()
      const expirationSeconds = payload.config.collections
        .find(c => c.slug === 'users')?.auth?.tokenExpiration || 7200
      cookieExpiration.setSeconds(cookieExpiration.getSeconds() + expirationSeconds)

      // Set new cookie
      res.cookie(`${payload.config.cookiePrefix}-token`, newToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',