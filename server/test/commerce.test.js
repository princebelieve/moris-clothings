const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeItems, priceItems } = require('../src/utils/checkout');
const id = '111111111111111111111111';
const product = { _id: id, name: 'Senator Set', price: 125.25, available: true, sizes: ['M', 'L'] };
const fakeOrder = {};
const fakeSettings = {};
const fakeProduct = {};
const fakeUser = {};
const fakeStripe = { checkout: { sessions: {} }, webhooks: {} };
function inject(modulePath, exports) { const filename = require.resolve(modulePath); require.cache[filename] = { id: filename, filename, loaded: true, exports }; }
inject('../src/models/Order', fakeOrder);
inject('../src/models/Settings', fakeSettings);
inject('../src/models/Product', fakeProduct);
inject('../src/models/User', fakeUser);
inject('../src/services/stripe', fakeStripe);
const payments = require('../src/routes/payment.routes');
const orders = require('../src/routes/order.routes');
const webhook = require('../src/routes/webhook.routes');
const fulfillOrder = require('../src/services/fulfillOrder');
const { protect, adminOnly } = require('../src/middleware/auth');
const { registerUser } = require('../src/controllers/auth.controller');
const jwt = require('jsonwebtoken');
function response() { return { code: 200, body: null, headers: {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, send(body) { this.body = body; return this; }, set(k,v) { this.headers[k] = v; return this; } }; }
const handler = (router, route, method = 'post') => router.stack.find(s => s.route?.path === route && s.route.methods[method]).route.stack.at(-1).handle;
let stored;
let stripeInput;
beforeEach(() => {
  stripeInput = null;
  stored = { _id: '444444444444444444444444', status: 'pending', fulfillment: 'unfulfilled', items: [{ name: 'Senator Set', quantity: 2, price: 125.25 }], stripeSessionId: 'cs_test_12345678901234567890', amount: 256, delivery: 5.5 };
  fakeSettings.findById = async () => ({ shippingZones: [{ name: 'UK', countries: ['GB'], fee: 5.5 }], checkoutPaused: false });
  fakeProduct.find = async () => [product];
  fakeOrder.create = async data => ({ ...data, _id: stored._id });
  fakeOrder.updateOne = async () => ({});
  fakeOrder.findOne = async query => query.stripeSessionId === stored.stripeSessionId ? stored : null;
  fakeOrder.findOneAndUpdate = async (query, update) => {
    if (query.stripeSessionId && query.stripeSessionId !== stored.stripeSessionId) return null;
    if (query.status?.$ne === 'paid' && stored.status === 'paid') return null;
    if (query.stripeSessionId?.$exists === false && stored.stripeSessionId) return null;
    Object.assign(stored, update.$set || update.$setOnInsert); return stored;
  };
  fakeStripe.checkout.sessions.create = async data => { stripeInput = data; return { id: stored.stripeSessionId, url: 'https://checkout.stripe.com/test' }; };
  fakeStripe.checkout.sessions.retrieve = async () => session();
  fakeStripe.webhooks.constructEvent = () => ({ type: 'checkout.session.completed', data: { object: session() } });
});
function session(overrides = {}) { return { id: stored.stripeSessionId, payment_status: 'paid', amount_total: 25600, currency: 'gbp', metadata: { orderId: stored._id }, customer_details: { name: 'Customer', email: 'private@example.com', phone: '+440000' }, collected_information: { shipping_details: { name: 'Customer', address: { line1: 'Private Road', country: 'GB' } } }, ...overrides }; }

test('merges duplicate size lines; rejects empty bags, malformed IDs, oversized quantities and fractional quantities', () => {
  assert.deepEqual(normalizeItems([{ productId: id, size: 'M', quantity: 2 }, { productId: id, size: 'M', quantity: 3 }]), [{ productId: id, size: 'M', quantity: 5 }]);
  for (const items of [[], [{productId:'bad',quantity:1}], [{productId:id,quantity:0}], [{productId:id,quantity:21}], [{productId:id,quantity:1.5}], [{productId:id,quantity:'1'}], [{productId:id,quantity:1,size:{}}], [{productId:id,quantity:15},{productId:id,quantity:10}]]) assert.throws(() => normalizeItems(items));
});
test('uses catalog prices; ignores a browser-supplied price', () => {
  const lines = priceItems(normalizeItems([{productId:id,quantity:2,size:'M',price:0.01}]), [product]);
  assert.equal(lines[0].price,125.25); assert.equal(lines[0].quantity,2); assert.equal(lines[0].price * lines[0].quantity,250.5);
});
test('blocks unavailable pieces, deleted products, missing prices and invalid size combinations', () => {
  const line = [{productId:id,quantity:1,size:'M'}];
  for(const catalogue of [[],[{...product,available:false}],[{...product,price:0}],[{...product,price:NaN}],[{...product,sizes:['S']}],[{...product,sizes:[]}]]) assert.throws(()=>priceItems(line,catalogue));
  assert.throws(()=>priceItems([{productId:id,quantity:1,size:''}],[product]));
});
test('creates multi-item checkout with server pricing, server delivery fee and a saved snapshot', async () => {
  let snapshot;
  fakeOrder.create = async data => { snapshot = data; return {...data,_id:stored._id}; };
  const res=response(); await handler(payments,'/create-checkout-session')({body:{items:[{productId:id,quantity:2,size:'M',price:1}],shippingCountry:'GB',deliveryFee:0}},res);
  assert.equal(res.code,200); assert.equal(stripeInput.line_items[0].price_data.unit_amount,12525); assert.equal(stripeInput.line_items[0].quantity,2);
  assert.equal(stripeInput.shipping_options[0].shipping_rate_data.fixed_amount.amount,550);
  assert.equal(snapshot.amount,256); assert.equal(snapshot.items[0].name,'Senator Set'); assert.equal(res.body.sessionId,stored.stripeSessionId);
  assert.match(stripeInput.success_url,/session_id=\{CHECKOUT_SESSION_ID\}/); assert.match(stripeInput.cancel_url,/\/cancel$/);
});
test('refuses paused checkout and unconfigured delivery destinations without creating a Stripe session', async () => {
  for(const [settings,country,code] of [[{checkoutPaused:true},'GB',409],[{shippingZones:[]},'GB',400],[{shippingZones:[{countries:['GB'],fee:5.5}]},'NG',400]]) {
    fakeSettings.findById=async()=>settings; const res=response(); await handler(payments,'/create-checkout-session')({body:{items:[{productId:id,quantity:1,size:'M'}],shippingCountry:country}},res); assert.equal(res.code,code); assert.equal(stripeInput,null);
  }
});
test('unpaid sessions cannot mark an order paid', async () => {
  assert.equal(await fulfillOrder(session({payment_status:'unpaid'})),null);assert.equal(stored.status,'pending');
});
test('payment fulfillment is idempotent and preserves shipping updates and original paid time', async () => {
  const result=await fulfillOrder(session());assert.equal(result.status,'paid');assert.equal(result.customer.email,'private@example.com');assert.equal(result.shipping.address.country,'GB');
  const paidAt=result.paidAt;stored.fulfillment='shipped';stored.trackingNumber='TRACK-123';await fulfillOrder(session());
  assert.equal(stored.fulfillment,'shipped');assert.equal(stored.trackingNumber,'TRACK-123');assert.equal(stored.paidAt,paidAt);
});
test('receipt verifies payment with Stripe and never exposes customer PII or payment session IDs', async () => {
  const res=response();await handler(orders,'/session/:sessionId','get')({params:{sessionId:stored.stripeSessionId}},res);
  assert.equal(res.code,200);assert.equal(res.body.status,'paid');assert.equal(res.headers['Cache-Control'],'no-store');assert.equal(res.body.customer,undefined);assert.equal(res.body.shipping,undefined);assert.equal(res.body.stripeSessionId,undefined);
  const invalid=response();await handler(orders,'/session/:sessionId','get')({params:{sessionId:'bad'}},invalid);assert.equal(invalid.code,400);
});
test('does not claim payment success while a delayed payment is unpaid', async () => {
  fakeStripe.checkout.sessions.retrieve=async()=>session({payment_status:'unpaid'});
  const res=response();await handler(orders,'/session/:sessionId','get')({params:{sessionId:stored.stripeSessionId}},res);assert.equal(res.body.status,'pending');
});
test('rejects forged webhooks and asks Stripe to retry on database failure', async () => {
  fakeStripe.webhooks.constructEvent=()=>{throw new Error('bad signature')};const bad=response();await handler(webhook,'/')({headers:{},body:Buffer.from('{}')},bad);assert.equal(bad.code,400);
  fakeStripe.webhooks.constructEvent=()=>({type:'checkout.session.completed',data:{object:session()}});fakeOrder.findOneAndUpdate=async()=>{throw new Error('test database outage')};const failure=response();await handler(webhook,'/')({headers:{},body:Buffer.from('{}')},failure);assert.equal(failure.code,500);
});
test('protects admin APIs against missing authentication, invalid tokens and ordinary customers', async () => {
  let nextCalled=false;const res=response();await protect({headers:{}},res,()=>{nextCalled=true});assert.equal(res.code,401);assert.equal(nextCalled,false);
  const invalid=response();await protect({headers:{authorization:'Bearer invalid'}},invalid,()=>{nextCalled=true});assert.equal(invalid.code,401);
  const denied=response();adminOnly({user:{role:'user'}},denied,()=>{nextCalled=true});assert.equal(denied.code,403);
  process.env.JWT_SECRET='test-secret-only';const token=jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'1h'});fakeUser.findById=()=>({select:async()=>({role:'admin'})});const allowed=response();const req={headers:{authorization:'Bearer '+token}};await protect(req,allowed,()=>{nextCalled=true});assert.equal(nextCalled,true);let adminPassed=false;adminOnly(req,allowed,()=>{adminPassed=true});assert.equal(adminPassed,true);
});
test('public registration cannot claim admin privileges with an email or role from the request', async () => {
  let created;fakeUser.findOne=async()=>null;fakeUser.create=async data=>{created=data;return {...data,_id:id}};process.env.JWT_SECRET='test-secret-only';
  const res=response();await registerUser({body:{name:'Shopper',email:'ADMIN@EXAMPLE.COM',password:'test-password',role:'admin'}},res);assert.equal(res.code,201);assert.equal(created.role,'user');assert.equal(created.email,'admin@example.com');
});
