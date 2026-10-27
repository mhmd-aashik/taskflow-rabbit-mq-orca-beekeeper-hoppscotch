import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '10s',
  // thresholds: {
  //   http_req_failed: ['rate<0.01'],
  //   http_req_duration: ['p(95)<500'],
  //   checks: ['rate>0.99'],
  // },
};

const BASE_URL = 'http://localhost:3002';
const USER_ID = '00f0cd0c-e02a-40a0-94c0-880a440e49c9';

export default function () {
  const payload = JSON.stringify({
    title: `k6 Smoke Test ${__VU}-${__ITER}`,
    description: 'Testing TaskFlow API with k6',
    createdBy: USER_ID,
  });

  const response = http.post(`${BASE_URL}/tasks`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  check(response, {
    'task created successfully': (r) => r.status === 201,
  });

  sleep(1);
}
