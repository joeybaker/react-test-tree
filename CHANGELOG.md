### v1.0.0-rc2
* Fixed issue where internal react-test-tree ids would end up being passed down to children, causing `node.getIn()` to return extra nodes
* Added support for the `wrap` option which causes the root node to be wrapped in another component. See README

### v1.0.0-rc1
__BREAKING CHANGE:__

* Refs are no longer accessed as direct properties of a node. Instead, they should be retrieved with `node.get()` or `node.getIn()`

### v0.3.1
* Ensure refCollection works on composite components as well as basic elements

### v0.3.0
* Add support for ignoring Higher Order Components through the innerComponentRef property
* Better test coverage for extra simulate events

### v0.2.2
* Correct broken release in 0.2.1

### v0.2.1
* Emit a warning on clashing ref/method names instead of throwing an error

### v0.2.0
* Removed built dist files - published as minor to avoid disrupting the very tiny percentage of people who might be using them

### v0.1.8
* Re-render tree on child updates in order for parent's refs to update correctly

### v0.1.7
* Fix warnings about calls to 'isMounted' on React components by using `React.findDOMNode` in a try-catch instead.

### v0.1.6
* Use `React.findDOMNode` internally instead of `element.getDOMNode`
* Ensure all node properties are protected by using `Object.getOwnPropertyName`s instead of `_.keys`
* Add new config option, `context`, that allows you to supply a context to use on your component

### v0.1.5
* Add `mount` option

### v0.1.4
* Fix bug when disposing of a null component

### v0.1.3
* Allow stubbing of refs
* Make key attribute available directly on nodes

### v0.1.2
* Fix dependency on babelify
* Add support for react-bootstrap components

### v0.1.0
* Initial release