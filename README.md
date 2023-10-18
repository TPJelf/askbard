# Ask Bard - Google AI Integration for VSCode

![Ask Bard Icon](https://raw.githubusercontent.com/TPJelf/askbard/main/icon_512.jpg)

Ask Bard integrates Google's AI with VSCode to provide AI-generated code.
It utilizes the free official Google's PaLM API.

## Features
- **Google's PaLM 2 LLM Integration**: Generate code snippets from your comments , unit tests based on your code and insert docstrings!
- **Multi-language Support**: Supports various programming languages: JavaScript, TypeScript, JSX, Python, Java, C, C++, C#, Rust, SQL, PHP.
- **Easy Configuration**: You only need to set up your API key in the extension settings.

## Configuration
Before using Ask Bard, you need to configure your API key:
1. Get your free API key from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).
2. Open your Visual Studio Code settings from File > Preferences > Settings or using the command palette and search "Set Ask Bard API key"
3. Set the API key

## Usage
#### Generating Code Snippets
1. Select the code comment for which you want to generate code. You must select the entirety of the comment including the comment markers.
2. Right-click and select "Ask Bard for code" (or use the command palette).
3. Ask Bard will insert the code below your selected comment.

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

## Requirements
- Visual Studio Code version 1.83.0 or higher.
- A free API key from Google MakerSuite.

## Extension Settings
- `askbard.apiKey`: Here goes your API key.

## Known Issues
- No known issues.

## Release Notes
### 1.0.0
- Initial release
### 1.0.1
- Fixed critical packaging bug that stopped the extension from working (whoops)
- Added support for Rust, SQL, JSX and PHP
### 1.0.2
- Typos, phrasing, and minor reformatting.
- Added docstring generation functionality.

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