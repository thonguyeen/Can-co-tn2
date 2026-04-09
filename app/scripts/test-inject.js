const args = { batch_limit: 3 };
fetch('http://localhost:3000/api/intents/crawled-inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(args)
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(e => console.error(e));
