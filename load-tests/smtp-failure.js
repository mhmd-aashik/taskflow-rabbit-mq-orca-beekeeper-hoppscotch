import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    smtp_failure: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: __ENV.DURATION || '10m',
      preAllocatedVUs: 10,
      maxVUs: 30,
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';
const USER_ID = __ENV.USER_ID;

export default function () {
  if (!USER_ID) {
    throw new Error('USER_ID is required');
  }

  const payload = JSON.stringify({
    title: `SMTP Failure Test ${__VU}-${__ITER}-${Date.now()}`,
    description: 'Testing RabbitMQ retries while Mailpit is offline',
    createdBy: USER_ID,
  });

  const response = http.post(`${BASE_URL}/tasks`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '10s',
  });

  check(response, {
    'task created': (r) => r.status === 201,
  });
}
