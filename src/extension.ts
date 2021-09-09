import * as vscode from 'vscode';

/// <summary> Called when one of the commands is executed. </summary>
/// <param name="context"> The VSCode extension context </param>
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

/// <summary> Gets the selected text and range, or the whole document and its range if nothing is selected. </summary>
/// <param name="editor"> The active VSCode text editor. </param>
/// <returns> The selected text and range, or the whole document and its range if nothing is selected. </returns>
function GetTextToWorkWith(editor: vscode.TextEditor){
	let operationRange = editor!.selection.isEmpty ? GetRangeFullDocument(editor!.document) : new vscode.Range(editor.selection.start, editor.selection.end);
	let text: string = editor!.document.getText(operationRange) ?? "";
	
	return {
		operationRange,
		text
	}
}

/// <summary> Gets the range of the full active document. </summary>
/// <param name="document"> The active document. </param>
/// <returns> The Range comprising the entire document. </returns>
function GetRangeFullDocument(document: vscode.TextDocument){
	const fullText = document.getText();
	
	return new vscode.Range(document.positionAt(0), document.positionAt(fullText.length))	
}

/// <summary> Converts text in the DSLTool format to JSON. </summary>
/// <param name="text"> The text to transform. </param>
/// <returns> The transformed JSON text. </returns>
function DSLToolToJSON(text: string){
	text = text.replace(/[\\]+"/gi, '"');
	text = text.replace(/"\[\{/gi, "[{");
	text = text.replace(/\}\]"/gi, "}]");

	return text;
}

/// <summary> Converts JSON text to the DSLTools format. </summary>
/// <param name="json"> The JSON text to transform. </param>
/// <returns> The transformed text. </returns>
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

/// <summary> Serializes an object to the DSLTools format. </summary>
/// <param name="data"> The object to serialized. </param>
/// <param name="recursionLevel"> Allows the function to know how many backbars to add before a quote. </param>
/// <returns> The serialized object. </returns>
function DataToDSLTool(data: any, recursionLevel: number = 0) :string
{
	let output: string = "";

	if (Array.isArray(data)){
		output+="[";

		for (let i = 0; i < data.length; i++){
			output+=DataToDSLTool(data[i], recursionLevel)
			if (i < data.length - 1)
			{
				output+=",";
			}
		}

		output+="]"
	}
	else if (IsPrimitive(data))
	{
		output += data;
	}
	else
	{
		output += "{";
		for (let property in data){
			if (data.hasOwnProperty(property)) {
				output += BuildQuote(recursionLevel);
				output += property;
				output += BuildQuote(recursionLevel);
				output += ": ";	
				output += BuildQuote(recursionLevel);
				output += DataToDSLTool(data[property], recursionLevel + 1);
				output += BuildQuote(recursionLevel);
			}
			
			output += ","
		}

		output = output.substring(0, output.length - 1);
		output += "}";		
	}

	return output;
}

/// <summary> Creates a quote with as much backbars as needed. </summary>
/// <param name="recursionLevel"> The current recursion level. </param>
/// <returns> A string with the backbars and quote. </returns>
function BuildQuote(recursionLevel: number){
	return "\\".repeat(recursionLevel) + '"';
}

/// <summary> Checks if the given object is a primitive type. </summary>
/// <param name="test"> The object to check. </param>
/// <returns> True if it is a primitive, false otherwise. </returns>
function IsPrimitive(test: any) {
    return test !== Object(test);
}

// <summary> This method is called when the extension is deactivated. </summary>
export function deactivate() {}
