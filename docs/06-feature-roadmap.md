# Feature Roadmap

_Development phases and implementation priorities for Riichi Mahjong League_

## Development Philosophy

This project follows a **phased approach** to deliver value incrementally while maintaining code quality and user experience. Each phase builds on the previous one, allowing for early feedback and iterative improvements.

### Design Principles

- **MVP First**: Start with core functionality, add features gradually
- **Data-Driven**: Use real usage patterns to guide feature priorities
- **Mobile-First**: PWA designed for smartphone use during games
- **Zero Administration**: Minimal manual management required
- **Friend-Group Scale**: Optimized for ~20 players

---

## Phase 0: Basic Read-Only PWA with Leaderboard

_Status: **COMPLETE** ✅ - Completed: 2 weeks_

### Core Features

- ✅ **PWA Leaderboard**: Mobile-optimized leaderboard showing current season rankings
- ✅ **OpenSkill Ratings**: Display player ratings calculated with margin-of-victory weights
- ✅ **Player Profiles**: Individual player statistics and rating progression charts
- ✅ **Game History**: View past games with final scores and rating changes
- ✅ **Season Stats**: Overview of current season progress and player activity

### Technical Implementation - **COMPLETE**

- ✅ Next.js 15 PWA with iOS optimization
- ✅ Supabase database with source/derived table architecture
- ✅ Python OpenSkill service for rating calculations (materialization.py)
- ✅ Read-only interface (no write operations in webapp)
- ✅ Mobile-first responsive design
- ✅ Configuration-driven rating system with YAML configs
- ✅ Hash-based caching for performance optimization
- ✅ Comprehensive test suite (41 tests, 100% pass rate)
- ✅ FastAPI endpoints for webhook integration
- ✅ CLI tools for manual data operations

### Data Entry Method

- **Admin Manual Entry**: Commissioner manually enters final scores into database
- **No Webapp Writes**: Phase 0 focuses purely on display functionality
- **Source Data**: Games, players, and final scores stored in source tables
- **Derived Cache**: Ratings and statistics computed by Python service

### Success Metrics

- 🎯 PWA installable on iOS devices
- 🎯 Leaderboard displays accurate OpenSkill ratings
- 🎯 Game history and player profiles functional
- 🎯 Mobile interface optimized for touch navigation
- 🎯 Page load times <2 seconds on mobile

---

## Phase 0.5: Configuration Playground ⭐

_Status: **BACKEND READY** ✅ - Frontend Implementation: 3-4 weeks_

### Revolutionary Features

- 🎯 **Interactive Configuration UI**: Sliders and controls for all rating parameters
- 🎯 **Live Rating Preview**: See how rule changes affect current rankings in real-time
- 🎯 **Smart Caching System**: Hash-based caching for instant configuration switching
- 🎯 **Compare Mode**: Side-by-side comparison of official vs. experimental rankings
- 🎯 **Save & Share Configs**: Users can save interesting rule combinations and share with others
- 🎯 **Configuration Templates**: Pre-built configs like "High Stakes", "Beginner Friendly", etc.

### User Experience Innovation

- 🎯 **"What-If" Scenarios**: Players can see how different rules would affect their ranking
- 🎯 **Parameter Education**: Interactive tooltips explaining what each setting does
- 🎯 **Configuration History**: Track and compare different rule sets over time
- 🎯 **Community Proposals**: Players can propose rule changes for admin consideration
- 🎯 **A/B Testing UI**: Admins can test rule changes before making them official

### Technical Architecture

- 🎯 **Configuration Hash System**: SHA-256 based configuration identification
- 🎯 **Intelligent Cache Invalidation**: Automatic cache cleanup when source data changes
- 🎯 **Performance Monitoring**: Track cache hit rates and computation times
- 🎯 **Background Computation**: Pre-warm popular configuration combinations
- 🎯 **Configuration Validation**: Real-time parameter validation with helpful error messages

### Success Metrics

- [ ] Cache hit rate >90% for common configurations
- [ ] Average configuration switch time <500ms
- [ ] Users experiment with configurations (>50% engagement)
- [ ] Zero impact on official season rating performance
- [ ] Community generates >10 interesting configuration variants

---

## Phase 1: Live Game Tracking

_Status: **IN PLANNING** - Target: 4-6 weeks_

### New Features

- 🎯 **Hand-by-Hand Entry**: Track individual hands during play
- 🎯 **Real-Time Scoring**: Live score updates as hands are played
- 🎯 **Game History**: Detailed hand logs and game replays
- 🎯 **Enhanced Statistics**: Win rates, riichi frequency, deal-in rates
- 🎯 **Game Timer**: Track game duration and pacing
- 🎯 **Wind Tracking**: Automatic dealer rotation and wind assignments

### User Experience Improvements

- 🎯 **Quick Entry Interface**: Fast input for common hand types
- 🎯 **Error Prevention**: Validation and warnings for impossible scores
- 🎯 **Undo Functionality**: Fix mistakes during live entry
- 🎯 **Offline Support**: Continue tracking even without internet
- 🎯 **Auto-Save**: Never lose game progress

### Technical Enhancements

- 🎯 **Hand Events Schema**: Extend database for detailed logging
- 🎯 **Real-Time Sync**: WebSocket updates for live games
- 🎯 **Advanced Statistics**: Complex queries for performance metrics
- 🎯 **Data Validation**: Comprehensive game state validation
- 🎯 **Performance Optimization**: Fast queries for large datasets

### Success Metrics

- [ ] Average hand entry time < 30 seconds
- [ ] 95% accuracy in score tracking vs. manual counting
- [ ] Zero data loss incidents during live games
- [ ] Players prefer digital tracking over paper scoresheets

---

## Phase 2: Scheduling & Tournament Management

_Status: **FUTURE** - Target: 6-8 weeks_

### New Features

- 📅 **Game Scheduling**: Propose and coordinate game sessions
- 📅 **Availability Tracking**: Players indicate when they can play
- 📅 **Automatic Scheduling**: AI-powered optimal scheduling suggestions
- 📅 **Notifications**: Push notifications for upcoming games
- 📅 **RSVP System**: Confirm attendance for scheduled games
- 📅 **Substitute Management**: Handle last-minute player changes

### Advanced Features

- 📅 **Tournament Mode**: Multi-session tournament tracking
- 📅 **Location Management**: Track and suggest game venues
- 📅 **Weather Integration**: Consider weather in scheduling decisions
- 📅 **Calendar Export**: Sync with Google Calendar, Apple Calendar
- 📅 **Group Chat Integration**: Discord/Slack notifications

### Technical Infrastructure

- 📅 **Scheduling Algorithm**: Optimize for player preferences and constraints
- 📅 **Notification Service**: Push notifications and email alerts
- 📅 **Calendar APIs**: Integration with external calendar systems
- 📅 **Time Zone Handling**: Support for players in different zones
- 📅 **Background Jobs**: Automated scheduling and reminder tasks

### Success Metrics

- [ ] 80% of games scheduled through the system
- [ ] Average scheduling coordination time reduced by 70%
- [ ] 90% player attendance rate for scheduled games
- [ ] Zero scheduling conflicts or double-bookings

---

## Phase 3: Advanced Analytics & Social Features

_Status: **FUTURE** - Target: 4-6 weeks_

### Analytics Dashboard

- 📊 **Performance Trends**: Rating progression over time
- 📊 **Head-to-Head Records**: Player vs. player statistics
- 📊 **Seasonal Analysis**: Compare performance across seasons
- 📊 **Prediction Engine**: Forecast future ratings and matchups
- 📊 **Export Capabilities**: CSV/PDF reports for external analysis

### Social Features

- 👥 **Achievement System**: Badges for milestones and accomplishments
- 👥 **Rivalry Tracking**: Special stats for frequent opponents
- 👥 **Photo Gallery**: Game photos and memorable moments
- 👥 **News Feed**: Activity updates and highlights
- 👥 **Comments System**: Post-game discussions and reactions

### Gamification

- 🏆 **Leaderboard Variety**: Multiple ranking categories
- 🏆 **Seasonal Awards**: Formal recognition for top performers
- 🏆 **Challenge System**: Special match types and objectives
- 🏆 **Streak Tracking**: Visualize hot and cold streaks
- 🏆 **Legacy Statistics**: All-time records and hall of fame

---

## Technical Debt & Infrastructure

### Ongoing Improvements

- 🔧 **Performance Optimization**: Database query optimization
- 🔧 **Code Quality**: Refactoring and test coverage improvements
- 🔧 **Security Hardening**: Enhanced authentication and data protection
- 🔧 **Monitoring**: Application performance and error tracking
- 🔧 **Documentation**: Comprehensive API and system documentation

### Scalability Considerations

- 🔧 **Database Optimization**: Indexing and query performance
- 🔧 **Caching Strategy**: Redis for frequently accessed data
- 🔧 **CDN Integration**: Fast asset delivery globally
- 🔧 **API Rate Limiting**: Protect against abuse and overuse
- 🔧 **Background Processing**: Async jobs for heavy computations

---

## Future Expansion Ideas

### League Network (Phase 4+)

- 🌐 **Multi-League Support**: Connect multiple friend groups
- 🌐 **Cross-League Play**: Inter-league tournaments and events
- 🌐 **Global Rankings**: Compare against other leagues worldwide
- 🌐 **Franchise Mode**: Seasonal team-based competition

### Advanced Integrations

- 🔌 **Streaming Integration**: OBS overlays for stream broadcasting
- 🔌 **Voice Integration**: Alexa/Google Assistant for score queries
- 🔌 **Hardware Integration**: Automatic scoring with smart tables
- 🔌 **VR/AR Features**: Immersive game replay and analysis

### Machine Learning

- 🤖 **Play Style Analysis**: Identify strategic patterns and tendencies
- 🤖 **Coaching Recommendations**: Personalized improvement suggestions
- 🤖 **Fraud Detection**: Identify suspicious scoring patterns
- 🤖 **Optimal Seating**: AI-powered seating arrangements for fairness

---

## Development Resources

### Phase 0.5 Estimates

| Feature Area                   | Effort (weeks) | Priority | Dependencies         |
| ------------------------------ | -------------- | -------- | -------------------- |
| Configuration Schema           | 1              | High     | Phase 0 complete     |
| Hash-based Caching             | 1-2            | High     | Configuration Schema |
| Interactive UI Components      | 2              | High     | Configuration Schema |
| Cache Performance Optimization | 1              | Medium   | Caching System       |
| Configuration Templates        | 1              | Low      | Interactive UI       |

### Phase 1 Estimates

| Feature Area         | Effort (weeks) | Priority | Dependencies       |
| -------------------- | -------------- | -------- | ------------------ |
| Hand Events Schema   | 1              | High     | Phase 0.5 complete |
| Live Entry Interface | 2-3            | High     | Hand Events        |
| Real-time Sync       | 1-2            | Medium   | Live Entry         |
| Enhanced Statistics  | 1              | Medium   | Hand Events        |
| Offline Support      | 1-2            | Low      | Live Entry         |

### Resource Requirements

- **Frontend Developer**: React/Next.js expertise, UI/UX skills for configuration interfaces
- **Backend Developer**: Python, PostgreSQL, Supabase, caching strategies
- **UI/UX Designer**: Mobile-first design for game scenarios and configuration playground
- **QA Tester**: Riichi Mahjong rules knowledge helpful, configuration validation testing

### Risk Mitigation

- **Scope Creep**: Strict phase boundaries, configuration playground as separate phase
- **User Adoption**: Early user testing of configuration features
- **Technical Complexity**: Proof-of-concept for caching system before full implementation
- **Performance Impact**: Careful monitoring of cache hit rates and computation times
- **Data Integrity**: Comprehensive testing of configuration-driven calculations

---

## Success Measurement

### Quantitative Metrics

- **User Engagement**: Games per week, session duration, configuration experiment frequency
- **System Reliability**: Uptime, error rates, data accuracy, cache performance
- **Performance**: Page load times, input responsiveness, configuration switch times
- **Adoption**: % of games tracked digitally vs. paper, configuration feature usage

### Qualitative Feedback

- **User Satisfaction**: Regular surveys and feedback sessions
- **Pain Point Identification**: Common user complaints and requests
- **Feature Utilization**: Which features are actually used, most popular configurations
- **Competitive Balance**: Does the rating system feel fair? Do experiments enhance engagement?
- **Configuration Innovation**: What creative rule combinations do users discover?

This roadmap provides a clear path from basic functionality to a comprehensive mahjong league management system while maintaining focus on the core user experience.
