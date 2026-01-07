# HyperText Markup Targets (HTMT)

**HyperText Markup Targets (HTMT)** brings dynamic partial-page loading to plain HTML. Add a `target` attribute to links and forms, and HTMT handles the rest—no build tools, no framework, just declarative markup.

It's built on web standards: regular `<a>` and `<form>` elements, standard HTML attributes, and just enough JavaScript to orchestrate the behavior. Your HTML remains semantic, searchable, and resilient.

**Tiny footprint:** 794 bytes gzipped, 686 bytes minified + gzipped.

## Quick Start

1. Load the HTMT script as an ES module and initialize it on your document:

```html
<script type="module">
  import { htmt } from "./htmt.js";
  htmt(document.body, true);
</script>
```

2. Add `target` attributes to your links and forms:

```html
<span id="results">Loading...</span>

<a href="/search?q=example" target="results"> Search </a>
```

3. Serve partial HTML responses with a matching target element:

```html
<span id="results"> Found 42 results for "example" </span>
```

That's it. HTMT loads the response into a hidden iframe and swaps the target element.

## Usage

### Setup Parameters

```javascript
htmt(root, install);
```

- `root` – the DOM subtree to scan for enhanced elements. Usually `document.body`.
- `install` – when `true`, automatically wires up global `click` and `submit` handlers to track interactions.

### Targeted Links

Link with a `target` attribute to swap an element:

```html
<span id="results">Click to load</span>

<a href="/api/search" target="results"> Load Results </a>
```

Server response:

```html
<span id="results"> Here are your search results. </span>
```

HTMT creates a hidden iframe, loads the response there, and replaces the target element in the main document.

### Forms

The same pattern works with forms (GET or POST):

```html
<form method="post" action="/api/subscribe" target="message">
  <input type="email" name="email" />
  <button>Subscribe</button>
  <span id="message"></span>
</form>
```

Server response:

```html
<span id="message"> Thanks for subscribing! </span>
```

### Controlling Multiple Requests

Use the optional `frame` attribute to name the iframe. Multiple links/forms with the same frame name will share a single iframe—newer requests automatically cancel pending ones:

```html
<a href="/api/page-1" target="results" frame="pages">Page 1</a>
<a href="/api/page-2" target="results" frame="pages">Page 2</a>

<div id="results"></div>
```

If `frame` is omitted, HTMT uses the `target` value as the frame name.

### Executing Scripts in the Main Document

Wrap scripts in a `<template>` in the response `<head>` to delay execution until after the content is inserted into the main page:

```html
<head>
  <template>
    <span id="results">
      Content with
      <script>
        console.log("Running in main frame");
      </script>
    </span>
  </template>
</head>
```

HTMT extracts templates, moves their content to the main document, and runs any scripts there.

### Works Without JavaScript

Your links and forms remain fully functional HTML. Without HTMT loaded, users can still click a link with a `target` attribute—it opens the partial response in a new page or tab, just like normal.

This means you can respond with a complete HTML document. Include stylesheets, scripts, images—whatever makes the partial content self-contained. The same response works both as a partial swap (with HTMT) and as a standalone page (without HTMT).

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="/styles.css" />
    <script src="/interactive.js"></script>
  </head>
  <body>
    <span id="results">
      Your partial content here, complete with styles and scripts.
    </span>
  </body>
</html>
```

## Attributes Reference

### Required

- `target` – the `id` of the element to replace with the response content.

### Optional

- `frame` – names the internal iframe. Links/forms sharing the same frame name reuse a single iframe. If omitted, `target` is used as the frame name.
- `busy` – comma-separated list of element IDs to set `aria-busy=true` during the request (e.g., `busy="submit-btn,status"`)
- `disabled` – comma-separated list of element IDs to set `disabled` and `aria-disabled` during the request

Special values for `busy` and `disabled`:

- `_self` – the element that triggered the request
- `_submitter` – the button that submitted the form (form elements only)

Example:

```html
<form
  method="post"
  action="/api/save"
  target="status"
  busy="_self"
  disabled="submit-btn,form-input"
>
  <input id="form-input" type="text" />
  <button id="submit-btn">Save</button>
  <div id="status"></div>
</form>
```

## How It Works

When you initialize HTMT with `install: true`, it sets up global event listeners for clicks and form submissions. When it detects an element with a `target` attribute:

1. Creates or reuses a hidden iframe (named by the `frame` attribute, or `target` if not specified)
2. Directs the browser to load the URL into that iframe
3. When the response loads, HTMT extracts any `<template>` elements from the response `<head>` and queues them for injection
4. Locates the element matching the `target` ID in both the response and the main document
5. Replaces the main document's element with the response element
6. Executes any queued templates and their scripts in the main document context

## Philosophy

HTMT is intentionally minimal. It adds just enough JavaScript to coordinate iframe-based loading and element swapping. The patterns are declarative—all behavior flows from your HTML structure. Your links and forms remain valid, semantic HTML that works without JavaScript; HTMT progressively enhances them.

This aligns with the web's foundational principle: start with semantic markup, layer on behavior. No build step required, no framework lock-in.

## Status

This project is experimental. The API may evolve as we explore these patterns.
