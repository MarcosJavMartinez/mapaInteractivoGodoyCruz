export function createEditorSection(title, { open = false } = {}) {
  const section = document.createElement("details");
  section.className = "marker-editor-section";
  section.open = open;

  const summary = document.createElement("summary");
  summary.className = "marker-editor-section-header";
  summary.textContent = title;

  const body = document.createElement("div");
  body.className = "marker-editor-section-body";

  section.append(summary, body);
  return { section, body };
}

export function createInput(labelText) {
  const field = createField(labelText);
  const input = document.createElement("input");
  input.type = "text";
  field.append(input);
  return { field, input };
}

export function createTextarea(labelText, rows) {
  const field = createField(labelText);
  const input = document.createElement("textarea");
  input.rows = rows;
  field.append(input);
  return { field, input };
}

export function createButton(text) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  return button;
}

export function insertSnippet(input, snippet) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = `${input.value.slice(0, start)}${snippet}${input.value.slice(end)}`;
  input.focus();
  input.selectionStart = start + snippet.length;
  input.selectionEnd = start + snippet.length;
}

export function showTemporaryButtonText(button, text) {
  const originalText = button.textContent;
  button.textContent = text;
  setTimeout(() => {
    button.textContent = originalText;
  }, 1000);
}

function createField(labelText) {
  const label = document.createElement("label");
  label.className = "marker-editor-field";
  const span = document.createElement("span");
  span.className = "marker-editor-field-title";
  span.textContent = labelText;
  label.append(span);
  return label;
}
