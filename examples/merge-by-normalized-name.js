// This is an example for a CouchDB view that allows merging contacts by name.
// Remember to fetch the view with inlude_docs parameter.
function map(doc) {

  function normalize (name) {
    return (name || '')
      .toUpperCase()
      .replace(/[\s.]+/g, ' ')
      .trim()
  }

  var normalized = [doc.surname, doc.otherNames].map(normalize)

  if (normalized[0] && normalized[1]) {
    emit(normalized.join(' | '), null)
  }
}
