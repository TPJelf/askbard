# Ask Bard - Google AI Integration for VSCode

![Ask Bard Icon](https://raw.githubusercontent.com/TPJelf/askbard/main/icon_512.jpg)

Ask Bard integrates Google's AI with VSCode to provide AI-generated code.
It utilizes the free official Google's PaLM API.

## Features

- **Google's PaLM 2 LLM Integration** will help you:

1. Generate code snippets.
2. Generate unit tests.
3. Insert docstrings.
4. Generate regular expresions.
5. Ask anything in general.
6. Now with automatic AI completions!

- **Multi-language Support**: Supports most programming languages.
- **Easy Configuration**: You only need to set up your API key in the extension settings.

## Configuration

Before using Ask Bard, you need to configure your API key:

1. Get your free API key from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).
2. Open your Visual Studio Code settings from File > Preferences > Settings or using the command palette and search "Set Ask Bard API key"
3. Set the API key

## Usage

#### Generating Code Snippets

1. Select the text describing the code you want.
2. Right-click and select "Ask Bard for code" (or use the command palette).
3. Ask Bard will insert the code below your selected text.

![Ask Bard for code](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_code.gif)

#### Generating Unit Tests

1. Select the code for which you want to generate unit tests.
2. Right-click and select "Ask Bard for unit tests" (or use the command palette).
3. Ask Bard will insert the unit tests below your selected code.

![Ask Bard for unit tests](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_test.gif)

#### Inserting Docstrings

1. Select the function for which you want to generate the docstring.
2. Right-click and select "Ask Bard for docstring" (or use the command palette).
3. Ask Bard will insert the docstring in the function.

![Ask Bard for docstring](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_doc.gif)

#### Generating regular expressions

1. Select a word or phrase that explains the regex you need.
2. Right-click and select "Ask Bard for regex" (or use the command palette).
3. Ask Bard will replace the text with the regex.

![Ask Bard for unit tests](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_regex.gif)

#### Asking anything

Note: This command will forward your selection directly as a prompt.

1. Select something.
2. Right-click and select "Ask Bard anything" (or use the command palette).
3. Ask Bard will reply below the selected text.

![Ask Bard for anything](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_anything.gif)

#### Completions

A completion recommendation based on the last 300 words will appear after you enter a new line. The API isn't super fast so there can be a slight delay.

Can be disabled via settings.

![Ask Bard completions ](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_completions.gif)

## Requirements

- Visual Studio Code version 1.83.0 or higher.
- A free API key from Google MakerSuite.

## Extension Settings

- `askbard.apiKey`: Here goes your API key.
- `askbard.getCompletion`: Enable / disable automatic completions.

## Known Issues

- No known issues.

## Release Notes

### 1.1.0

- Added automatic completions per popular request ❤️ Its not Copilot yet but its elegant enough.
- Removed comment requirement in generating code snippets. This way we now support all languages supported by VSCode.
- Bugfixes & refactoring.
- Formatted with Prettier 😬

### 1.0.4

- Added Ask Bard anything.
- Grouped context menu commands.

### 1.0.3

- Added regex generation.
- Prompts optimizations.

### 1.0.2

- Added docstring generation.
- Typos, phrasing, and minor reformatting.

### 1.0.1

- Added support for Rust, SQL, JSX and PHP.
- Fixed critical packaging bug that stopped the extension from working (whoops).

### 1.0.0

- Initial release

## Feedback and Contributions

Have a feature request or found a bug? Feel free to [submit an issue](https://github.com/TPJelf/askbard/issues).

Contributions are also welcome! Please check the [contributing guidelines](https://github.com/TPJelf/askbard/blob/main/CONTRIBUTING.md) before submitting a pull request.

## License

This extension is licensed under the [MIT License](https://github.com/TPJelf/askbard/blob/main/LICENSE).

## Additional documentation

Extension bootsrapped with [yo code](https://code.visualstudio.com/api/get-started/your-first-extension)

[Google PaLM API Documentation](https://developers.generativeai.google/tutorials/text_node_quickstart)

---

**Developed with ❤️ by TPJelf**
