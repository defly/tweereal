var parser = function(chunk, buffer, handler) {
	var index, json;
	var delimiter = "\r\n";
	buffer += chunk.toString("utf8");
	while ((index = buffer.indexOf(delimiter)) !== -1) {
		json = buffer.slice(0, index);
		buffer = buffer.slice(index + delimiter.length);
		if (json.length > 0) handler(json);
	}
}

exports.parser = parser;