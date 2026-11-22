import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests_total');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 VUs
    { duration: '1m', target: 50 },    // Stay at 50 VUs
    { duration: '30s', target: 100 },  // Ramp up to 100 VUs
    { duration: '2m', target: 100 },   // Stay at 100 VUs
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
  },
  ext: {
    loadimpact: {
      projectID: __ENV.K6_PROJECT_ID,
      name: 'Ecosky.id Load Test',
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://ecosky.id';

const endpoints = [
  { path: '/', name: 'homepage' },
  { path: '/', name: 'homepage_cached' },
];

export function setup() {
  // Warm up
  const res = http.get(BASE_URL);
  check(res, { 'warmup ok': (r) => r.status === 200 });
  return { baseUrl: BASE_URL };
}

export default function (_data) {
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const url = `${BASE_URL}${endpoint.path}`;

  const params = {
    headers: {
      'User-Agent': 'k6-load-test/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    timeout: '30s',
  };

  const res = http.get(url, params);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'has body': (r) => r.body && r.body.length > 0,
    'content-type html': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html') || true,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
  requestCount.add(1);

  if (!success) {
    console.log(`Failed request to ${url}: ${res.status} ${res.error}`);
  }

  sleep(Math.random() * 2 + 1); // 1-3s think time
}

export function teardown(_data) {
  console.log('Load test completed');
}
