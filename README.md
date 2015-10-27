# react-test-tree [![Build Status](https://travis-ci.org/QubitProducts/react-test-tree.svg)](https://travis-ci.org/QubitProducts/react-test-tree) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/oliverwoodings.svg)](https://saucelabs.com/u/oliverwoodings)

## Install

With [npm](http://npmjs.org) do:

```npm install --save-dev react-test-tree```

## Overview

`react-test-tree` is a simple, scalable and concise way of testing React components. It is an evolution of the [react-page-objects](https://github.com/QubitProducts/react-page-objects) library.

A test tree is dev-friendly representation of your entire React component tree, built by recursing through the refs of your elements.

React gives us some great utilities for testing React components, however they lead to overly-verbose boilerplate that clutters your tests. `react-test-tree` tidies this clutter away, allowing you to manipulate your components with short, concise statements:

```jsx
var BozComponent = React.createClass({
  render: function () {
    return (
      <div>
        <button ref="biz">Biz</button>
      </div>
    );
  }
});

var FuzComponent = React.createClass({
  render: function () {
    return <div />
  }
});

var FooComponent = React.createClass({
  render: function () {
    return (
      <div>
        <button ref="bar">Bar</button>
        <select refCollection="baz">
          <option>blue</option>
          <option>gold</option>
        </select>
        <BozComponent ref="boz" />
        <FuzComponent ref="fuz" />
      </div>
    );
  }
});

var fooTree = testTree(<FooComponent />, {
  stub: {
    fuz: null
  }
});
fooTree.get("bar").click(); // simulates a click
fooTree.getIn(["boz", "biz"]).click(); // simulates a click on a deep node
fooTree.get("baz").length === 2; // collection of nodes
fooTree.get("fuz") === null; // null due to being stubbed out
```

In the above example, `react-test-tree` has recursively built a tree with all refs and refCollections represented as nodes of the tree, which can be retrieved using `get()` or `getIn()`. Any refs that appear in the `stub` tree config get replaced.


## refs and refCollections

You should be familiar with the `ref` prop in React. They are used when you need to reference an element in your render function. Unfortunately react does not give us an easy way to reference a collection of `ref`s as a whole. `react-test-tree` makes this possible by use of the `refCollection` prop. Declaring `refCollection` on a component will make all it's direct children available on the corresonding tree node as an array:

```jsx
var BarComponent = React.createClass({
  render: function () {
    return (
      <select ref="foo" refCollection="bar">
        <option value="blue">Blue</option>
        <option value="gold">Gold</option>
      </select>;
    );
  }
});

var barTree = testTree(<BarComponent />);
barTree.get("bar").length === 2;
barTree.get("bar")[0].getAttribute("value") === "blue";
```

__Notes__:
* You can still apply a `ref` as well as a `refCollection` if you want to be able to manipulate the parent element too.
* `ref`s and `refCollection`s may not have the same name.


## Stubs

It is inevitable that at some point when testing React components you will want to avoid rendering part of a component. Perhaps it might trigger some sideways data loading, or maybe you want to replace it with a mock. `react-test-tree` allows you to quickly and easily stub out any refs in the tree with either `null` or a replacement component:

```jsx
var MockComponent = React.createClass({
  render: function () {
    console.log(this.props.aProp);
    return <div>{this.props.children}</div>;
  }
});

var BizComponent = React.createClass({
  render: function () {
    return (
      <div>
        <button ref="fuz">Fuz</button>
      </div>
    );
  }
});

var FooComponent = React.createClass({
  render: function () {
    return (
      <div>
        <div ref="bar" />
        <div ref="baz" aProp="hello">Baz</div>
        <div ref="boz" aProp="hello">Boz</div>
      </div>
    );
  }
});

var fooTree = testTree(<FooComponent />, {
  stub: {
    bar: null,
    baz: <MockComponent />
    boz: <MockComponent aProp="foobar">Bazza</MockComponent>,
    biz: {
      fuz: null
    }
  }
});
fooTree.get("bar"); // -> null
fooTree.getIn(["biz", "fuz"]); // -> null
fooTree.get("baz"); // -> replaced with `MockComponent` and renders `Baz` string as child
fooTree.get("boz"); // -> replaced with `MockComponent` and renders `Bazza` string as child
```

__Notes__:
* You can use any falsy stub value other than `undefined` to completely remove a component (e.g. `null`, `false`).
* The stub object supports nesting; you can stub refs nested deep inside child composite components.
* Mock components are rendered with the new props (and children) of the mock component merged into the original props (and children) of the stubbed ref. This behaviour is demonstrated in the example above; `baz` will log `hello` and have the child `Baz`, whilst `boz` will log `foobar` and have the child `Bazza`.


## API

### `testTree(<Component />, {options})`
Creates the tree and returns the root node.

*__Options__*
* `stub`: see section on [stubs](#stubs)
* `mount`: if true, the tree's container will be mounted into the body rather than being rendered entirely in memory. Useful if you need to test various styling aspects.
* `context`: use this option to pass through the context object required for your component. test-tree will automatically wrap your component and pass through the context.

### `node.get(refName)`
Returns the node for the specified `ref` or `refCollection` name.

### `node.getIn([refName])`
Same as `node.get(refName)` except it allows you to cleanly retrieve a node from deep down the ref tree. For example, instead of:

```jsx
tree.get("foo").get("bar").get("baz").click();
```

you could write:

```jsx
tree.getIn(["foo", "bar", "baz"]).click();
```

### `rootNode.dispose()`
Safely unmount the tree. Will only unmount if component is already mounted. Can only be called on the root node of the tree.

### `node.state`
Returns the state of your component.

### `node.value`
Getter/setter for the element value. Should only be used if the component is a valid HTML element that accepts the value attribute.

### `node.simulate`
Instance of `React.addons.TestUtils.Simulate`, bound to the node. All its methods (beforeInput, blur, change, click, compositionEnd, compositionStart, compositionUpdate, contextMenu, copy, cut, doubleClick, drag, dragEnd, dragEnter, dragExit, dragLeave, dragOver, dragStart, drop, error, focus, input, keyDown, keyPress, keyUp, load, mouseDown, mouseEnter, mouseLeave, mouseMove, mouseOut, mouseOver, mouseUp, paste, reset, scroll, select, submit, touchCancel, touchEnd, touchMove, touchStart, wheel) can be called.

For example, to simulate double-clicking a node called `myButton`, use:

```javascript
myButton.simulate.doubleClick();
```

### `node.click()`
Shorthand method for simulating a click on the node's element.

### `node.getAttribute(attributeName)`
Returns the specified attribute from the node's element.

### `node.getClassName()`
Shorthand method for getting the class attribute of the node's element.

### `node.getProp()`
Returns the specified prop from the node's element.

### `node.isMounted()`
Returns true if the component/element is mounted, false if not.

### `node.getDOMNode()`
Returns the DOM node for the node.

### `node.element`
Reference to the original React element for the node.

### `node.innerText`
Returns the `innerText` of the element (or `textContent` if `innerText` not present).


## Updating to v1.0.0
Pre-v1.0.0, refs and refCollections were accessible as direct properties of the node. This led to issues with collisions between ref names and react-test-tree's node methods. In v1.0.0 the API has been changed to solve this problem. Node are now accessed using the `node.get()` and `node.getIn()` methods:

```jsx
// Pre-v1.0.0
tree.foo.bar.click();

// v1.0.0
tree.get("foo").get("bar").click();
// or
tree.getIn(["foo", "bar"]).click();
```


## React versions
The master branch currently supports React 0.14 and is not backwards compatible. 

* __React 0.14:__ `react-test-tree@latest`
* __React 0.13/0.12:__ `react-test-tree@^0.3.1`


## Contributing

* `make bootstrap` - install dependencies
* `make test` - run unit tests
* `make build` - build into `dist` folder
* `make lint` - lint the project
* `make test-watch` - run karma with the watch option
* `make release` - increment and publish to npm
