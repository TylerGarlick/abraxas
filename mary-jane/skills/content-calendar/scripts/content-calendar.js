#!/usr/bin/env node
/**
 * Content Calendar - Plans content publishing schedule
 * Trigger: "content calendar", "MJ calendar"
 */

const CONTENT_TYPES = ['blog', 'social', 'email', 'video', 'webinar', 'podcast'];
const PLATFORMS = ['blog', 'twitter', 'linkedin', 'instagram', 'facebook', 'youtube', 'newsletter'];

function generateCalendar(options = {}) {
  const {
    startDate = new Date(),
    weeks = 4,
    frequency = { blog: 1, social: 5, email: 2 },
    topics = []
  } = options;
  
  const calendar = [];
  const start = new Date(startDate);
  
  // Default topics if none provided
  const defaultTopics = [
    'Industry trends and insights',
    'How-to tutorial',
    'Case study or success story',
    'Tips and best practices',
    'Behind-the-scenes',
    'Product updates',
    'Thought leadership'
  ];
  
  const contentTopics = topics.length > 0 ? topics : defaultTopics;
  
  // Generate entries for each week
  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (week * 7));
    
    const weekEntries = [];
    
    // Blog posts
    for (let i = 0; i < (frequency.blog || 0); i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + (i * 7 / (frequency.blog || 1)));
      weekEntries.push({
        date: day.toISOString().split('T')[0],
        type: 'blog',
        platform: 'blog',
        topic: contentTopics[week % contentTopics.length],
        status: 'planned'
      });
    }
    
    // Social posts
    for (let i = 0; i < (frequency.social || 5); i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + (i % 5));
      weekEntries.push({
        date: day.toISOString().split('T')[0],
        type: 'social',
        platform: PLATFORMS[1 + (i % 5)], // Rotate through social platforms
        topic: `Social: ${contentTopics[(week + i) % contentTopics.length]}`,
        status: 'planned'
      });
    }
    
    // Email
    for (let i = 0; i < (frequency.email || 2); i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + (i * 7 / (frequency.email || 2)));
      weekEntries.push({
        date: day.toISOString().split('T')[0],
        type: 'email',
        platform: 'newsletter',
        topic: contentTopics[(week * 2 + i) % contentTopics.length],
        status: 'planned'
      });
    }
    
    calendar.push(...weekEntries);
  }
  
  // Group by date
  const byDate = {};
  calendar.forEach(entry => {
    if (!byDate[entry.date]) {
      byDate[entry.date] = [];
    }
    byDate[entry.date].push(entry);
  });
  
  return {
    startDate: start.toISOString().split('T')[0],
    weeks,
    entries: calendar,
    byDate,
    summary: {
      total: calendar.length,
      byType: CONTENT_TYPES.reduce((acc, type) => {
        acc[type] = calendar.filter(e => e.type === type).length;
        return acc;
      }, {})
    }
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Content Calendar - Plan content schedule');
    console.log('Usage: node content-calendar.js [weeks] [options]');
    console.log('Options: --format json|csv|markdown');
    return;
  }
  
  const weeks = parseInt(args[0]) || 4;
  const result = generateCalendar({ weeks });
  
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateCalendar, CONTENT_TYPES, PLATFORMS };
