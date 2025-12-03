# Creator Dashboard

The Creator Dashboard is a full-stack analytics platform that helps creators track their performance and engagement across multiple social networks.

Designed as a real-world portfolio project, it highlights core developer skills including authentication, CRUD operations, API integration, state management, and data visualization — built on a clean, scalable architecture.

## Core Features (Planned & In Progress)

### User Authentication

- Signup & login
- Session handling
- Protected routes
- Role-based permissions (Creator / Admin)

### Creator Stats Dashboard

- Central hub for creator performance
- Customizable panels for metrics such as:
  - Followers
  - Views
  - Engagement rate
  - Audience growth
  - Revenue / sales (for creators who sell merch/music)

### API Integrations

Pull in real creator stats from supported platforms:

- YouTube Data API (subs, views, watch time)
- Instagram Graph API (followers, engagement)
- Spotify for Artists API (streams, listeners)

_(Integrations can be swapped or expanded over time.)_

### Data Visualizations

- Line charts for growth over time
- Bar and pie charts for engagement breakdowns
- Sparkline-style microcharts for quick glances
- Trend indicators (up/down %)

### CRUD Operations

Admin or creators can manage:

- Accounts
- Connected platforms
- Saved analytics snapshots
- Notes, tasks, or custom metadata

### Admin Mode

A dedicated admin interface with:

- User management
- System logs
- Manual data overrides
- API key monitoring

## Tech Stack

### Frontend

- React 18
- React Router 7
- TypeScript
- Tailwind CSS

### Backend / Server Layer

- Node.js
- Drizzle ORM
- PostgreSQL
- API service modules

### Roadmap

**v0.1 — Base Architecture**

- Routing
- UI shell
- Drizzle + DB connection

**v0.2 — Auth System**

- Signup, login
- Protected dashboard routes

**v0.3 — Creator Dashboard MVP**

- Example metrics
- Basic charts (static or mock data)

**v0.4 — API Integrations**

- First external API (YouTube or Spotify)
- Real stats pulling

**v0.5 — Admin Mode**

- Manage users
- CRUD for creator records

**v1.0 — Production Release**

- Full multi-platform analytics
- Polished UI
- Performance & error handling

## Future Improvements

- Agency accounts

## License

MIT — free for personal use.  
Give credit if you fork something substantial.

## Credits

Built by Dario Hunt
