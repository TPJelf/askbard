const vscode = require('vscode');
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

function activate(context) {

  // Regex for comments
  // Javascript style single line (//) and multiline (/* */)
  // Python single line # and multiline (triple quotes)
  // SQL single line (--)
  // Rust and C# doc comment (///)
  // PHP and C doc comments (/** */)

  const commentRegex = /(\/\/|\/\*|\/\*{2,}|\*\/|'''|'''\r\n?|"""|"""\r\n?|#|--|\/\/\/)/g;

  let apiKey

  function missingApiKey() {
    apiKey = vscode.workspace.getConfiguration().get('askbard.apiKey').trim()
    if (apiKey === "") {
      vscode.window.showErrorMessage("Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'.");
      return true;
      }
    return false;
  }

  const modelName = 'models/text-bison-001';

  // This is the main function that calls the API.
  function askBard(prompt, editor, selection, replace, errorCallback) {
    vscode.window.showInformationMessage('Bard is composing...');
    const client = new TextServiceClient({
      authClient: new GoogleAuth().fromAPIKey(apiKey),
    });

    client.generateText({
      model: modelName,
      prompt: {
        text: prompt
      },
    })
    .then((result) => {
      // Format response
      let bardResponse = result[0].candidates[0].output.replace(/`/g, ''); // Remove backticks
      
      // Sometimes the response from the AI comes with the programming language at the beginning
      // Here we try to remove it
      const activeLanguage = editor.document.languageId
      let firstChars = bardResponse.substring(0, 10);

      if (firstChars.includes(activeLanguage)) {
        firstChars = firstChars.replace(activeLanguage, '');
      }
      else if (activeLanguage == 'csharp') {
        firstChars = firstChars.replace(/\b'c#'\b/g, '');
      }
      else if (activeLanguage == 'javascript') {
        firstChars = firstChars.replace(/\b'js'\b/g, '');
      }
      else if (activeLanguage == 'typescript') {
        firstChars = firstChars.replace(/\b'ts'\b/g, '');
      }
      // We also remove a new line that it inserts
      firstChars = firstChars.replace(/\n/g,'')

      // Concatenate the modified substring with the rest of the original string
      bardResponse = firstChars + bardResponse.substring(10);
      
      if(!replace) {
      // Insert response after
        editor.edit(editBuilder => {
            editBuilder.insert(selection.end, '\n' + bardResponse);
        }).then(success => {
            if (success) {
                const appendedTextEnd = new vscode.Position(
                    selection.end.line + bardResponse.split('\n').length,
                    bardResponse.split('\n').length
                );
                editor.selection = new vscode.Selection(selection.end, appendedTextEnd);
              }
            }
        );
      }
      else {
        editor.edit(editBuilder => {
              editBuilder.delete(new vscode.Range(selection.start, selection.end));
              editBuilder.insert(selection.start, bardResponse);
        }).then(success => {
            if (success) {
              const newTextEnd = new vscode.Position(
                selection.start.line + bardResponse.split('\n').length, 
                bardResponse.split('\n').length
                );
              editor.selection = new vscode.Selection(selection.start, newTextEnd);
            }
        });
      }
    })
    .catch(error => {
      if (error.message.includes("Cannot read properties of undefined (reading 'output')")) {
        errorCallback(error);
      }
      else if (error.code === 2) {
        vscode.window.showErrorMessage("Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'.");
      } 
      else if (error.code === 3) {
        vscode.window.showErrorMessage("Invalid Bard API key. Check https://makersuite.google.com/app/apikey and extension settings");
      }
      else {
        vscode.window.showErrorMessage(`Bard request error: ${error.message}`);
      }        
    });
  }

  // Command: Ask Bard for code 
  context.subscriptions.push(vscode.commands.registerCommand('askbard.getCode', () => {
    
    if (missingApiKey()) { return; }
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection).trim();

      // Exit if prompt is not a comment
      if (!commentRegex.test(prompt)) {
        vscode.window.showInformationMessage('Please select the whole comment, comment markers included.');
        return;
      }
      
      // Remove comment markers
      prompt = prompt.replace(commentRegex, '')

      const context = ". Use best practices and adhere to a clean and organized code structure. You never reply with tests. Make sure its easy to understand and provide comments for your code to explain the logic and steps. Please generate the code based on this prompt and ensure it works as described."
      
      // Prepare prompt for AI
      prompt = "Using " + editor.document.languageId + " reply with code for " + prompt + context

      askBard(prompt, editor, selection, false, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, try again rephrasing your comment.")
      })}
  }));

  // Command: Ask Bard for unit tests
  context.subscriptions.push(vscode.commands.registerCommand('askbard.getTest', () => {
    
    if (missingApiKey()) { return; }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection).trim();
      
      // Prepare prompt for AI
      prompt = "Language is " + editor.document.languageId + ". Reply exclusively with best practices unit tests: " + prompt

      askBard(prompt, editor, selection, false, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.")
      });
    }
  }));

  // Command: Ask Bard for docstring
  context.subscriptions.push(vscode.commands.registerCommand('askbard.getDocstring', () => {
    
    if (missingApiKey()) { return; }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection).trim();
      
      // Prepare prompt for AI
      prompt = prompt.replace(/^[ \t]+/gm, '')
      prompt = "Programming language is " + editor.document.languageId + ". Reply with exactly the same function with a document comment inserted: " + prompt

      askBard(prompt, editor, selection, true, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.")
      });
    }
  }));

  // Command: Ask Bard for regex
  context.subscriptions.push(vscode.commands.registerCommand('askbard.getRegex', () => {
  
    if (missingApiKey()) { return; }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection).trim();

      // Remove comment markers
      prompt = prompt.replace(commentRegex, '')
      // Prepare prompt for AI
      prompt = "Reply with only a combined regex for the following:" + prompt

      askBard(prompt, editor, selection, true, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.")
      });
    }
    }));
    
  // Command: Ask Bard anythign
  context.subscriptions.push(vscode.commands.registerCommand('askbard.anything', () => {
  
    if (missingApiKey()) { return; }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection).trim();

      // Remove comment markers
      prompt = prompt.replace(commentRegex, '')

      askBard(prompt, editor, selection, false, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or references sensitive information.")
      });
    }
    }));

  // Open extension settings command
  context.subscriptions.push(vscode.commands.registerCommand('askbard.openSettings', () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'askbard.apiKey');
  }));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};