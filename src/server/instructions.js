const chalk = require('chalk');

function generateInstruction(change) {
  const { type, selector, property, value, oldValue, direction, distance } = change;

  switch (type) {
    case 'property_change':
      return generatePropertyInstruction(selector, property, value, oldValue);

    case 'text_edit':
      return generateTextInstruction(selector, value, oldValue);

    case 'element_move':
      return generateMoveInstruction(selector, direction, distance);

    case 'element_resize':
      return generateResizeInstruction(selector, change);

    case 'style_change':
      return generateStyleInstruction(selector, change.styles);

    default:
      return null;
  }
}

function generatePropertyInstruction(selector, property, value, oldValue) {
  const propertyDescriptions = {
    color: `text color`,
    backgroundColor: `background color`,
    fontSize: `font size`,
    fontWeight: `font weight`,
    fontFamily: `font family`,
    lineHeight: `line height`,
    letterSpacing: `letter spacing`,
    textAlign: `text alignment`,
    margin: `margin`,
    marginTop: `top margin`,
    marginRight: `right margin`,
    marginBottom: `bottom margin`,
    marginLeft: `left margin`,
    padding: `padding`,
    paddingTop: `top padding`,
    paddingRight: `right padding`,
    paddingBottom: `bottom padding`,
    paddingLeft: `left padding`,
    width: `width`,
    height: `height`,
    minWidth: `minimum width`,
    maxWidth: `maximum width`,
    minHeight: `minimum height`,
    maxHeight: `maximum height`,
    display: `display`,
    flexDirection: `flex direction`,
    justifyContent: `justification`,
    alignItems: `alignment`,
    gap: `gap`,
    borderRadius: `border radius`,
    borderWidth: `border width`,
    borderStyle: `border style`,
    borderColor: `border color`,
    boxShadow: `box shadow`,
    opacity: `opacity`,
    transform: `transform`
  };

  const description = propertyDescriptions[property] || property;

  return `Change the ${description} of the element with selector "${selector}" from ${oldValue} to ${value}.`;
}

function generateTextInstruction(selector, newText, oldText) {
  return `Change the text content of the element with selector "${selector}" from "${oldText}" to "${newText}".`;
}

function generateMoveInstruction(selector, direction, distance) {
  return `Move the element with selector "${selector}" ${direction} by ${distance}px.`;
}

function generateResizeInstruction(selector, change) {
  const { width, height } = change;
  if (width && height) {
    return `Resize the element with selector "${selector}" to ${width}px × ${height}px.`;
  }
  if (width) {
    return `Change the width of the element with selector "${selector}" to ${width}px.`;
  }
  if (height) {
    return `Change the height of the element with selector "${selector}" to ${height}px.`;
  }
  return null;
}

function generateStyleInstruction(selector, styles) {
  const styleList = Object.entries(styles)
    .map(([prop, val]) => `${prop}: ${val}`)
    .join(', ');
  return `Apply the following styles to the element with selector "${selector}": ${styleList}.`;
}

function generateBatchInstruction(changes) {
  if (changes.length === 0) return null;
  if (changes.length === 1) return generateInstruction(changes[0]);

  const instructions = changes
    .map(change => generateInstruction(change))
    .filter(Boolean);

  if (instructions.length === 0) return null;
  if (instructions.length === 1) return instructions[0];

  return `Apply the following changes:\n${instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}`;
}

module.exports = { generateInstruction, generateBatchInstruction };
