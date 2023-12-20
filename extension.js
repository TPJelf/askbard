const vscode = require('vscode');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function activate(context) {
  let apiKey;

  function missingApiKey() {
    apiKey = vscode.workspace.getConfiguration().get('askbard.apiKey').trim();
    if (apiKey === '') {
      vscode.window.showErrorMessage(
        "Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'."
      );
      return true;
    }
    return false;
  }

  // This function defines how the response is inserted in the editor (replace or after)
  function insertResponse(editor, selection, insertType, bardResponse) {
    if (insertType === 'after') {
      editor
        .edit((editBuilder) => {
          editBuilder.insert(selection.end, '\n' + bardResponse);
        })
        .then((success) => {
          if (success) {
            const appendedTextEnd = new vscode.Position(
              selection.end.line + bardResponse.split('\n').length,
              bardResponse.split('\n').length
            );
            editor.selection = new vscode.Selection(
              selection.end,
              appendedTextEnd
            );
          }
        });
    } else if (insertType === 'replace') {
      editor
        .edit((editBuilder) => {
          editBuilder.delete(new vscode.Range(selection.start, selection.end));
          editBuilder.insert(selection.start, bardResponse);
        })
        .then((success) => {
          if (success) {
            const newTextEnd = new vscode.Position(
              selection.start.line + bardResponse.split('\n').length,
              bardResponse.split('\n').length
            );
            editor.selection = new vscode.Selection(
              selection.start,
              newTextEnd
            );
          }
        });
    }
  }

  // Here be dragons
  function errorHandling(error) {
    if (error.code === 2) {
      return "Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'.";
    } else if (error.code === 3) {
      return 'Invalid Bard API key. Check https://makersuite.google.com/app/apikey and extension settings';
    } else {
      return `Bard request error: ${error.message}`;
    }
  }

  // This is the main function that calls the API.
  async function generateText(prompt, editor, resolve, reject) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    try {
      const result = await model.generateContent(prompt);
      let bardResponse = result.response.text().replace(/`/g, ''); // Remove backticks
      const activeLanguage = editor.document.languageId;
      let firstChars = bardResponse.substring(0, 10);

      if (firstChars.includes(activeLanguage)) {
        firstChars = firstChars.replace(activeLanguage, '');
      } else if (activeLanguage === 'csharp') {
        firstChars = firstChars.replace(/\bc#\W/g, '');
      } else if (activeLanguage === 'javascript') {
        firstChars = firstChars.replace(/\bjs\W/g, '');
      } else if (activeLanguage === 'typescript') {
        firstChars = firstChars.replace(/\bts\W/g, '');
      }
      firstChars = firstChars.replace(/\n/g, '');

      bardResponse = firstChars + bardResponse.substring(10);
      resolve(bardResponse);
    } catch (error) {
      reject(error);
    }
  }

  // Silent mode conditional
  async function askBard(prompt, editor, silent = false) {
    return new Promise((resolve, reject) => {
      if (silent) {
        generateText(prompt, editor, resolve, reject);
      } else {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Bard is composing...',
          },
          async () => {
            await generateText(prompt, editor, resolve, reject);
          }
        );
      }
    });
  }

  // Command: Ask Bard for code
  const getCode = vscode.commands.registerCommand(
    'askbard.getCode',
    async () => {
      if (missingApiKey()) {
        return;
      }
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        let prompt = editor.document.getText(selection).trim();

        // Prepare prompt for AI
        prompt =
          'Languague is ' +
          editor.document.languageId +
          '. Reply with code for ' +
          prompt +
          '. Use best practices and adhere to a clean and organized code structure. You never reply with tests. Make sure its easy to understand and provide programming comments for your code to explain the logic and steps.';

        try {
          const bardResponse = await askBard(prompt, editor);
          insertResponse(editor, selection, 'after', bardResponse);
        } catch (error) {
          if (
            error.message.includes(
              "Cannot read properties of undefined (reading 'output')"
            )
          ) {
            vscode.window.showErrorMessage(
              'Bard filtered the response for undisclosed reasons, try again rephrasing your comment.'
            );
          } else {
            vscode.window.showErrorMessage(errorHandling(error));
          }
        }
      }
    }
  );

  // Command: Ask Bard for unit tests
  const getTest = vscode.commands.registerCommand(
    'askbard.getTest',
    async () => {
      if (missingApiKey()) {
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        let prompt = editor.document.getText(selection).trim();

        // Prepare prompt for AI
        prompt =
          'Language is ' +
          editor.document.languageId +
          '. Reply exclusively with unit tests using best practices: ' +
          prompt;

        try {
          const bardResponse = await askBard(prompt, editor);
          insertResponse(editor, selection, 'after', bardResponse.trim());
        } catch (error) {
          if (
            error.message.includes(
              "Cannot read properties of undefined (reading 'output')"
            )
          ) {
            vscode.window.showErrorMessage(
              'Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.'
            );
          } else {
            vscode.window.showErrorMessage(errorHandling(error));
          }
        }
      }
    }
  );

  // Command: Ask Bard for docstring
  const getDocstring = vscode.commands.registerCommand(
    'askbard.getDocstring',
    async () => {
      if (missingApiKey()) {
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        let prompt = editor.document.getText(selection).trim();

        //prompt = prompt.replace(/^[ \t]+/gm, ''); // this removes whitespaces at the beggining of each newline.
        prompt =
          'Programming language is ' +
          editor.document.languageId +
          '. Reply with exactly the same function with a document comment (docstring) inserted: ' +
          prompt;

        try {
          const bardResponse = await askBard(prompt, editor);
          insertResponse(editor, selection, 'replace', bardResponse);
        } catch (error) {
          if (
            error.message.includes(
              "Cannot read properties of undefined (reading 'output')"
            )
          ) {
            vscode.window.showErrorMessage(
              'Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.'
            );
          } else {
            vscode.window.showErrorMessage(errorHandling(error));
          }
        }
      }
    }
  );

  // Command: Ask Bard for regex
  const getRegex = vscode.commands.registerCommand(
    'askbard.getRegex',
    async () => {
      if (missingApiKey()) {
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selection = editor.selection;
        let prompt = editor.document.getText(selection).trim();
        prompt =
          'Reply with a single and comprehensive regular expression for the following:' +
          prompt;

        try {
          const bardResponse = await askBard(prompt, editor);
          insertResponse(editor, selection, 'replace', bardResponse);
        } catch (error) {
          if (
            error.message.includes(
              "Cannot read properties of undefined (reading 'output')"
            )
          ) {
            vscode.window.showErrorMessage(
              'Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.'
            );
          } else {
            vscode.window.showErrorMessage(errorHandling(error));
          }
        }
      }
    }
  );

  // Command: Ask Bard anything
  const getAnything = vscode.commands.registerCommand(
    'askbard.getAnything',
    async () => {
      if (missingApiKey()) {
        return;
      }

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const selection = editor.selection;
        let prompt = editor.document.getText(selection).trim();

        try {
          const bardResponse = await askBard(prompt, editor);
          insertResponse(editor, selection, 'after', bardResponse);
        } catch (error) {
          if (
            error.message.includes(
              "Cannot read properties of undefined (reading 'output')"
            )
          ) {
            vscode.window.showErrorMessage(
              'Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.'
            );
          } else {
            vscode.window.showErrorMessage(errorHandling(error));
          }
        }
      }
    }
  );

  // Automatic completions
  // Dynamic completions class
  class DynamicCompletionItemProvider {
    provideCompletionItems(document, position) {
      let getCompletionTimeout = null;
      let bardResponse = '';
      const getCompletionDelay = 300;
      const editor = vscode.window.activeTextEditor;
      const linePrefix =
        'Bard sings: ' +
        document.lineAt(position).text.substring(0, position.character);

      // Prepare prompt from last 300 words.
      const text = document
        .getText(new vscode.Range(new vscode.Position(0, 0), position))
        .trim();
      const wordsArray = text.split(/\s+/);
      const startIndex = Math.max(wordsArray.length - 300, 0);
      const context = wordsArray.slice(startIndex).join(' ');

      const prompt =
        'Language is ' +
        editor.document.languageId +
        'Continue the following text: ' +
        context;

      return new Promise((resolve) => {
        if (getCompletionTimeout) {
          clearTimeout(getCompletionTimeout);
        }
        getCompletionTimeout = setTimeout(async () => {
          if (missingApiKey()) {
            resolve([]);
          }
          try {
            bardResponse = await askBard(prompt, editor, true);
            const completionItem = new vscode.CompletionItem(
              linePrefix,
              vscode.CompletionItemKind.Text
            );
            completionItem.detail = bardResponse;
            completionItem.insertText = new vscode.SnippetString(
              '\n' + bardResponse
            );

            resolve([completionItem]);
          } catch (error) {
            console.log(error);
          }
        }, getCompletionDelay);
      });
    }
  }

  // Enabling logic
  function updateGetCompletionSubscription() {
    let getCompletion = vscode.languages.registerCompletionItemProvider(
      { language: '*', scheme: 'file' },
      new DynamicCompletionItemProvider(),
      '\n'
    );
    if (vscode.workspace.getConfiguration().get('askbard.getCompletion')) {
      context.subscriptions.push(getCompletion);
    } else {
      getCompletion.dispose();
    }
  }

  // Initial setup
  updateGetCompletionSubscription();

  // Setting watcher
  vscode.workspace.onDidChangeConfiguration((changeEvent) => {
    if (changeEvent.affectsConfiguration('askbard.getCompletion')) {
      updateGetCompletionSubscription();
    }
  });

  // Open settings commands
  const setApiKey = vscode.commands.registerCommand('askbard.setApiKey', () => {
    vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'askbard.apiKey'
    );
  });
  const enableGetCompletion = vscode.commands.registerCommand(
    'askbard.enableGetCompletion',
    () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'askbard.getCompletion'
      );
    }
  );

  context.subscriptions.push(
    getAnything,
    getCode,
    getDocstring,
    getRegex,
    getTest,
    setApiKey,
    enableGetCompletion
  );

  if (
    !vscode.workspace.getConfiguration().get('askbard.disableReadyNotification')
  ) {
    vscode.window.showInformationMessage('Bard is ready');
  }
}

function deactivate() {
  if (getCompletion) {
    getCompletion.dispose();
    getCompletion = null;
  }
}

module.exports = {
  activate,
  deactivate,
};
