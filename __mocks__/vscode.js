
// https://www.richardkotze.com/coding/unit-test-mock-vs-code-extension-api-jest

const Uri = {
	file: f => f,
	parse: jest.fn(),
};

const vscode = {
	Uri,
};

module.exports = vscode;
