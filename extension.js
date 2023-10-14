const vscode = require('vscode');
const { TextServiceClient } = require("@google-ai/generativelanguage").v1beta2;
const { GoogleAuth } = require("google-auth-library");

function activate(context) {

  //Check if API key was configured
  const apiKey = vscode.workspace.getConfiguration().get('askbard.apiKey').trim();
  if (apiKey === "") {
    vscode.window.showErrorMessage("Missing API key. Add it in settings or from command palette 'Set Ask Bard API key'.");
    return;
  }

  const modelName = "models/text-bison-001";

  const promptRules = ". Use best practices and adhere to a clean and organized code structure. Make sure its easy to understand and provide comments for your code to explain the logic and steps. Please generate the code based on this prompt and ensure it works as described."

  function generateText(prompt, editor, selection, errorCallback) {
    
    vscode.window.showInformationMessage('Bard is composing...');

    const client = new TextServiceClient({
      authClient: new GoogleAuth().fromAPIKey(apiKey),
    });

    client.generateText({
        model: modelName,
        prompt: {
            text: prompt,
        },
    })
    .then((result) => {
        // Format response
        const outputValue = result[0].candidates[0].output.replace(/`/g, ''); // Remove backticks
        const startIndex = outputValue.indexOf('\n') + 1; // Remove first line that always returns the programming language
        const bardResponse = '\n' + outputValue.slice(startIndex); //Adds a new line to append response neatly under selected comment

        // Insert response
        editor.edit(editBuilder => {
            editBuilder.insert(selection.end, bardResponse);
        }).then(success => {
            if (success) {
                const appendedTextStart = selection.end;
                const appendedTextEnd = new vscode.Position(
                    appendedTextStart.line + bardResponse.split('\n').length - 1,
                    bardResponse.split('\n').slice(-1)[0].length
                );

                editor.selection = new vscode.Selection(appendedTextStart, appendedTextEnd);
            }
        });
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

  function getLanguage(editor) {
    // Get language from file extension.
    const fileExtension = editor.document.uri.fsPath.split('.').pop();
    const languageMap = {
      js: "JavaScript",
      ts: "TypeScript",
      py: "Python",
      java: "Java",
      c: "C",
      cpp: "C++",
      cs: "C#",
    };
    return languageMap[fileExtension];
  }

  // Command: Ask Bard for code 
  context.subscriptions.push(vscode.commands.registerCommand('askbard.askBard', () => {
    
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
  
      // Regex to check for comments
      // C/C++/C#/Java/javascript single line (//) and multiline (/* */)
      // Python single line # and multiline (triple quotes)
      const commentRegex = /(\/\/|\/\*|\/\*{2,}|\*\/|'''|'''\r\n?|"""|"""\r\n?|#)/g;

      let prompt = editor.document.getText(selection);

      // Exit if prompt is not a comment
      if (!commentRegex.test(prompt)) {
        vscode.window.showInformationMessage('Please select the whole comment, comment markers included.');
        return;
      }
      
      // Remove comment markers
      prompt = prompt.replace(commentRegex, '')
      
      // Prepare prompt for AI
      prompt = "Using " + getLanguage(editor) + " reply with code for " + prompt + promptRules

      generateText(prompt, editor, selection, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, try again rephrasing your comment.")
      })}
  }));

  // Command: Ask Bard for unit tests
  context.subscriptions.push(vscode.commands.registerCommand('askbard.unittestBard', () => {
    
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      let prompt = editor.document.getText(selection);
      
      // Prepare prompt for AI
      prompt = "Reply exclusively with unit tests in " + getLanguage(editor) + " for the following code:" + prompt

      generateText(prompt, editor, selection, () => {
        vscode.window.showErrorMessage("Bard filtered the response for undisclosed reasons, most commonly the selected text is too long.")
      });
    }
  }));

  // Open extension settings command
  context.subscriptions.push(
    vscode.commands.registerCommand('askbard.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'askbard.apiKey');
    })
  );
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
};