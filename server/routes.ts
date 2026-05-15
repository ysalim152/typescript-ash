import express from 'express';
import { db } from './db.js';
import { createSession, getSession, deleteSession, registerUser, loginUser, generateToken } from './auth.js';

export function setupRoutes(app: express.Application) {
  // Auth middleware
  app.use((req: any, res, next) => {
    const token = req.headers['x-auth-token'];
    if (token) {
      req.user = getSession(token);
    }
    next();
  });

  // Auth Routes
  app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const result = await registerUser(email, password, firstName, lastName);
    if (result.success) {
      const token = await createSession(result.user!);
      res.json({ ...result, token });
      return;
    }

    res.status(400).json(result);
  });

  app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password required' });
      return;
    }

    const result = await loginUser(email, password);
    if (result.success) {
      const token = await createSession(result.user!);
      res.json({ ...result, token });
      return;
    }

    res.status(401).json(result);
  });

  app.post('/api/auth/logout', (req: any, res: express.Response) => {
    const token = req.headers['x-auth-token'];
    if (token) {
      deleteSession(token);
    }
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req: any, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ user: null });
      return;
    }
    res.json({ user: req.user });
  });

  // Activities Routes
  app.get('/api/activities', async (req: express.Request, res: express.Response) => {
    const activities = await db
      .selectFrom('activities')
      .selectAll()
      .execute();
    res.json(activities);
  });

  app.get('/api/activities/:id', async (req: express.Request, res: express.Response) => {
    const activity = await db
      .selectFrom('activities')
      .selectAll()
      .where('id', '=', Number(req.params.id))
      .executeTakeFirst();
    
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }
    res.json(activity);
  });

  app.post('/api/activities', async (req: any, res: express.Response) => {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { name, description, color } = req.body;
    const activity = await db
      .insertInto('activities')
      .values({ name, description, color: color || '#3b82f6' })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    res.status(201).json(activity);
  });

  // Sessions Routes
  app.get('/api/sessions', async (req: express.Request, res: express.Response) => {
    const sessions = await db
      .selectFrom('sessions')
      .leftJoin('activities', 'sessions.activity_id', 'activities.id')
      .leftJoin('users', 'sessions.coach_id', 'users.id')
      .select([
        'sessions.id',
        'sessions.title',
        'sessions.description',
        'sessions.session_date',
        'sessions.duration_minutes',
        'sessions.location',
        'sessions.max_participants',
        'activities.name as activity_name',
        'activities.id as activity_id',
        db.fn.count('session_registrations.id').as('participant_count')
      ])
      .leftJoin('session_registrations', 'sessions.id', 'session_registrations.session_id')
      .where('sessions.session_date', '>', new Date().toISOString())
      .groupBy('sessions.id')
      .orderBy('sessions.session_date', 'asc')
      .execute();
    
    res.json(sessions);
  });

  app.get('/api/sessions/:id', async (req: express.Request, res: express.Response) => {
    const session = await db
      .selectFrom('sessions')
      .selectAll()
      .where('id', '=', Number(req.params.id))
      .executeTakeFirst();
    
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(session);
  });

  app.post('/api/sessions', async (req: any, res: express.Response) => {
    if (!req.user || !['admin', 'coach'].includes(req.user.role)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const { activityId, title, description, sessionDate, durationMinutes, location, maxParticipants } = req.body;
    
    const session = await db
      .insertInto('sessions')
      .values({
        activity_id: activityId,
        coach_id: req.user.id,
        title,
        description,
        session_date: sessionDate,
        duration_minutes: durationMinutes,
        location,
        max_participants: maxParticipants
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    res.status(201).json(session);
  });

  // Session Registration Routes
  app.post('/api/sessions/:id/register', async (req: any, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessionId = Number(req.params.id);
    
    try {
      const registration = await db
        .insertInto('session_registrations')
        .values({
          session_id: sessionId,
          user_id: req.user.id
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      
      res.status(201).json(registration);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Already registered for this session' });
        return;
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.delete('/api/sessions/:id/register', async (req: any, res: express.Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessionId = Number(req.params.id);
    await db
      .deleteFrom('session_registrations')
      .where('session_id', '=', sessionId)
      .where('user_id', '=', req.user.id)
      .execute();
    
    res.json({ success: true });
  });

  app.get('/api/sessions/:id/participants', async (req: express.Request, res: express.Response) => {
    const participants = await db
      .selectFrom('session_registrations')
      .innerJoin('users', 'session_registrations.user_id', 'users.id')
      .select([
        'users.id',
        'users.email',
        'users.first_name',
        'users.last_name',
        'session_registrations.registered_at'
      ])
      .where('session_id', '=', Number(req.params.id))
      .execute();
    
    res.json(participants);
  });

  // Contact Routes
  app.post('/api/contact', async (req: express.Request, res: express.Response) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const contact = await db
      .insertInto('contacts')
      .values({ name, email, message })
      .returningAll()
      .executeTakeFirstOrThrow();
    
    res.status(201).json(contact);
  });

  // Members Routes
  app.get('/api/members', async (req: any, res: express.Response) => {
    if (!req.user || !['admin', 'coach'].includes(req.user.role)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const members = await db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role', 'created_at'])
      .execute();
    
    res.json(members);
  });
}
