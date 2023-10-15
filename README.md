# Ask Bard - Google AI Integration for VSCode

![Ask Bard Icon](https://raw.githubusercontent.com/TPJelf/askbard/main/icon_512.jpg)

Ask Bard integrates Google's AI with VSCode to provide AI-generated code.
It utilizes the free official Google's PaLM API.

## Features
- **Google's PaLM LLM Integration**: Generate code snippets from your comments and unit tests based on your code.
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
2. Right-click and select "Ask Bard for code" (or use the command palette)
3. Ask Bard will insert the code below your selected comment.

![Ask Bard for code usage](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_code.gif)

#### Generating Unit Tests
1. Select the code for which you want to generate unit tests.
2. Right-click and select "Ask Bard for unit tests" (or use the command palette)
3. Ask Bard will insert the unit tests below your selected code.

![Ask Bard for unit tests usage](https://raw.githubusercontent.com/TPJelf/askbard/main/howto_test.gif)

## Requirements
- Visual Studio Code version 1.83.0 or higher.
- A free API key from Google MakerSuite.

## Extension Settings
- `askbard.apiKey`: Here goes your API key.

## Known Issues
- No known issues.

## Release Notes
### 1.0.0
Initial release
### 1.0.1
Fixing critical packaging bug that stopped the extension from working (whoops)
Added support for Rust, SQL, JSX and PHP

## Feedback and Contributions
Have a feature request or found a bug? Feel free to [submit an issue](https://github.com/TPJelf/askbard/issues).

Contributions are also welcome! Please check the [contributing guidelines](https://github.com/TPJelf/askbard/contributing) before submitting a pull request.

## License
This extension is licensed under the [MIT License](https://github.com/TPJelf/askbard/blob/main/LICENSE).

## Additional documentation
Extension boostrapped with [yo code](https://code.visualstudio.com/api/get-started/your-first-extension)

[Google PaLM API Documentation](https://developers.generativeai.google/tutorials/text_node_quickstart)

---

**Developed with ❤️ by TPJelf**