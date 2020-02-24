import test from 'tape';

test('proxy setter detection', t => {
  let object = {
    header: 'alice',
  };
  let called = 0;
  let proxy = new Proxy(object, {
    set(
      target: { header: string },
      p: string | number | symbol,
      value: any,
      receiver: any,
    ): boolean {
      called++;
      return Reflect.set(target, p, value, receiver);
    },
  });

  t.equals(object.header, 'alice');
  t.equals(proxy.header, 'alice');
  t.equals(called, 0);

  proxy.header = 'bob'; // direct assign
  t.equals(object.header, 'bob');
  t.equals(proxy.header, 'bob');
  t.equals(called, 1);

  Object.assign(proxy, { header: 'cherry' }); // Object.assign
  t.equals(object.header, 'cherry');
  t.equals(proxy.header, 'cherry');
  t.equals(called, 2);

  t.end();
});
