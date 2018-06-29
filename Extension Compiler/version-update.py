import json

moz_id = "{f9cacf2e-cafc-4f0f-b6ad-8e1a01b4b4d0}";

with open("updates.json", 'r') as v:
	data = v.read()
	info = json.loads(data)
	old_version = info["addons"][moz_id]["updates"][0]["version"]

	with open("../src/manifest.json", 'r') as f:
		new_version = json.load(f)["version"]

	data = data.replace(old_version, new_version)

with open("updates.json", 'w') as v:
	v.write(data)
