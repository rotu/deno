// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
import { assert, unitTest } from "./test_util.ts";

unitTest(
  { permissions: { read: true } },
  function utimeSyncFileSuccess() {
    const w = new Worker(
      new URL("../workers/worker_types.ts", import.meta.url).href,
      { type: "module" },
    );
    assert(w);
    w.terminate();
  },
);
