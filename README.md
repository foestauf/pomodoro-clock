# Pomodoro Clock

A simple Pomodoro Clock application with session analytics.

## Features

- Timer with configurable session and break lengths
- Session analytics with charts and statistics
- Keyboard shortcuts for easy control
- Responsive design with Tailwind CSS 4

## Tech Stack

- React
- TypeScript
- Tailwind CSS 4
- Vite

## Development

### Installation

```bash
npm install
```

### Running the app

```bash
npm run dev
```

### Building for production

```bash
npm run build
```

### Running tests

```bash
npm test
```

## Styling with Tailwind CSS 4

This project uses Tailwind CSS 4 for styling. The configuration includes:

- **Vite Integration**: Using `@tailwindcss/vite` plugin in vite.config.ts
- **CSS Structure**: 
  - `src/index.css` - Contains Tailwind directives and base styles
  - `src/App.css` - Contains component-specific styles

### Tailwind 4 Notes

When working with Tailwind 4:

1. Use standard Tailwind utility classes in components (flex, justify-between, etc.)
2. Avoid using theme functions in CSS files
3. The PostCSS plugin is not needed as we're using the Vite plugin

### CSS Organization

The application uses a mix of:

1. Tailwind utility classes directly in the JSX
2. Component-specific CSS classes for more complex styling
3. Custom theme extensions in the Tailwind config

## Basic Usage

- Use the right side up and down arrows to adjust the sessions length.
- Use the left side up and down arrows to adjust the break length.
- At the end of each session or break, an alarm will sound and the clock will reset to either the session or break period depending on which one just ended.

## Analytics Feature

The Pomodoro Clock includes a powerful analytics feature that helps you track and visualize your productivity patterns.

### Analytics Sidebar

The analytics sidebar is located on the left side of the application and provides detailed insights into your Pomodoro sessions. It displays:

- **Summary Statistics**

  - Total completed sessions
  - Average session duration

- **Tab Navigation**
  - Daily View: Shows daily patterns and trends
  - Sessions View: Shows individual session details

### Available Charts

#### Daily View

1. **Daily Session Count**

   - Displays the number of completed sessions per day
   - Shows data for the last 7 days
   - Helps identify your most productive days

2. **Daily Average Duration**
   - Shows the average session duration for each day
   - Tracks consistency in session length
   - Helps optimize your work intervals

#### Sessions View

1. **Recent Session Durations**

   - Displays the duration of your last 10 sessions
   - Helps track session completion patterns
   - Shows variations in session lengths

2. **Session Time Distribution**
   - Shows what times of day you complete sessions
   - Helps identify your peak productivity hours
   - Displays data in a 24-hour format

### Understanding the Charts

- **Line Charts**: Each chart uses an interactive line graph format
- **Color Coding**:
  - Daily Session Count: Blue
  - Daily Average Duration: Green
  - Recent Session Durations: Orange
  - Session Time Distribution: Purple

### Data Storage

- Session data is automatically saved in your browser's local storage
- Data persists across browser sessions
- All analytics data is stored locally on your device
- No data is sent to external servers

### Tips for Using Analytics

1. **Monitor Daily Patterns**

   - Use the Daily View to identify your most productive days
   - Adjust your schedule based on when you complete the most sessions

2. **Optimize Session Duration**

   - Review the Recent Session Durations to ensure consistency
   - Adjust session lengths based on your completion patterns

3. **Find Your Peak Hours**
   - Use the Session Time Distribution to identify your most productive times
   - Schedule important tasks during your peak productivity hours
