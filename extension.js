const vscode = require('vscode');
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

function activate(context) {

  let apiKey = vscode.workspace.getConfiguration().get('askbard.apiKey').trim()
  
  // Regex to check for comment selection
  // Javascript style single line (//) and multiline (/* */)
  // Python single line # and multiline (triple quotes)
  // SQL single line (--)
  // Rust doc comment (///)
  // PHP doc comments (/** */)
  const commentRegex = /(\/\/|\/\*|\/\*{2,}|\*\/|'''|'''\r\n?|"""|"""\r\n?|#|--|\/\/\/)/g;

  function missingApiKey() {
    apiKey = vscode.workspace.getConfiguration().get('askbard.apiKey').trim()
    if (apiKey === "") {
      vscode.window.showErrorMessage("Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'.");
      return true;
      }
    return false;
  }

  const modelName = 'models/text-bison-001';
  
  function generateText(prompt, editor, selection, replace, errorCallback) {
    vscode.window.showInformationMessage('Bard is composing...');
    console.log(prompt)
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
      //const outputValue = result[0].candidates[0].output.replace(/`/g, ''); // Remove backticks
      let bardResponse = result[0].candidates[0].output.replace(/`/g, ''); // Remove backticks

      // Sometimes the response from the AI comes with the programming language at the beginning
      // Here we try to remove it
      // Check if the language exists in the first 15 characters
      const activeLanguage = editor.document.languageId
      let first15Chars = bardResponse.substring(0, 15);

      // Remove the language from the substring
      if (first15Chars.includes(activeLanguage)) {
        first15Chars = first15Chars.replace(activeLanguage, '');
      }
      else if (activeLanguage == 'csharp') {
        first15Chars = first15Chars.replace('c#', '');
      }
      else if (activeLanguage == 'javascript') {
        first15Chars = first15Chars.replace('js', '');
      }
      else if (activeLanguage == 'typescript') {
        first15Chars = first15Chars.replace('ts', '');
      }
      // We also remove a new line that it inserts
      first15Chars = first15Chars.replace('\n','')
      // Concatenate the modified substring with the rest of the original string
      bardResponse = first15Chars + bardResponse.substring(15);
      
      if(!replace) {
      // Insert response after
        editor.edit(editBuilder => {
            editBuilder.insert(selection.end, '\n' + bardResponse);
        }).then(success => {
            if (success) {
                const appendedTextEnd = new vscode.Position(
                    selection.start.line + bardResponse.split('\n').length - 1,
                    bardResponse.split('\n').slice(-1)[0].length
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
                selection.start.line + bardResponse.split('\n').length - 1, 
                bardResponse.split('\n').slice(-1)[0].length
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

      const context = ". Use best practices and adhere to a clean and organized code structure. Don't include tests. Make sure its easy to understand and provide comments for your code to explain the logic and steps. Please generate the code based on this prompt and ensure it works as described."
      
      // Prepare prompt for AI
      prompt = "Using " + editor.document.languageId + " reply with code for " + prompt + context

      generateText(prompt, editor, selection, false, () => {
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
      prompt = "Reply exclusively with unit tests in " + editor.document.languageId + " for the following code:" + prompt

      generateText(prompt, editor, selection, false, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or reference to sensitive information.")
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
      prompt = "Programming language is " + editor.document.languageId + ". Repeat this function with a document comment inserted: " + prompt

      generateText(prompt, editor, selection, true, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long or reference to sensitive information.")
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