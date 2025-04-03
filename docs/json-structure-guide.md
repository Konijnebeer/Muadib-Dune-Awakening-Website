# Muadib JSON Structure Guide

This document provides comprehensive specifications for the JSON data files used by the Muadib application. Following these specifications ensures that the application can properly process and display your content.

## Overview

The Muadib application uses two primary JSON files:
1. `info.json`: Contains command definitions and structured content
2. `quotes.json`: Contains quotations for the random quote feature

## info.json Structure

The `info.json` file must conform to this structure:

```json
{
  "commands": [
    {
      "name": "/commandname",
      "description": "Brief description of command",
      "title": "Title Displayed in Modal",
      "content": [
        // Array of content items (described below)
      ]
    },
    // Additional commands...
  ]
}
```

### Command Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | String | Yes | Command name with slash prefix (e.g., "/spice") |
| `description` | String | Yes | Brief description shown in suggestion box |
| `title` | String | Yes | Modal title when command is executed |
| `content` | Array | Yes | Array of content items to display |

### Content Item Types

Each content item in the `content` array must have a `type` property and additional properties based on that type:

#### 1. Text Type

Basic paragraph text, optionally with a header.

```json
{
  "type": "text",
  "text": "Your paragraph text goes here.",
  "header": "Optional Section Header"
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "text" |
| `text` | String | Yes | The paragraph text |
| `header` | String | No | Optional section header |

#### 2. List Type

Bulleted list with items, optionally with a header.

```json
{
  "type": "list",
  "header": "Optional List Header",
  "items": [
    "First list item",
    "Second list item",
    "Third list item"
  ]
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "list" |
| `header` | String | No | Optional list header |
| `items` | Array | Yes | Array of strings for list items |

#### 3. Infobox Type

Highlighted information box with special styling.

```json
{
  "type": "infobox",
  "header": "Optional Infobox Title",
  "text": "Important information displayed in a specially styled box."
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "infobox" |
| `header` | String | No | Optional infobox title |
| `text` | String | Yes | The information text |

#### 4. Quote Type

Styled blockquote for quotations.

```json
{
  "type": "quote",
  "text": "The quotation text."
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | String | Yes | Must be "quote" |
| `text` | String | Yes | The quotation text |

## quotes.json Structure

The `quotes.json` file must conform to this structure:

```json
{
  "quotes": [
    {
      "text": "The quote text.",
      "speaker": "Attribution of who said it"
    },
    // Additional quotes...
  ]
}
```

### Quote Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `text` | String | Yes | The quotation text |
| `speaker` | String | Yes | Attribution of who said/wrote the quote |

## Best Practices

### Text Formatting

- Keep text concise and to the point
- Use proper sentence structure and punctuation
- Avoid HTML in text fields; content is inserted as plain text

### Content Organization

- Group related information into logical sections
- Use headers to clearly delineate sections
- Use the appropriate content type for the information:
  - Use `text` for general information
  - Use `list` for enumerated items or steps
  - Use `infobox` for important highlights or key facts
  - Use `quote` for notable quotations or excerpts

### Command Naming

- Use lowercase for command names
- Keep command names short and descriptive
- Ensure command names are unique

## Example Command

Here's a complete example of a well-structured command:

```json
{
  "name": "/fremen",
  "description": "Indigenous people of Arrakis",
  "title": "The Fremen: Imperial Anthropological Survey",
  "content": [
    {
      "type": "text",
      "text": "CLASSIFICATION: IMPERIAL EYES ONLY\nFremen: Indigenous human population of Arrakis. Origins traced to Zensunni wanderers."
    },
    {
      "type": "text",
      "header": "Societal Structure",
      "text": "Organized in tribal units called sietches, hidden in rock outcroppings. Leadership through combat prowess and water stewardship."
    },
    {
      "type": "list",
      "header": "Military Capability",
      "items": [
        "Desert-adapted warriors with exceptional hand-to-hand combat skills",
        "Stillsuit technology enabling extended desert survival",
        "Worm-riding capabilities providing rapid deployment"
      ]
    },
    {
      "type": "infobox",
      "header": "Cultural Analysis",
      "text": "Religious practices center on water conservation and prophetic traditions (likely Bene Gesserit Missionaria Protectiva implantation)."
    },
    {
      "type": "quote",
      "text": "A man's flesh is his own; the water belongs to the tribe. - Fremen saying"
    }
  ]
}
```

By following these specifications, you ensure that your content integrates seamlessly with the Muadib application and displays correctly to users.
