import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 10 }, // traffic ramp-up
    { duration: '30s', target: 100 },
    { duration: '5s', target: 0 }, // traffic ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    http_req_duration: ['p(99)<600'],
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

}
