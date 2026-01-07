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

let mkFrame = (name) => {
  let frame = document.createElement("iframe");
  frame._ = [];
  frame.name = name;
  frame.hidden = true;
  frame.onload = () => load(frame);
  document.body.append(frame);
  frame.contentWindow.onbeforeunload = (_, [def, sub] = frame._) => {
    forTargets(def, sub, "busy", (el) => el.setAttribute("aria-busy", "true"));
    forTargets(def, sub, "disabled", (el) => {
      if ("disabled" in el) el.disabled = true;
      el.setAttribute("aria-disabled", "true");
    });
  };
};

let load = (frame) => {
  let {
    contentDocument: cd,
    name,
    _: [def, sub],
  } = frame;
  if (cd.URL == "about:blank") return;
  let f = document.createDocumentFragment();

  forTargets(def, sub, "busy", (el) => el.removeAttribute("aria-busy"));
  forTargets(def, sub, "disabled", (el) => {
    if ("disabled" in el) el.disabled = false;
    el.removeAttribute("aria-disabled");
  });

  cd.querySelectorAll("head>template").forEach((t) => {
    t.id
      ? document.getElementById(t.id)?.replaceWith(t.content)
      : f.append(t.content);
  });
  f.append(...cd.body.childNodes);

  frame.remove();
  mkFrame(name);

  setTimeout(() => (htmt(f), document.getElementById(name)?.replaceWith(f)));
};

let htmt = (root, install) => {
  if (install) {
    onclick = onsubmit = (e) => {
      let el = e.target,
        name = el?.getAttribute("frame") || el?.getAttribute("target"),
        iframe = name && document.querySelector(`iframe[name="${name}"]`);
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
