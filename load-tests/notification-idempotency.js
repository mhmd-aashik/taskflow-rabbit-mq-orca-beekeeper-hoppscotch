import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    duplicate_notifications: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 100,
      maxDuration: '1m',
    },
  },
};

const BASE_URL = 'http://localhost:3002';
const TASK_ID = __ENV.TASK_ID;

export function setup() {
  if (!TASK_ID) {
    throw new Error('TASK_ID environment variable is required');
  }
}

export default function () {
  const response = http.post(`${BASE_URL}/tasks/${TASK_ID}/replay-event`, null);

  console.log(`HTTP Status: ${response.status}`);
  console.log(`Response: ${response.body}`);

  check(response, {
    'event published successfully': (r) => r.status === 200 || r.status === 202,
  });

  sleep(0.1);
}
