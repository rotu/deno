// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals, assertThrows, unitTest } from "./test_util.ts";

unitTest(function resourcesCloseBadArgs() {
  assertThrows(() => {
    Deno.close((null as unknown) as number);
  }, TypeError);
});

unitTest(function resourcesStdio() {
  const res = Deno.resources();

  assertEquals(res[0], "stdin");
  assertEquals(res[1], "stdout");
  assertEquals(res[2], "stderr");
});

unitTest({ permissions: { net: true } }, async function resourcesNet() {
  const listener = Deno.listen({ port: 4501 });
  const dialerConn = await Deno.connect({ port: 4501 });
  const listenerConn = await listener.accept();

  const res = Deno.resources();
  assertEquals(
    Object.values(res).filter((r): boolean => r === "tcpListener").length,
    1,
  );
  const tcpStreams = Object.values(res).filter(
    (r): boolean => r === "tcpStream",
  );
  assert(tcpStreams.length >= 2);

  listenerConn.close();
  dialerConn.close();
  listener.close();
});

unitTest({ permissions: { read: true } }, async function resourcesFile() {
  const resourcesBefore = Deno.resources();
  const f = await Deno.open("cli/tests/testdata/hello.txt");
  const resourcesAfter = Deno.resources();
  f.close();

  // check that exactly one new resource (file) was added
  assertEquals(
    Object.keys(resourcesAfter).length,
    Object.keys(resourcesBefore).length + 1,
  );
  const newRid = +Object.keys(resourcesAfter).find((rid): boolean => {
    return !resourcesBefore.hasOwnProperty(rid);
  })!;
  assertEquals(resourcesAfter[newRid], "fsFile");
});
