import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 10 },
    { duration: '20s', target: 80 },
    { duration: '30s', target: 80 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<200'],
    http_req_duration: ['p(90)<100'],
  }
}

export default function () {

  const responses = http.batch(['http://foo.localhost', 'http://bar.localhost']);

  check(responses[0], {
    'foo response is status 200': (r) => r.status === 200,
  });

  check(responses[1], {
    'bar response is status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
