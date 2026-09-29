import assert from 'node:assert/strict';
import test from 'node:test';

const { shipmentPreviews, orderShipmentExamples } = (await import(
  new URL('./shipments.ts', import.meta.url).href
)) as typeof import('./shipments');

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

test('offers twenty distinct illustrative vehicles across all four shipment stages', () => {
  assert.equal(shipmentPreviews.length, 20);
  assert.equal(new Set(shipmentPreviews.map((example) => example.id)).size, 20);
  assert.equal(
    new Set(shipmentPreviews.map((example) => example.vehicle)).size,
    20,
  );
  const statuses = ['Carrier assigned', 'Picked up', 'In transit', 'Delivered'];
  for (const example of shipmentPreviews) {
    assert.equal(example.status, statuses[example.stage]);
  }
  for (const status of statuses) {
    assert.equal(
      shipmentPreviews.filter((example) => example.status === status).length,
      5,
    );
  }
});

test('shuffles a copy without omitting or duplicating an example', () => {
  const originalIds = shipmentPreviews.map((example) => example.id);
  for (let seed = 0; seed < 100; seed += 1) {
    const ordered = orderShipmentExamples(
      shipmentPreviews,
      undefined,
      seededRandom(seed),
    );
    assert.notEqual(ordered, shipmentPreviews);
    assert.deepEqual(
      ordered.map((example) => example.id).sort(),
      [...originalIds].sort(),
    );
  }
  assert.deepEqual(
    shipmentPreviews.map((example) => example.id),
    originalIds,
  );
});

test('refresh always changes both vehicle and status from every previous example', () => {
  for (const previous of shipmentPreviews) {
    for (let seed = 0; seed < 100; seed += 1) {
      const ordered = orderShipmentExamples(
        shipmentPreviews,
        previous,
        seededRandom(seed),
      );
      assert.notEqual(ordered[0].id, previous.id);
      assert.notEqual(ordered[0].vehicle, previous.vehicle);
      assert.notEqual(ordered[0].status, previous.status);
      assert.equal(
        new Set(ordered.map((example) => example.id)).size,
        shipmentPreviews.length,
      );
    }
  }
});

test('an obsolete remembered example still avoids its status and sparse sets remain safe', () => {
  const ordered = orderShipmentExamples(
    shipmentPreviews,
    { id: 'removed-example', status: 'In transit' },
    () => 0,
  );
  assert.notEqual(ordered[0].status, 'In transit');
  assert.deepEqual(orderShipmentExamples([]), []);
  assert.deepEqual(
    orderShipmentExamples([shipmentPreviews[0]], shipmentPreviews[0]),
    [shipmentPreviews[0]],
  );
});
