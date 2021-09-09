import * as vscode from 'vscode';

// Called when one of the commands is executed.
export function activate(context: vscode.ExtensionContext) {
	
	console.log('Extension "dsltoolstojson" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('dsltoolstojson.dsltoolstojson', () => {
		// Convert the selection (or if nothing is selected, the entire document) from the output format from the DSLTools, to regular JSON, and then format the document.
		let editor = vscode.window.activeTextEditor;

		if (!editor){
			return;
		}
		
		// Obtain the text to work with.
		let {operationRange, text} = GetTextToWorkWith(editor);

		// Replace with modified version.
		editor!.edit(editBuilder => editBuilder.replace(operationRange, DSLToolToJSON(text)));
		
		// Format the document.
		vscode.commands.executeCommand("editor.action.formatDocument");	
	}));

	context.subscriptions.push(vscode.commands.registerCommand('dsltoolstojson.jsontodsltool', () => {
		// Convert the selection (or if nothing is selected, the entire document) from the output format from the DSLTools, to regular JSON, and then format the document.
		let editor = vscode.window.activeTextEditor;

		if (!editor){
			return;
		}		
		
		// Obtain the text to work with.
		let {operationRange, text} = GetTextToWorkWith(editor);

		// Replace with modified version.
		editor!.edit(editBuilder => editBuilder.replace(operationRange, "still working on this one"));	
	}));
}

function GetTextToWorkWith(editor: vscode.TextEditor){
	let operationRange = editor!.selection.isEmpty ? GetRangeFullDocument(editor!.document) : new vscode.Range(editor.selection.start, editor.selection.end);
	let text: string = editor!.document.getText(operationRange) ?? "";
	
	return {
		operationRange,
		text
	}
}

function GetRangeFullDocument(document: vscode.TextDocument){
	const fullText = document.getText();
	return new vscode.Range(document.positionAt(0), document.positionAt(fullText.length))	

}
function DSLToolToJSON(text: string){
	text = text.replace(/[\\]+"/gi, '"');
	text = text.replace(/"\[\{/gi, "[{");
	text = text.replace(/\}\]"/gi, "}]");
	return text;
}

// This method is called when the extension is deactivated.
export function deactivate() {}
