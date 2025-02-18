const _ = require('lodash');
const Models = require('../../domain/models');
const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');

const attributesForBelongsToRelationships = _.keys(Models).map((key) => _.lowerFirst(key));
const attributesForHasManyRelationships = _.keys(Models).map((key) => _.lowerFirst(key) + 's');

module.exports = {
  buildDomainObjects,
  buildDomainObject,
};

function buildDomainObjects(BookshelfClass, bookshelfObjects) {
  return bookshelfObjects.map(
    (bookshelfObject) => buildDomainObject(BookshelfClass, bookshelfObject)
  );
}

function buildDomainObject(BookshelfClass, bookshelfObject) {
  return _buildDomainObject(BookshelfClass.prototype, bookshelfObject.toJSON());
}

function _buildDomainObject(bookshelfPrototype, bookshelfObjectJson, domainObject) {

  domainObject = domainObject || new Models[bookshelfPrototype.constructor.bookshelfName];

  const bookshelfClassKeys = Object.keys(bookshelfPrototype);

  const mappedObject = _.mapValues(domainObject, (value, key) => {

    // TODO: Remove this after refactoring SmartPlacementKnowledgeElements into KnowledgeElements
    if (bookshelfPrototype.constructor.bookshelfName === 'User' && key === 'knowledgeElements') {
      const relationshipPrototype = _getRelationshipPrototype(bookshelfPrototype, key);

      return bookshelfObjectJson[key] && bookshelfObjectJson[key].map((bookshelfObject) => {
        const smartPlacementKnowledgeElement = new SmartPlacementKnowledgeElement();
        return _buildDomainObject(relationshipPrototype, bookshelfObject, smartPlacementKnowledgeElement);
      });
    }

    if (_isABelongsToRelationship(bookshelfClassKeys, bookshelfObjectJson, key)) {
      return _buildDomainObject(
        _getRelationshipPrototype(bookshelfPrototype, key),
        bookshelfObjectJson[key]
      );
    }

    if (_isAHasManyRelationship(bookshelfClassKeys, bookshelfObjectJson, key)) {
      const relationshipPrototype = _getRelationshipPrototype(bookshelfPrototype, key);

      return bookshelfObjectJson[key].map(
        (bookshelfObject) => _buildDomainObject(relationshipPrototype, bookshelfObject)
      );
    }

    return bookshelfObjectJson[key];
  });

  Object.assign(domainObject, mappedObject);

  return domainObject;
}

function _isABelongsToRelationship(bookshelfClassKeys, bookshelfObjectJson, key) {
  return attributesForBelongsToRelationships.includes(key)
    && bookshelfClassKeys.includes(key)
    && _.isObject(bookshelfObjectJson[key]);
}

function _isAHasManyRelationship(bookshelfClassKeys, bookshelfObjectJson, key) {
  return attributesForHasManyRelationships.includes(key)
    && bookshelfClassKeys.includes(key)
    && Array.isArray(bookshelfObjectJson[key]);
}

function _getRelationshipPrototype(bookshelfPrototype, key) {
  return bookshelfPrototype[key]().relatedData.target.prototype;
}
