import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

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

export function handleSummary(data) {
  return {
    'report.txt': textSummary(data, { enableColors: false }),
    stdout: textSummary(data)
  };
}

