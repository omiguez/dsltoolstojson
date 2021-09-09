# dsltoolstojson README

This is a tool that allows us to easily convert the format used in the DSLTool tests to represent data, to and from JSON.

The JSON view has the advantages of allowing you to have a wider view of the data (without being limited to one object at a time), and be able to more freely remove or copy data.
This is is useful to inspect data when creating or reviewing a test case, cross reference data between two objects, or copy sections of the object to a different path of the same object.

## Usage

To convert to JSON: On the Command Palette, use the command "Convert DSLTool output to JSON". If the Language Mode selected for the current document is JSON, it will also format it.
To convert from JSON: On the Command Pallete, use the command "Convert JSON to DSLTool output".

If text is selected, only the selection will be transformed. Otherwise, the whole document will be transformed.