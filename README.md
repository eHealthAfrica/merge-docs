merge-docs
==========

[![Build Status](https://travis-ci.org/eHealthAfrica/merge-docs.svg)](https://travis-ci.org/eHealthAfrica/merge-docs)

Interactively merge CouchDB documents in order to clean up potentially
duplicated data.

Installation
------------

```sh
npm install -g merge-docs
```

Usage
-----

Point the script to a CouchDB view that generates identical keys for docs that
should be merged:

```sh
merge-docs http://localhost:5984/db/_design/merge/_view/normalized-name
```

Running the Tests
-----------------

From the project root run:

```sh
npm test
```

TODO
----

- update db
- replace ids
- selectively apply merge
- show full docs
- collapse at given depth
- end-to-end testing

---
Apache License 2.0
