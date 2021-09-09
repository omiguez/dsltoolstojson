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
		editor!.edit(editBuilder => editBuilder.replace(operationRange, JSONToDSLTool(text)));	
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

function JSONToDSLTool(json: string) : string
{
	try{
		let data = JSON.parse(json);
		if (data == null){
			console.log("Data was null");
			return json;
		}

		console.log("Parse successful");
		return DataToDSLTool(data);
	}
	catch(error){
		console.log("Unexpected error", error);
		return json;
	}	
}

function DataToDSLTool(data: any, indexingLevel: number = 0) :string
{
	let output: string = "";
	if (Array.isArray(data)){
		output+="[";
		for (let i = 0; i < data.length; i++){
			output+=DataToDSLTool(data[i], indexingLevel)
			if (i < data.length - 1)
			{
				output+=",";
			}
		}
		output+="]"
	}
	else if (IsPrimitive(data)){
		output += data;
	}
	else {
		output += "{";
		for (let property in data){
			if (data.hasOwnProperty(property)) {
				output += BuildQuote(indexingLevel);
				output += property;
				output += BuildQuote(indexingLevel);
				output += ": ";	
				output += BuildQuote(indexingLevel);
				output += DataToDSLTool(data[property], indexingLevel + 1);
				output += BuildQuote(indexingLevel);
			}
			
			output += ","
		}
		output = output.substring(0, output.length - 1);
		output += "}";		
	}

	return output;
}

function BuildQuote(indexingLevel: number){
	return "\\".repeat(indexingLevel) + '"';
}

function IsPrimitive(test: any) {
    return test !== Object(test);
}

// This method is called when the extension is deactivated.
export function deactivate() {}
