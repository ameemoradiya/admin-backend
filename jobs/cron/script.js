'use strict';

const debug = require('debug')('Demo:test');
const CronJob = require('cron').CronJob;
const APP_CONSTANTS = require('../../constants/AppConstants');

function start () {
  debug('script working');
}
start();

let job;
const TEST_JOB = APP_CONSTANTS.TEST_JOB;

job = new CronJob(`${TEST_JOB.Seconds} ${TEST_JOB.Minutes} ${TEST_JOB.Hours} ${TEST_JOB.DayOfMonth} ${TEST_JOB.Months} ${TEST_JOB.DayOfWeek}`,
  function () {
    debug('job start');
  }, true);

job.start();
