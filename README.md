merge-docs
==========

[![Build Status](https://travis-ci.org/eHealthAfrica/merge-docs.svg)](https://travis-ci.org/eHealthAfrica/merge-docs)

Merge docs from a CouchDB view input

Installation
------------

```sh
npm install -g merge-docs
```

Usage
-----

You can pipe a JSON response from a CouchDB view straight into the script:

```sh
curl http://localhost:5984/db/_design/merge/_view/normalized-name?include_docs=true | ./bin/main.js | python -m json.tool | less
```

Running the Tests
-----------------

From the project root run:

```sh
npm test
```

---
Apache License 2.0
