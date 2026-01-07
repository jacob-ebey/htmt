/**
 *
 * @param {Element} def
 * @param {Element | null} sub
 * @param {string} attr
 * @param {(el: Element) => void} cb
 * @returns
 */
let forTargets = (def, sub, attr, cb) =>
  def
    ?.getAttribute(attr)
    ?.split(",")
    .forEach((id) => {
      let target =
        id === "_self"
          ? def
          : id === "_submitter"
          ? sub
          : document.getElementById(id);
      if (target) cb(target);
    });

/**
 *
 * @param {string} name
 */
let mkFrame = (name) => {
  let frame = document.createElement("iframe");
  // @ts-expect-error - adding custom property
  frame._ = [];
  frame.name = name;
  frame.hidden = true;
  frame.onload = () => {
    let {
      contentDocument: cd,
      name,
      // @ts-expect-error - custom property
      _: [def, sub],
    } = frame;
    // @ts-expect-error - it will be non-null, onload would not have fired otherwise
    if (cd.URL == "about:blank") return;
    let f = document.createDocumentFragment();

    forTargets(def, sub, "busy", (el) => el.removeAttribute("aria-busy"));
    forTargets(def, sub, "disabled", (el) => {
      if ("disabled" in el) el.disabled = false;
      el.removeAttribute("aria-disabled");
    });

    // @ts-expect-error - it will be non-null, onload would not have fired otherwise
    cd.querySelectorAll("head>template").forEach((t) => {
      let target = t.getAttribute("target");
      target
        ? // @ts-expect-error - it's a template element
          document.getElementById(target)?.replaceWith(t.content)
        : // @ts-expect-error - it's a template element
          f.append(t.content);
    });

    // @ts-expect-error - it will be non-null, onload would not have fired otherwise
    f.append(...cd.body.childNodes);

    frame.remove();
    mkFrame(name);

    setTimeout(() => (htmt(f), document.getElementById(name)?.replaceWith(f)));
  };

  document.body.append(frame);
  // @ts-expect-error - it will be non-null, we just added it to the DOM
  frame.contentWindow.onbeforeunload = (_, [def, sub] = frame._) => {
    forTargets(def, sub, "busy", (el) => el.setAttribute("aria-busy", "true"));
    forTargets(def, sub, "disabled", (el) => {
      if ("disabled" in el) el.disabled = true;
      el.setAttribute("aria-disabled", "true");
    });
  };
};

/** @type {import("./htmt.d.ts").htmt} */
let htmt = (root, install) => {
  if (install) {
    onclick = onsubmit =
      /**
       *
       * @param {MouseEvent | SubmitEvent} e
       */
      (e) => {
        let el = /** @type {Element} */ (e.target),
          name = el?.getAttribute("frame") || el?.getAttribute("target"),
          iframe = name && document.querySelector(`iframe[name="${name}"]`);
        // @ts-expect-error - custom property
        if (iframe) iframe._ = [el, e.submitter ?? el];
      };
  }
  root.querySelectorAll("a[target],form[target]").forEach((el) => {
    let name = el?.getAttribute("frame") || el?.getAttribute("target");
    if (
      name &&
      name[0] !== "_" &&
      !document.querySelector(`iframe[name="${name}"]`)
    )
      mkFrame(name);
  });
};

export { htmt };
