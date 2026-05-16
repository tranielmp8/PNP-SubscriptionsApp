# Deployment

## Railway services

Create two Railway services from this repository:

1. Web app service
   - Config file: `railway.toml`
   - Starts the SvelteKit app with `npm run start`

2. Notification cron service
   - Config file: `/railway.cron.toml`
   - Runs `npm run cron:notifications`
   - Schedule: `*/15 * * * *`

Railway uses `railway.toml` automatically for a service by default. For the cron service, set the custom config file path in that service's settings to `/railway.cron.toml`.

Railway cron schedules are evaluated in UTC. The cron service wakes up every 15 minutes, calls the web app, and the app only sends reminders whose saved local time and timezone match that moment.

## Required variables

Set these on the web app service:

```env
DATABASE_URL=
ORIGIN=
CSRF_TRUSTED_ORIGINS=
BETTER_AUTH_TRUSTED_ORIGINS=
BETTER_AUTH_SECRET=
LEGACY_OWNER_EMAIL=
ENCRYPTION_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
CRON_SECRET=
```

Set these on the notification cron service:

```env
CRON_SECRET=
NOTIFICATION_CRON_URL=
```

`CRON_SECRET` must be the same value on both services. `NOTIFICATION_CRON_URL` should be the public URL of the web app service, for example `https://your-app.up.railway.app`.

`LEGACY_OWNER_EMAIL` is only needed if you already have subscription rows from before user accounts existed. Set it to your login email before your first login after deploying auth, then remove it after the rows are claimed.

## Database

Run migrations before using notification times/history in production:

```sh
npm run db:migrate
```
