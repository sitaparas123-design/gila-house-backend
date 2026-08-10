const cron = require('node-cron');
const reportService = require('../services/report.service');

const initCronJobs = () => {
  console.log('[Cron] Initializing payment report schedules...');

  // Daily Report: Runs every day at 23:59 (11:59 PM)
  cron.schedule('59 23 * * *', async () => {
    console.log('[Cron] Triggering Daily Report...');
    await reportService.generateAndSendReport('daily');
  });

  // Weekly Report: Runs every Sunday at 23:55 (11:55 PM)
  cron.schedule('55 23 * * 0', async () => {
    console.log('[Cron] Triggering Weekly Report...');
    await reportService.generateAndSendReport('weekly');
  });

  // Monthly Report: Runs on the last day of the month at 23:50 (11:50 PM)
  // node-cron does not have "L" for last day, so running on day 28-31 logic or just using 1st day of next month.
  // Actually, '50 23 28-31 * *' with a date check is better, but node-cron supports standard expressions.
  // A simple approximation is running at 11:50 PM every day and checking if tomorrow is the 1st.
  cron.schedule('50 23 * * *', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.getDate() === 1) {
      console.log('[Cron] Triggering Monthly Report...');
      await reportService.generateAndSendReport('monthly');
    }
  });
};

module.exports = { initCronJobs };
