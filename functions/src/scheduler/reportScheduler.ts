/*
 * reportScheduler.ts
 *
 * Firebase Cloud Functions scheduler that triggers report generation. It runs
 * daily, weekly (Sunday), and monthly jobs. Use this to schedule
 * generateReport from reportingEngine. Ensure time zone is considered.
 */
import * as functions from 'firebase-functions';
import { generateReport } from '../ai/reportingEngine';

// Replace with your project's time zone or use param
const timeZone = 'America/Chicago';

// Daily report at 8 PM
export const dailyReport = functions.pubsub.schedule('0 20 * * *')
  .timeZone(timeZone)
  .onRun(async context => {
    // TODO: iterate seniors from DB; simplified to one senior
    const seniors = ['current'];
    for (const seniorId of seniors) {
      await generateReport(seniorId, 'daily');
    }
  });

// Weekly report on Sunday at 20:00
export const weeklyReport = functions.pubsub.schedule('0 20 * * 0')
  .timeZone(timeZone)
  .onRun(async context => {
    const seniors = ['current'];
    for (const seniorId of seniors) {
      await generateReport(seniorId, 'weekly');
    }
  });

// Monthly report on last day of month at 20:00
export const monthlyReport = functions.pubsub.schedule('0 20 L * *')
  .timeZone(timeZone)
  .onRun(async context => {
    const seniors = ['current'];
    for (const seniorId of seniors) {
      await generateReport(seniorId, 'monthly');
    }
  });