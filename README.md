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

You can pipe a JSON response from a CouchDB view straight into the script:

```sh
curl http://localhost:5984/db/_design/merge/_view/normalized-name > merge-docs
```

Running the Tests
-----------------

From the project root run:

```sh
npm test
```


---
Apache License 2.0
