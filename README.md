# <option-list />
a vanilla Web Component for lists of `<option />` HTML elements typically for use in a `<select />` HTML elements.

# Purpose
*TBD*

## Attributes

| Name             | Type*    | Description                                               |
|------------------|----------|-----------------------------------------------------------|
| **`max-select`** | `number` | maximum number of options that can be selected |
| **`caret`**      | `string` | position if a caret is needed                             |

## Events

| Name                   | Data                                                                           |
|------------------------|--------------------------------------------------------------------------------|
| **`optionSelected`**   |  <ul><li>**index** the index of the selected option as a number</li><li>**value** the text value of the selected option as a string </li></ul>  |
| **`optionDeselected`** | <ul><li>**index** the index of the deselected option as a number</li><li>**value** the text value of the deselected option as a string</li></ul>    |

## CSS Custom Properties (variables)
*TBD*