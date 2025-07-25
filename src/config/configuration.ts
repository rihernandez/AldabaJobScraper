export default () => ({
  port: parseInt(process.env.PORT, 10) || 8000,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    recipientNumber: process.env.RECIPIENT_WHATSAPP_NUMBER || '',
    // Support multiple recipients separated by comma
    recipientNumbers: process.env.RECIPIENT_WHATSAPP_NUMBERS || process.env.RECIPIENT_WHATSAPP_NUMBER || '',
  },
  scraping: {
    url: 'https://www.aldaba.com/index.php?bbdd=246',
    intervalMinutes: 5,
    noJobsNotificationHours: 6,
  },
  keywords: [
    'Sistema',
    'Desarrollador',
    'Developer',
    'Javascript',
    'Nodejs',
    'Backend',
    'Software engineer',
    'Ingeniero de sistemas',
    'Frontend',
    'Fullstack',
    'Programador',
    'React',
    'Angular',
    'Vue',
    'Python',
    'Java',
    'C#',
    'PHP',
    'DevOps',
    'QA',
    'Testing',
    'Database',
    'SQL',
    'MongoDB',
    'API',
    'Web developer',
    'Mobile developer',
    'iOS',
    'Android',
    'Flutter',
    'React Native',
  ],
});
